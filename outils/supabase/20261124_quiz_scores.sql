-- Mini-jeu « Quiz » Histoire / Géographie (demande de l'utilisateur du 24/11/2026).
-- Une ligne par partie terminée : matière, sous-matière (période d'Histoire ou famille de Géographie), niveau 1 à 10, score.
-- Niveaux 1 à 5 : 10 questions ; niveaux 6 à 10 : 15 questions (score sur 10 ou sur 15).
-- Appliqué au projet Supabase « ludo jeu » (migration « quiz_scores »). Copie gardée ici pour mémoire.
--
-- Le jeu n'écrit que par enregistrer_quiz() (avec le jeton du joueur connecté, invité compris) : la table n'a aucune règle
-- d'insertion directe. La fonction rend aussi la comparaison : parmi les AUTRES joueurs (compte + profil de joueur) qui ont
-- joué ce même quiz (même matière, sous-matière, niveau), la part dont le MEILLEUR score est strictement inférieur à celui-ci.
create table if not exists public.quiz_parties (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade, -- supprimé avec le compte
  joueur_id text not null default '',                                  -- profil de joueur du compte (« j-1 »…)
  matiere text not null check (matiere in ('histoire', 'geographie')),
  sous_matiere text not null,
  niveau smallint not null check (niveau between 1 and 10),
  nb_questions smallint not null check (nb_questions in (10, 15)),
  score smallint not null check (score >= 0),
  cree_le timestamptz not null default now(),
  check (score <= nb_questions),
  check (nb_questions = case when niveau <= 5 then 10 else 15 end),
  check ((matiere = 'histoire' and sous_matiere in ('pre', 'ant', 'mag', 'ren', 'mod', 'xix', 'xx'))
      or (matiere = 'geographie' and sous_matiere in ('france', 'cartes', 'monde', 'nature')))
);
create index if not exists quiz_parties_categorie on public.quiz_parties (matiere, sous_matiere, niveau, user_id, joueur_id);
alter table public.quiz_parties enable row level security;
drop policy if exists quiz_parties_lecture on public.quiz_parties;
create policy quiz_parties_lecture on public.quiz_parties for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.enregistrer_quiz(p_matiere text, p_sous_matiere text, p_niveau int, p_score int, p_joueur text default '')
returns jsonb language plpgsql security definer set search_path = '' as $f$
declare
  v_uid uuid := auth.uid();
  v_nb int := case when p_niveau <= 5 then 10 else 15 end;
  v_joueur text := left(coalesce(p_joueur, ''), 40);
  v_total int; v_battus int;
begin
  if v_uid is null then return null; end if;
  insert into public.quiz_parties (user_id, joueur_id, matiere, sous_matiere, niveau, nb_questions, score)
  values (v_uid, v_joueur, p_matiere, p_sous_matiere, p_niveau, v_nb, p_score);
  select count(*), count(*) filter (where meilleur < p_score) into v_total, v_battus
  from (select max(score) as meilleur from public.quiz_parties
        where matiere = p_matiere and sous_matiere = p_sous_matiere and niveau = p_niveau
          and not (user_id = v_uid and joueur_id = v_joueur)
        group by user_id, joueur_id) t;
  return jsonb_build_object('joueurs', v_total, 'battus', v_battus,
    'pourcentage', case when v_total > 0 then floor(100.0 * v_battus / v_total)::int else null end);
end
$f$;
revoke all on function public.enregistrer_quiz(text, text, int, int, text) from public, anon, authenticated;
grant execute on function public.enregistrer_quiz(text, text, int, int, text) to authenticated;

-- Consultation (SQL Editor seulement) : parties, score moyen et meilleur score par matière, sous-matière et niveau.
create or replace view public.quiz_stats with (security_invoker = false) as
  select matiere, sous_matiere, niveau, nb_questions, count(*) as parties,
         round(avg(score), 2) as score_moyen, max(score) as meilleur_score
  from public.quiz_parties group by matiere, sous_matiere, niveau, nb_questions
  order by matiere, sous_matiere, niveau;
revoke all on public.quiz_stats from public, anon, authenticated;
