module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).end();

  const token = process.env.GH_TOKEN;
  if (!token) return res.status(500).json({ error: 'Server not configured' });

  const API = 'https://api.github.com/repos/ceohabitsdaily-star/pure-fabrication/contents/data/enquiries.json';

  try {
    const r = await fetch(API, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache'
      }
    });
    if (r.status === 404) return res.status(200).json([]);
    if (!r.ok) return res.status(r.status).json({ error: 'GitHub error ' + r.status });
    const d = await r.json();
    const content = JSON.parse(Buffer.from(d.content.replace(/\n/g, ''), 'base64').toString('utf8'));
    return res.status(200).json(content);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
