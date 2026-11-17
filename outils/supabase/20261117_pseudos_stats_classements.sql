-- Pseudos, statistiques et classements (demande de l'utilisateur du 17/11/2026).
-- Appliqué au projet Supabase « ludo jeu » (migration « pseudos_stats_classements »). Copie gardée ici pour mémoire.
--
-- Choix de l'utilisateur (17/11/2026) :
--  - pseudo unique, 4 à 20 caractères : lettres (accents français compris), chiffres, « _ » et « - », sans espace ;
--    unicité sans tenir compte des majuscules ni des accents (Florian, florian et Florïan = même pseudo) ;
--  - compte Google : pseudo automatique « prénom + initiale du nom + 01 » (1er mot du nom complet = prénom, car Google ne
--    sépare pas prénom et nom ici), puis 02, 03… si pris ; compte e-mail sans pseudo : « Joueur01 », « Joueur02 »… ;
--  - pseudo automatique : le jeu propose d'en changer à la prochaine ouverture, tant que le joueur ne l'a pas changé
--    (colonne pseudo_auto) ; changement possible à tout moment dans « Mon compte » ;
--  - classements consultés dans Supabase seulement (pas d'écran dans le jeu) : étoiles de la semaine (lundi → dimanche),
--    du mois civil, et niveau général. Les pseudos restent privés : chaque joueur ne lit que ses propres lignes.
--
-- Qui écrit quoi : le jeu n'écrit que dans « progression » (comme avant). Un déclencheur recopie de là les totaux dans
-- « stats_joueur » et les étoiles de chaque jour dans « etoiles_jour ». Les pseudos passent par des fonctions
-- (mon_profil, changer_pseudo, pseudo_disponible) ; les joueurs n'ont aucun droit d'écriture direct sur les nouvelles tables.

-- ---------- Outils pour les pseudos ----------
-- Forme comparée pour l'unicité : sans accents, en minuscules (« œ » devient « oe »).
create or replace function public.pseudo_cle(p text)
returns text language sql immutable parallel safe set search_path = '' as $f$
  select lower(translate(replace(replace(p, 'œ', 'oe'), 'Œ', 'oe'),
    'àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝŸ',
    'aaaaaaceeeeiiiinooooouuuuyyaaaaaaceeeeiiiinooooouuuuyy'))
$f$;

-- Caractères permis : A-Z a-z 0-9 _ - et les lettres accentuées du français (œ, ñ, ÿ compris).
create or replace function public.pseudo_valide(p text)
returns boolean language sql immutable parallel safe set search_path = '' as $f$
  select p is not null and p ~ '^[A-Za-z0-9_àáâãäåçèéêëìíîïñòóôõöùúûüýÿœÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝŸŒ-]{4,20}$'
$f$;

-- Retire tout caractère non permis (sert à fabriquer le pseudo automatique).
create or replace function public.pseudo_nettoyer(p text)
returns text language sql immutable parallel safe set search_path = '' as $f$
  select regexp_replace(coalesce(p, ''), '[^A-Za-z0-9_àáâãäåçèéêëìíîïñòóôõöùúûüýÿœÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝŸŒ-]', '', 'g')
$f$;

-- ---------- Tables ----------
create table public.profils (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pseudo text not null,
  pseudo_cle text generated always as (public.pseudo_cle(pseudo)) stored,
  pseudo_auto boolean not null default true,
  cree_le timestamptz not null default now(),
  pseudo_modifie_le timestamptz not null default now(),
  constraint profils_pseudo_valide check (public.pseudo_valide(pseudo)),
  constraint profils_pseudo_cle_unique unique (pseudo_cle)
);
comment on table public.profils is 'Ludoaventura : pseudo du joueur (unique, 4 à 20 caractères). pseudo_auto = pseudo fabriqué par le jeu, que le joueur n''a pas encore changé.';
comment on column public.profils.pseudo_cle is 'Pseudo sans majuscules ni accents : sert à l''unicité.';

create table public.stats_joueur (
  user_id uuid primary key references auth.users (id) on delete cascade,
  etoiles_total integer not null default 0,
  niveau integer not null default 1,
  gemmes integer not null default 0,
  mis_a_jour timestamptz not null default now()
);
comment on table public.stats_joueur is 'Ludoaventura : étoiles cumulées (qui donnent le niveau) et pierres précieuses de chaque joueur, recopiées de « progression » par déclencheur.';

create table public.etoiles_jour (
  user_id uuid not null references auth.users (id) on delete cascade,
  jour date not null,
  etoiles integer not null default 0,
  gemmes integer not null default 0,
  primary key (user_id, jour)
);
create index etoiles_jour_par_jour on public.etoiles_jour (jour);
comment on table public.etoiles_jour is 'Ludoaventura : étoiles gagnées par jour (jour du téléphone du joueur) et pierres gagnées entre deux sauvegardes (rangées au jour de la sauvegarde).';

-- Sécurité par ligne : chacun ne lit que ses propres lignes ; aucune écriture directe par les joueurs.
alter table public.profils enable row level security;
alter table public.stats_joueur enable row level security;
alter table public.etoiles_jour enable row level security;
revoke all on public.profils, public.stats_joueur, public.etoiles_jour from anon, authenticated;
grant select on public.profils, public.stats_joueur, public.etoiles_jour to authenticated;
create policy "lire son profil" on public.profils for select to authenticated using ((select auth.uid()) = user_id);
create policy "lire ses statistiques" on public.stats_joueur for select to authenticated using ((select auth.uid()) = user_id);
create policy "lire ses étoiles par jour" on public.etoiles_jour for select to authenticated using ((select auth.uid()) = user_id);

-- ---------- Pseudo automatique et création du profil ----------
-- Pseudo automatique : prénom + initiale du nom + numéro à 2 chiffres (01, 02…), le premier libre à partir de p_depart.
-- Google transmet given_name / family_name s'ils existent ; sinon le 1er mot du nom complet est le prénom et le dernier
-- mot donne l'initiale. Sans prénom exploitable : « Joueur01 ».
create or replace function public.pseudo_auto_pour(p_meta jsonb, p_depart integer default 1)
returns text language plpgsql set search_path = '' as $f$
declare
  v_prenom text := nullif(btrim(coalesce(p_meta->>'given_name', '')), '');
  v_nom text := nullif(btrim(coalesce(p_meta->>'family_name', '')), '');
  v_complet text;
  v_mots text[];
  v_initiale text;
  v_n integer := greatest(coalesce(p_depart, 1), 1);
  v_num text;
  v_cand text;
begin
  if v_prenom is null then
    v_complet := btrim(coalesce(p_meta->>'full_name', p_meta->>'name', ''));
    if v_complet <> '' then
      v_mots := regexp_split_to_array(v_complet, '\s+');
      v_prenom := v_mots[1];
      if array_length(v_mots, 1) > 1 then v_nom := v_mots[array_length(v_mots, 1)]; end if;
    end if;
  end if;
  v_prenom := public.pseudo_nettoyer(v_prenom);
  v_initiale := upper(left(public.pseudo_nettoyer(v_nom), 1));
  if char_length(v_prenom) + char_length(v_initiale) < 2 then v_prenom := 'Joueur'; v_initiale := ''; end if;
  loop
    v_num := lpad(v_n::text, 2, '0');
    v_cand := left(v_prenom, 20 - char_length(v_initiale) - char_length(v_num)) || v_initiale || v_num;
    if public.pseudo_valide(v_cand)
       and not exists (select 1 from public.profils where pseudo_cle = public.pseudo_cle(v_cand)) then
      return v_cand;
    end if;
    v_n := v_n + 1;
    if v_n > 99999 then raise exception 'aucun pseudo automatique disponible'; end if;
  end loop;
end
$f$;

-- Crée le profil d'un compte : le pseudo choisi à l'inscription (métadonnée « pseudo ») s'il est valide et libre,
-- sinon le pseudo automatique. Ne fait rien si le profil existe déjà.
create or replace function public.profil_creer(p_uid uuid, p_meta jsonb, p_cree timestamptz default now())
returns public.profils language plpgsql set search_path = '' as $f$
declare
  v_choisi text := nullif(btrim(coalesce(p_meta->>'pseudo', '')), '');
  v_essai integer := 0;
  v_ligne public.profils;
begin
  select * into v_ligne from public.profils where user_id = p_uid;
  if found then return v_ligne; end if;
  if v_choisi is not null and public.pseudo_valide(v_choisi) then
    begin
      insert into public.profils (user_id, pseudo, pseudo_auto, cree_le) values (p_uid, v_choisi, false, p_cree) returning * into v_ligne;
      return v_ligne;
    exception when unique_violation then
      null; -- pris entre-temps : pseudo automatique à la place
    end;
  end if;
  loop
    v_essai := v_essai + 1;
    begin
      insert into public.profils (user_id, pseudo, pseudo_auto, cree_le)
      values (p_uid, public.pseudo_auto_pour(p_meta, v_essai), true, p_cree) returning * into v_ligne;
      return v_ligne;
    exception when unique_violation then
      if v_essai >= 50 then raise; end if;
    end;
  end loop;
end
$f$;

-- À chaque nouveau compte (Google ou e-mail) : profil créé tout de suite. Ne bloque jamais l'inscription :
-- si quelque chose échoue, mon_profil() recrée le profil à la première ouverture.
create or replace function public.creer_profil()
returns trigger language plpgsql security definer set search_path = '' as $f$
begin
  begin
    perform public.profil_creer(new.id, new.raw_user_meta_data, now());
  exception when others then
    raise warning 'profil non créé pour % : %', new.id, sqlerrm;
  end;
  return new;
end
$f$;
create trigger creer_profil_a_l_inscription after insert on auth.users for each row execute function public.creer_profil();

-- ---------- Fonctions appelées par le jeu ----------
-- Pseudo libre ? 'ok' | 'invalide' | 'pris' (le pseudo du joueur connecté lui-même compte comme libre).
create or replace function public.pseudo_disponible(p_pseudo text)
returns text language plpgsql stable security definer set search_path = '' as $f$
declare v_p text := btrim(coalesce(p_pseudo, ''));
begin
  if not public.pseudo_valide(v_p) then return 'invalide'; end if;
  if exists (select 1 from public.profils where pseudo_cle = public.pseudo_cle(v_p) and user_id is distinct from auth.uid()) then
    return 'pris';
  end if;
  return 'ok';
end
$f$;

-- Profil du joueur connecté (créé s'il manque) : { pseudo, pseudo_auto, a_proposer }.
-- a_proposer : le pseudo est automatique ET le compte a plus de 10 minutes (on ne le propose pas pendant la création).
create or replace function public.mon_profil()
returns jsonb language plpgsql security definer set search_path = '' as $f$
declare v_uid uuid := auth.uid(); v_ligne public.profils; v_meta jsonb;
begin
  if v_uid is null then return null; end if;
  select * into v_ligne from public.profils where user_id = v_uid;
  if not found then
    select raw_user_meta_data into v_meta from auth.users where id = v_uid;
    v_ligne := public.profil_creer(v_uid, v_meta, now());
  end if;
  return jsonb_build_object('pseudo', v_ligne.pseudo, 'pseudo_auto', v_ligne.pseudo_auto,
    'a_proposer', v_ligne.pseudo_auto and v_ligne.cree_le < now() - interval '10 minutes');
end
$f$;

-- Change le pseudo du joueur connecté : { ok: true, pseudo } ou { ok: false, raison: invalide | pris | identique | non_connecte }.
-- « identique » : le pseudo automatique retapé tel quel ne compte pas comme un changement (on le proposera encore).
create or replace function public.changer_pseudo(p_pseudo text)
returns jsonb language plpgsql security definer set search_path = '' as $f$
declare v_uid uuid := auth.uid(); v_p text := btrim(coalesce(p_pseudo, '')); v_actuel public.profils; v_meta jsonb;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'raison', 'non_connecte'); end if;
  if not public.pseudo_valide(v_p) then return jsonb_build_object('ok', false, 'raison', 'invalide'); end if;
  select * into v_actuel from public.profils where user_id = v_uid;
  if not found then
    select raw_user_meta_data into v_meta from auth.users where id = v_uid;
    v_actuel := public.profil_creer(v_uid, v_meta, now());
  end if;
  if v_actuel.pseudo_auto and public.pseudo_cle(v_p) = v_actuel.pseudo_cle then
    return jsonb_build_object('ok', false, 'raison', 'identique');
  end if;
  begin
    update public.profils set pseudo = v_p, pseudo_auto = false, pseudo_modifie_le = now() where user_id = v_uid;
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'raison', 'pris');
  end;
  return jsonb_build_object('ok', true, 'pseudo', v_p);
end
$f$;

-- ---------- Statistiques recopiées de « progression » ----------
-- Entier positif tiré d'une valeur JSON (0 si ce n'est pas un nombre ; plafonné à 1 milliard).
create or replace function public.entier_json(j jsonb)
returns integer language sql immutable set search_path = '' as $f$
  select case when jsonb_typeof(j) = 'number'
    then least(greatest(floor((j #>> '{}')::numeric), 0), 1000000000)::integer else 0 end
$f$;

-- Niveau atteint avec ce total d'étoiles : même règle que js/etoiles.js (niveau L atteint à 5·(L−1)·(L+4) étoiles).
create or replace function public.niveau_pour(p_total integer)
returns integer language plpgsql immutable set search_path = '' as $f$
declare v_l integer := greatest(1, floor((-3 + sqrt(25 + 0.8 * greatest(p_total, 0))) / 2)::integer);
begin
  while 5 * v_l * (v_l + 5) <= p_total loop v_l := v_l + 1; end loop;
  while v_l > 1 and 5 * (v_l - 1) * (v_l + 4) > p_total loop v_l := v_l - 1; end loop;
  return v_l;
end
$f$;

-- À chaque sauvegarde de la progression : met à jour les totaux, et les étoiles de chaque jour (jamais à la baisse).
-- Les pierres gagnées depuis la sauvegarde précédente sont rangées au jour de la sauvegarde (heure de Paris) ;
-- la toute première sauvegarde ne sert que de point de départ.
-- Ne doit jamais empêcher la sauvegarde du joueur : les jours invalides sont ignorés.
create or replace function public.maj_stats_progression()
returns trigger language plpgsql security definer set search_path = '' as $f$
declare
  v_d jsonb := coalesce(new.donnees, '{}'::jsonb);
  v_total integer := public.entier_json(v_d->'total');
  v_gemmes integer := public.entier_json(v_d->'gemmes');
  v_avant public.stats_joueur;
  v_aujourdhui date := (now() at time zone 'Europe/Paris')::date;
  v_cle text;
  v_val jsonb;
  v_jour date;
begin
  select * into v_avant from public.stats_joueur where user_id = new.user_id;
  insert into public.stats_joueur (user_id, etoiles_total, niveau, gemmes, mis_a_jour)
  values (new.user_id, v_total, public.niveau_pour(v_total), v_gemmes, now())
  on conflict (user_id) do update
    set etoiles_total = excluded.etoiles_total, niveau = excluded.niveau, gemmes = excluded.gemmes, mis_a_jour = excluded.mis_a_jour;
  if v_avant.user_id is not null and v_gemmes > v_avant.gemmes then
    insert into public.etoiles_jour (user_id, jour, etoiles, gemmes) values (new.user_id, v_aujourdhui, 0, v_gemmes - v_avant.gemmes)
    on conflict (user_id, jour) do update set gemmes = public.etoiles_jour.gemmes + excluded.gemmes;
  end if;
  if jsonb_typeof(v_d->'parJour') = 'object' then
    for v_cle, v_val in select key, value from jsonb_each(v_d->'parJour') limit 400 loop
      if v_cle ~ '^\d{4}-\d{2}-\d{2}$' and public.entier_json(v_val) > 0 then
        begin
          v_jour := v_cle::date;
          if v_jour between v_aujourdhui - 400 and v_aujourdhui + 1 then
            insert into public.etoiles_jour (user_id, jour, etoiles) values (new.user_id, v_jour, public.entier_json(v_val))
            on conflict (user_id, jour) do update set etoiles = greatest(public.etoiles_jour.etoiles, excluded.etoiles);
          end if;
        exception when datetime_field_overflow or invalid_datetime_format then
          null; -- jour impossible (ex. 2026-13-45) : ignoré
        end;
      end if;
    end loop;
  end if;
  return new;
end
$f$;
create trigger stats_apres_progression after insert or update of donnees on public.progression
  for each row execute function public.maj_stats_progression();

-- ---------- Classements (à consulter dans Supabase) ----------
-- Étoiles gagnées entre deux jours (inclus) : rang (ex æquo = même rang), pseudo, étoiles, pierres, niveau.
-- Exemple, le mois dernier : select * from public.classement_etoiles('2026-10-01', '2026-10-31');
create or replace function public.classement_etoiles(p_debut date, p_fin date)
returns table (rang bigint, pseudo text, etoiles integer, gemmes integer, niveau integer, user_id uuid)
language sql stable set search_path = '' as $f$
  select rank() over (order by sum(e.etoiles) desc), p.pseudo, sum(e.etoiles)::integer, sum(e.gemmes)::integer,
         coalesce(s.niveau, 1), p.user_id
  from public.etoiles_jour e
  join public.profils p on p.user_id = e.user_id
  left join public.stats_joueur s on s.user_id = e.user_id
  where e.jour between p_debut and p_fin
  group by p.user_id, p.pseudo, s.niveau
  having sum(e.etoiles) > 0
  order by 1, p.pseudo
$f$;

-- Semaine en cours (du lundi à aujourd'hui, heure de Paris).
create or replace view public.classement_semaine with (security_invoker = true) as
  select * from public.classement_etoiles(date_trunc('week', now() at time zone 'Europe/Paris')::date, (now() at time zone 'Europe/Paris')::date);
-- Mois civil en cours.
create or replace view public.classement_mois with (security_invoker = true) as
  select * from public.classement_etoiles(date_trunc('month', now() at time zone 'Europe/Paris')::date, (now() at time zone 'Europe/Paris')::date);
-- Niveau général : étoiles cumulées depuis le début.
create or replace view public.classement_general with (security_invoker = true) as
  select rank() over (order by s.etoiles_total desc) as rang, p.pseudo, s.niveau, s.etoiles_total, s.gemmes, p.user_id
  from public.stats_joueur s
  join public.profils p on p.user_id = s.user_id
  order by rang, p.pseudo;
comment on view public.classement_semaine is 'Étoiles gagnées cette semaine (lundi → aujourd''hui). Consultable dans Supabase seulement.';
comment on view public.classement_mois is 'Étoiles gagnées ce mois-ci. Consultable dans Supabase seulement.';
comment on view public.classement_general is 'Niveau et étoiles cumulées de tous les joueurs. Consultable dans Supabase seulement.';
revoke all on public.classement_semaine, public.classement_mois, public.classement_general from anon, authenticated;

-- ---------- Droits d'appel des fonctions ----------
revoke all on function
  public.pseudo_cle(text), public.pseudo_valide(text), public.pseudo_nettoyer(text), public.pseudo_auto_pour(jsonb, integer),
  public.profil_creer(uuid, jsonb, timestamptz), public.creer_profil(), public.entier_json(jsonb), public.niveau_pour(integer),
  public.maj_stats_progression(), public.classement_etoiles(date, date)
  from public, anon, authenticated;
revoke all on function public.pseudo_disponible(text), public.mon_profil(), public.changer_pseudo(text) from public, anon, authenticated;
grant execute on function public.pseudo_disponible(text) to anon, authenticated;
grant execute on function public.mon_profil(), public.changer_pseudo(text) to authenticated;

-- ---------- Comptes et progressions déjà existants ----------
-- Profil automatique pour chaque compte déjà créé (date de création du compte conservée).
do $f$
declare u record;
begin
  for u in select id, raw_user_meta_data, created_at from auth.users order by created_at loop
    perform public.profil_creer(u.id, u.raw_user_meta_data, u.created_at);
  end loop;
end
$f$;
-- Statistiques des progressions déjà sauvegardées (le déclencheur se lance sur la colonne « donnees »).
update public.progression set donnees = donnees where true;
