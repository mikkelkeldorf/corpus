export default async function handler(req, res) {
  const email = (req.method === 'POST' ? req.body?.email : req.query?.email)?.trim();
  if (!email) return res.status(400).send('Missing email');
  try {
    const r = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
      body: JSON.stringify({ emailBlacklisted: true })
    });
    if (!r.ok) return res.status(500).send('Could not unsubscribe');
    res.status(200).send('You are unsubscribed.');
  } catch { res.status(500).send('Error'); }
}