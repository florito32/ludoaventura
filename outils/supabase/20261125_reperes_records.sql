-- Mini-jeu « Chasse aux lettres » (demande de l'utilisateur du 25/11/2026) : records par profil de joueur.
-- Une ligne par partie terminée : lettre cherchée, casse (maj / min / mix), style (imp / cur), lettres trouvées (score), erreurs.
-- Le record d'un profil est son meilleur score, toutes lettres confondues (choix de l'utilisateur). Pas de limite de quantité.
-- Appliqué au projet Supabase « ludo jeu » (migration « reperes_records »). Copie gardée ici pour mémoire.
--
-- Le jeu n'écrit que par enregistrer_reperes() et ne lit que par record_reperes(), avec le jeton du joueur connecté (invité compris) :
-- la table n'a aucune règle d'insertion directe. Le score est borné (0 à 1000) pour refuser les envois absurdes.
create table if not exists public.reperes_parties (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade, -- supprimé avec le compte
  joueur_id text not null default '',                                  -- profil de joueur du compte (« j-1 »…)
  lettre text not null check (lettre ~ '^[a-z]$'),
  casse text not null check (casse in ('maj', 'min', 'mix')),
  style text not null check (style in ('imp', 'cur')),
  score smallint not null check (score between 0 and 1000),
  erreurs smallint not null check (erreurs between 0 and 5000),
  cree_le timestamptz not null default now()
);
create index if not exists reperes_parties_joueur on public.reperes_parties (user_id, joueur_id, score desc);
alter table public.reperes_parties enable row level security;
drop policy if exists reperes_parties_lecture on public.reperes_parties;
create policy reperes_parties_lecture on public.reperes_parties for select to authenticated using (user_id = (select auth.uid()));

-- Enregistre la partie et rend { record_avant, record } : meilleur score du profil avant et après cette partie.
create or replace function public.enregistrer_reperes(p_score int, p_erreurs int, p_lettre text, p_casse text, p_style text, p_joueur text default '')
returns jsonb language plpgsql security definer set search_path = '' as $f$
declare
  v_uid uuid := auth.uid();
  v_joueur text := left(coalesce(p_joueur, ''), 40);
  v_avant int;
begin
  if v_uid is null then return null; end if;
  select coalesce(max(score), 0) into v_avant from public.reperes_parties where user_id = v_uid and joueur_id = v_joueur;
  insert into public.reperes_parties (user_id, joueur_id, lettre, casse, style, score, erreurs)
  values (v_uid, v_joueur, lower(p_lettre), p_casse, p_style, p_score, p_erreurs);
  return jsonb_build_object('record_avant', v_avant, 'record', greatest(v_avant, p_score));
end
$f$;
revoke all on function public.enregistrer_reperes(int, int, text, text, text, text) from public, anon, authenticated;
grant execute on function public.enregistrer_reperes(int, int, text, text, text, text) to authenticated;

-- Record du profil (0 s'il n'a pas encore joué) : affiché sur l'écran de préparation.
create or replace function public.record_reperes(p_joueur text default '')
returns int language sql stable security definer set search_path = '' as $f$
  select coalesce(max(score), 0)::int from public.reperes_parties where user_id = auth.uid() and joueur_id = left(coalesce(p_joueur, ''), 40)
$f$;
revoke all on function public.record_reperes(text) from public, anon, authenticated;
grant execute on function public.record_reperes(text) to authenticated;

-- Consultation (SQL Editor seulement) : parties, score moyen et meilleur score par lettre.
create or replace view public.reperes_stats with (security_invoker = false) as
  select lettre, count(*) as parties, round(avg(score), 2) as score_moyen, max(score) as meilleur_score
  from public.reperes_parties group by lettre order by lettre;
revoke all on public.reperes_stats from public, anon, authenticated;
