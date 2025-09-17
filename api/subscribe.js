// Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { email, website } = req.body || {};
  if (website) return res.status(200).json({ ok: true }); // honeypot: ignore bots
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });

  const key = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  const templateId = Number(process.env.BREVO_DOI_TEMPLATE_ID);
  const redirectUrl = process.env.BREVO_REDIRECT_URL; // e.g. https://your-app.vercel.app/confirmed.html

  try {
    const r = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'accept': 'application/json', 'api-key': key },
      body: JSON.stringify({
        email,
        includeListIds: [listId],
        templateId,
        redirectionUrl: redirectUrl,
        attributes: { SOURCE: 'landing-page' }
      })
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      return res.status(500).json({ error: 'Brevo error', detail: e });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
