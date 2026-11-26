// Edge Function « localiser » (26/11/2026) : enregistre le pays et la ville APPROXIMATIFS du compte qui l'appelle.
// - Le jeu l'appelle avec le jeton du joueur connecté (JWT vérifié par Supabase). Les invités sont ignorés.
// - L'adresse IP vient de la session enregistrée par Supabase Auth (auth.sessions), pas d'un en-tête envoyé par le navigateur.
// - Géolocalisation : https://api.country.is (MaxMind GeoLite2 + Cloudflare, gratuit, 10 requêtes/s). Résultat approximatif.
// - Si l'IP n'a pas changé depuis la dernière localisation, aucun appel externe n'est fait.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const reponse = (corps: unknown, statut = 200) =>
  new Response(JSON.stringify(corps), { status: statut, headers: { ...CORS, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const jeton = (req.headers.get('Authorization') ?? '').replace(/^Bearer /i, '')
  const { data: u, error } = await admin.auth.getUser(jeton)
  if (error || !u?.user) return reponse({ ok: false, raison: 'non connecté' }, 401)
  if (u.user.is_anonymous) return reponse({ ok: false, raison: 'invité ignoré' })

  const { data: ip } = await admin.rpc('derniere_ip_session', { p_uid: u.user.id })
  if (!ip) return reponse({ ok: false, raison: 'pas d\'adresse IP' })

  const { data: ancienne } = await admin.from('localisation_compte').select('derniere_ip, pays').eq('user_id', u.user.id).maybeSingle()
  if (ancienne && ancienne.derniere_ip === ip && ancienne.pays) return reponse({ ok: true, inchange: true })

  let pays: string | null = null
  let ville: string | null = null
  try {
    const r = await fetch(`https://api.country.is/${encodeURIComponent(ip)}?fields=city`, { signal: AbortSignal.timeout(5000) })
    if (r.ok) {
      const j = await r.json()
      pays = typeof j.country === 'string' ? j.country.slice(0, 2) : null
      ville = typeof j.city === 'string' ? j.city.slice(0, 80) : null
    }
  } catch (_) { /* service indisponible : on réessaiera à la prochaine ouverture */ }

  // L'adresse IP est gardée même sans résultat, pour que la localisation puisse être refaite plus tard.
  const { error: e2 } = await admin.from('localisation_compte').upsert(
    { user_id: u.user.id, derniere_ip: ip, pays, ville, maj_le: new Date().toISOString() }, { onConflict: 'user_id' })
  if (e2) return reponse({ ok: false, raison: 'enregistrement impossible' }, 500)
  return reponse({ ok: true, pays, ville })
})
