export default async function handler(req, res) {
  await fetch(
    'https://tngqzkbgppfcshovdbmu.supabase.co/rest/v1/categories?select=id&limit=1',
    { headers: { apikey: process.env.SUPABASE_ANON_KEY } }
  );
  res.status(200).json({ ok: true });
}
