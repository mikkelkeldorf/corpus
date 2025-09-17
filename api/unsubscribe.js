export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, website } = req.body || {};
  if (website) return res.status(200).json({ ok: true }); // honeypot
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email' });

  const key = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);

  // Light consent audit trail
  const ua = req.headers['user-agent'] || '';
  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0] || req.socket?.remoteAddress || '';

  try {
    // Create or update the contact and add to list (single opt-in)
    const r = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'api-key': key
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
        attributes: {
          SOURCE: 'landing-page',
          CONSENT_TS: new Date().toISOString(),
          CONSENT_TEXT: 'Agreed to receive one quote on weekdays at 08:00.',
          UA: ua,
          IP: ip
        }
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
