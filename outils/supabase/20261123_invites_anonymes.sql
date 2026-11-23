-- Joueurs invités (demande de l'utilisateur du 23/11/2026).
-- Appliqué au projet Supabase « ludo jeu » (migration « invites_anonymes »). Copie gardée ici pour mémoire.
--
-- Principe : « Jouer en invité » crée une connexion anonyme Supabase (Authentication › Users : ligne SANS adresse e-mail,
-- fournisseur « Anonymous », colonne is_anonymous = vrai). Le jeu sauvegarde la progression de l'invité comme celle d'un compte.
-- Pseudo : « invité » + numéro à 4 chiffres (invité0001, invité0002…), dans l'ordre d'arrivée, jamais réutilisé.
-- Quand l'invité crée un compte (ou se connecte), le jeu fusionne sa progression dans le compte (js/compte.js), puis appelle
-- supprimer_invite() : la ligne invité disparaît (et avec elle son profil, ses statistiques, sa progression) : pas de doublon.
-- Un invité n'est jamais invité à « choisir son pseudo » (a_proposer = faux).
-- Réglage à faire dans le tableau de bord (impossible en SQL) : Authentication › Sign In / Providers › « Allow anonymous sign-ins ».

-- ---------- Numérotation des invités ----------
create sequence if not exists public.invite_numero_seq as integer minvalue 1 start 1;
revoke all on sequence public.invite_numero_seq from public, anon, authenticated;

-- ---------- Création du profil : invité = pseudo « invité0001 » ----------
-- Même signature qu'avant : le déclencheur creer_profil() et les fonctions mon_profil() / changer_pseudo() en profitent.
create or replace function public.profil_creer(p_uid uuid, p_meta jsonb, p_cree timestamptz default now())
returns public.profils language plpgsql set search_path = '' as $f$
declare
  v_choisi text := nullif(btrim(coalesce(p_meta->>'pseudo', '')), '');
  v_essai integer := 0;
  v_ligne public.profils;
  v_anonyme boolean;
  v_pseudo text;
begin
  select * into v_ligne from public.profils where user_id = p_uid;
  if found then return v_ligne; end if;
  select coalesce(u.is_anonymous, false) into v_anonyme from auth.users u where u.id = p_uid;
  if coalesce(v_anonyme, false) then
    -- Invité : « invité » + numéro à 4 chiffres ; on saute un numéro dont le pseudo serait déjà pris (par ex. « invite0007 » choisi par un joueur).
    loop
      v_essai := v_essai + 1;
      v_pseudo := 'invité' || lpad(nextval('public.invite_numero_seq')::text, 4, '0');
      begin
        insert into public.profils (user_id, pseudo, pseudo_auto, cree_le) values (p_uid, v_pseudo, true, p_cree) returning * into v_ligne;
        return v_ligne;
      exception when unique_violation then
        if v_essai >= 50 then raise; end if;
      end;
    end loop;
  end if;
  if v_choisi is not null and public.pseudo_valide(v_choisi) then
    begin
      insert into public.profils (user_id, pseudo, pseudo_auto, cree_le) values (p_uid, v_choisi, false, p_cree) returning * into v_ligne;
      return v_ligne;
    exception when unique_violation then
      null; -- pris entre-temps : pseudo automatique à la place
    end;
  end if;
  v_essai := 0;
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

-- ---------- Profil du joueur connecté : ajoute « invite » et ne propose jamais de changer le pseudo d'un invité ----------
create or replace function public.mon_profil()
returns jsonb language plpgsql security definer set search_path = '' as $f$
declare v_uid uuid := auth.uid(); v_ligne public.profils; v_meta jsonb; v_anonyme boolean;
begin
  if v_uid is null then return null; end if;
  select raw_user_meta_data, coalesce(is_anonymous, false) into v_meta, v_anonyme from auth.users where id = v_uid;
  select * into v_ligne from public.profils where user_id = v_uid;
  if not found then v_ligne := public.profil_creer(v_uid, v_meta, now()); end if;
  return jsonb_build_object('pseudo', v_ligne.pseudo, 'pseudo_auto', v_ligne.pseudo_auto,
    'a_proposer', v_ligne.pseudo_auto and not coalesce(v_anonyme, false) and v_ligne.cree_le < now() - interval '10 minutes',
    'invite', coalesce(v_anonyme, false));
end
$f$;

-- ---------- Suppression de l'invité (appelée par le jeu avec le jeton de l'invité, une fois sa progression passée au compte) ----------
-- Ne supprime QUE le compte de l'appelant, et seulement s'il est anonyme : un vrai compte ne peut jamais être supprimé par là.
create or replace function public.supprimer_invite()
returns boolean language plpgsql security definer set search_path = '' as $f$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then return false; end if;
  delete from auth.users where id = v_uid and is_anonymous;
  return found;
end
$f$;

revoke all on function public.profil_creer(uuid, jsonb, timestamptz) from public, anon, authenticated;
revoke all on function public.mon_profil(), public.supprimer_invite() from public, anon, authenticated;
grant execute on function public.mon_profil(), public.supprimer_invite() to authenticated;
