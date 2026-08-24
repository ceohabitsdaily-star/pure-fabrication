module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, company, phone, email, location, message } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  const token = process.env.GH_TOKEN;
  if (!token) return res.status(500).json({ error: 'Server not configured' });

  const OWNER = 'ceohabitsdaily-star';
  const REPO = 'pure-fabrication';
  const FILE = 'data/enquiries.json';
  const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  // Get existing enquiries
  let enquiries = [];
  let sha = null;
  const getRes = await fetch(API, { headers });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
    enquiries = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
  }

  // Add new enquiry
  enquiries.unshift({
    id: Date.now(),
    name, company: company || '', phone: phone || '',
    email, location: location || '', message: message || '',
    date: new Date().toISOString(),
    status: 'new'
  });

  // Save back to GitHub
  const body = { message: 'New enquiry', content: Buffer.from(JSON.stringify(enquiries, null, 2)).toString('base64'), branch: 'main' };
  if (sha) body.sha = sha;

  const putRes = await fetch(API, { method: 'PUT', headers, body: JSON.stringify(body) });
  if (!putRes.ok) {
    const errData = await putRes.json().catch(()=>({}));
    console.error('GitHub PUT failed:', putRes.status, JSON.stringify(errData));
    return res.status(500).json({ error: 'Failed to save', detail: errData.message });
  }

  res.status(200).json({ success: true });
};
