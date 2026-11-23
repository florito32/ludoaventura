-- Suppression du compte par son propriétaire (demande de l'utilisateur du 23/11/2026, onglet « Confidentialité et RGPD »).
-- Appliqué au projet Supabase « ludo jeu » (migration « supprimer_mon_compte »). Copie gardée ici pour mémoire.
--
-- Le jeu appelle supprimer_mon_compte() avec le jeton du joueur connecté, après une confirmation. La fonction ne supprime QUE le
-- compte de l'appelant (auth.uid()) : sa ligne dans Authentication › Users, et ses lignes des tables du jeu (progression,
-- profils, stats_joueur, etoiles_jour). Le pseudo est ainsi libéré. Elle sert aussi aux invités (connexion anonyme).
create or replace function public.supprimer_mon_compte()
returns boolean language plpgsql security definer set search_path = '' as $f$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then return false; end if;
  delete from public.etoiles_jour where user_id = v_uid;
  delete from public.stats_joueur where user_id = v_uid;
  delete from public.progression where user_id = v_uid;
  delete from public.profils where user_id = v_uid;
  delete from auth.users where id = v_uid;
  return found;
end
$f$;

revoke all on function public.supprimer_mon_compte() from public, anon, authenticated;
grant execute on function public.supprimer_mon_compte() to authenticated;
