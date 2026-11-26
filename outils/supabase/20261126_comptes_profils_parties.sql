-- Ludoaventura — comptes, profils joueurs, parties datées (26/11/2026)
-- Un COMPTE = une ligne de auth.users (adresse e-mail, Google, ou ancien invité sans e-mail).
-- Un compte contient plusieurs PROFILS de joueurs (Joueur 1, Laumau…), rangés dans « profils_joueurs ».
-- À consulter dans Supabase › Table Editor › vues « comptes » et « profils_par_compte ».
-- Rien de tout cela n'est lisible depuis le jeu (aucun droit accordé à anon / authenticated).

-- ---------- Profils des joueurs (copie de progression.donnees->'joueurs') ----------
create table if not exists public.profils_joueurs (
  user_id uuid not null references auth.users(id) on delete cascade,
  joueur_id text not null,                 -- identifiant dans le jeu (j-1, j-2…)
  nom text not null default '',
  parties_jouees integer not null default 0, -- somme des « parties jouées » de toutes les matières de ce profil
  cree_le timestamptz,                     -- date de création donnée par le jeu (peut manquer)
  maj_le timestamptz not null default now(),
  primary key (user_id, joueur_id)
);
comment on table public.profils_joueurs is 'Ludoaventura : profils de joueurs de chaque compte, recopiés de progression par déclencheur. Un compte (auth.users) a plusieurs profils.';

-- ---------- Parties terminées par jour (heure de Paris) ----------
-- La ligne du 1970-01-01 = parties jouées AVANT la mise en place du suivi (sans date connue).
create table if not exists public.parties_jour (
  user_id uuid not null references auth.users(id) on delete cascade,
  jour date not null,
  parties integer not null default 0,
  primary key (user_id, jour)
);
create index if not exists parties_jour_par_jour on public.parties_jour (jour);
comment on table public.parties_jour is 'Ludoaventura : parties terminées par compte et par jour (Paris). jour = 1970-01-01 : parties d''avant le suivi, sans date.';

-- ---------- Localisation approximative du compte (remplie plus tard par une fonction serveur) ----------
create table if not exists public.localisation_compte (
  user_id uuid primary key references auth.users(id) on delete cascade,
  derniere_ip inet,
  pays text,
  ville text,
  maj_le timestamptz not null default now()
);
comment on table public.localisation_compte is 'Ludoaventura : pays et ville approximatifs (géolocalisation de l''adresse IP de la dernière connexion).';

alter table public.profils_joueurs enable row level security;
alter table public.parties_jour enable row level security;
alter table public.localisation_compte enable row level security;
revoke all on public.profils_joueurs, public.parties_jour, public.localisation_compte from anon, authenticated;

-- ---------- Fonctions ----------
-- Somme des « parties jouées » (1er nombre de j.st[matière]) de tous les profils d'une progression.
create or replace function public.parties_dans_progression(p_d jsonb)
returns integer language sql immutable set search_path = '' as $f$
  select least(coalesce(sum(public.entier_json(m.value -> 0)), 0), 1000000000)::integer
  from jsonb_array_elements(case when jsonb_typeof(p_d -> 'joueurs') = 'array' then p_d -> 'joueurs' else '[]'::jsonb end) j,
       jsonb_each(case when jsonb_typeof(j -> 'st') = 'object' then j -> 'st' else '{}'::jsonb end) m
  where jsonb_typeof(m.value) = 'array'
$f$;

create or replace function public.ajouter_parties(p_uid uuid, p_jour date, p_n integer)
returns void language sql security definer set search_path = '' as $f$
  insert into public.parties_jour (user_id, jour, parties) values (p_uid, p_jour, p_n)
  on conflict (user_id, jour) do update set parties = public.parties_jour.parties + excluded.parties
$f$;
revoke all on function public.parties_dans_progression(jsonb), public.ajouter_parties(uuid, date, integer) from public, anon, authenticated;

-- Déclencheur : à chaque sauvegarde de progression, recopie les profils et compte les parties gagnées depuis la sauvegarde précédente.
-- Ne doit JAMAIS empêcher la sauvegarde du joueur : toute erreur est ignorée.
create or replace function public.maj_profils_parties()
returns trigger language plpgsql security definer set search_path = '' as $f$
declare
  v_d jsonb := coalesce(new.donnees, '{}'::jsonb);
  v_aujourdhui date := (now() at time zone 'Europe/Paris')::date;
  v_apres integer := public.parties_dans_progression(v_d);
  v_avant integer;
  v_ids text[] := '{}';
  j jsonb;
  v_id text;
  v_cree timestamptz;
begin
  begin
    if jsonb_typeof(v_d -> 'joueurs') = 'array' then
      for j in select value from jsonb_array_elements(v_d -> 'joueurs') limit 50 loop
        v_id := left(coalesce(j ->> 'id', ''), 40);
        continue when v_id = '';
        v_ids := v_ids || v_id;
        begin v_cree := (j ->> 'cree')::timestamptz; exception when others then v_cree := null; end;
        insert into public.profils_joueurs (user_id, joueur_id, nom, parties_jouees, cree_le, maj_le)
        values (new.user_id, v_id, left(coalesce(j ->> 'nom', ''), 60),
                public.parties_dans_progression(jsonb_build_object('joueurs', jsonb_build_array(j))), v_cree, now())
        on conflict (user_id, joueur_id) do update
          set nom = excluded.nom, parties_jouees = excluded.parties_jouees,
              cree_le = coalesce(excluded.cree_le, public.profils_joueurs.cree_le), maj_le = now();
      end loop;
    end if;
    delete from public.profils_joueurs where user_id = new.user_id and not (joueur_id = any (v_ids));

    if tg_op = 'INSERT' then
      -- première sauvegarde du compte : tout l'existant va dans « avant le suivi »
      if v_apres > 0 then perform public.ajouter_parties(new.user_id, date '1970-01-01', v_apres); end if;
    else
      v_avant := public.parties_dans_progression(coalesce(old.donnees, '{}'::jsonb));
      if v_apres > v_avant then perform public.ajouter_parties(new.user_id, v_aujourdhui, v_apres - v_avant); end if;
    end if;
  exception when others then
    null;
  end;
  return new;
end
$f$;
drop trigger if exists profils_parties_apres_progression on public.progression;
create trigger profils_parties_apres_progression after insert or update of donnees on public.progression
  for each row execute function public.maj_profils_parties();

-- Les mini-jeux Quiz et Chasse aux lettres ont leurs propres tables datées : chaque partie enregistrée compte pour 1.
create or replace function public.compter_partie_minijeu()
returns trigger language plpgsql security definer set search_path = '' as $f$
begin
  begin
    perform public.ajouter_parties(new.user_id, (new.cree_le at time zone 'Europe/Paris')::date, 1);
  exception when others then
    null;
  end;
  return new;
end
$f$;
drop trigger if exists compter_apres_quiz on public.quiz_parties;
create trigger compter_apres_quiz after insert on public.quiz_parties for each row execute function public.compter_partie_minijeu();
drop trigger if exists compter_apres_reperes on public.reperes_parties;
create trigger compter_apres_reperes after insert on public.reperes_parties for each row execute function public.compter_partie_minijeu();

-- ---------- Rattrapage des comptes existants ----------
insert into public.profils_joueurs (user_id, joueur_id, nom, parties_jouees, cree_le)
select p.user_id, left(j ->> 'id', 40), left(coalesce(j ->> 'nom', ''), 60),
       public.parties_dans_progression(jsonb_build_object('joueurs', jsonb_build_array(j))),
       case when (j ->> 'cree') ~ '^\d{4}-\d{2}-\d{2}' then (j ->> 'cree')::timestamptz end
from public.progression p, jsonb_array_elements(case when jsonb_typeof(p.donnees -> 'joueurs') = 'array' then p.donnees -> 'joueurs' else '[]'::jsonb end) j
where coalesce(j ->> 'id', '') <> ''
on conflict (user_id, joueur_id) do nothing;

insert into public.parties_jour (user_id, jour, parties)
select user_id, date '1970-01-01', public.parties_dans_progression(donnees) from public.progression
where public.parties_dans_progression(donnees) > 0
on conflict (user_id, jour) do nothing;

insert into public.parties_jour (user_id, jour, parties)
select user_id, (cree_le at time zone 'Europe/Paris')::date, count(*) from (
  select user_id, cree_le from public.quiz_parties union all select user_id, cree_le from public.reperes_parties
) x group by 1, 2
on conflict (user_id, jour) do update set parties = public.parties_jour.parties + excluded.parties;

-- ---------- Vues à consulter ----------
create or replace view public.comptes as
select
  u.id as user_id,
  case when u.is_anonymous then 'ancien invité'
       when u.raw_app_meta_data ->> 'provider' = 'google' then 'Google'
       else 'e-mail' end as type_compte,
  u.email,
  pr.pseudo,
  u.created_at as cree_le,
  u.last_sign_in_at as derniere_connexion,
  g.mis_a_jour as derniere_sauvegarde,
  coalesce(n.nb, 0) as nb_profils,
  n.noms as profils,
  coalesce(pa.total, 0) as parties_total,
  coalesce(pa.aujourdhui, 0) as parties_aujourdhui,
  coalesce(pa.ce_mois, 0) as parties_ce_mois,
  l.pays, l.ville, l.maj_le as localise_le
from auth.users u
left join public.profils pr on pr.user_id = u.id
left join public.progression g on g.user_id = u.id
left join public.localisation_compte l on l.user_id = u.id
left join lateral (
  select count(*) as nb, string_agg(nom, ', ' order by joueur_id) as noms from public.profils_joueurs where user_id = u.id
) n on true
left join lateral (
  select sum(parties) as total,
         sum(parties) filter (where jour = (now() at time zone 'Europe/Paris')::date) as aujourdhui,
         sum(parties) filter (where jour >= date_trunc('month', now() at time zone 'Europe/Paris')::date) as ce_mois
  from public.parties_jour where user_id = u.id
) pa on true
order by u.created_at desc;
comment on view public.comptes is 'Ludoaventura : un compte par ligne (e-mail, type, dernière connexion, nombre de profils, parties total / aujourd''hui / ce mois, pays et ville).';

create or replace view public.profils_par_compte as
select u.email, pr.pseudo as pseudo_compte, case when u.is_anonymous then 'ancien invité' else 'compte' end as type_compte,
       j.user_id, j.joueur_id, j.nom as profil, j.parties_jouees, j.cree_le, j.maj_le
from public.profils_joueurs j
join auth.users u on u.id = j.user_id
left join public.profils pr on pr.user_id = j.user_id
order by u.created_at desc, j.joueur_id;
comment on view public.profils_par_compte is 'Ludoaventura : un profil de joueur par ligne, avec le compte (e-mail) auquel il appartient.';

revoke all on public.comptes, public.profils_par_compte from anon, authenticated;

-- ---------- Partie 2 : sécurité des déclencheurs et localisation ----------
revoke execute on function public.maj_profils_parties(), public.compter_partie_minijeu() from public, anon, authenticated;

-- Dernière adresse IP connue d'un compte (session Supabase Auth). Réservée à la fonction serveur « localiser » (service_role).
create or replace function public.derniere_ip_session(p_uid uuid)
returns text language sql stable security definer set search_path = '' as $f$
  select host(s.ip) from auth.sessions s where s.user_id = p_uid and s.ip is not null
  order by greatest(s.created_at, coalesce(s.refreshed_at, s.created_at), coalesce(s.updated_at, s.created_at)) desc limit 1
$f$;
revoke all on function public.derniere_ip_session(uuid) from public, anon, authenticated;
grant execute on function public.derniere_ip_session(uuid) to service_role;
-- La fonction serveur est dans outils/supabase/fonctions/localiser/index.ts (déployée : « localiser », JWT vérifié).
