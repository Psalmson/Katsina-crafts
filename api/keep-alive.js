export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://tngqzkbgppfcshovdbmu.supabase.co/rest/v1/categories?select=id&limit=1',
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );
    res.status(200).json({ ok: true, status: response.status });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
