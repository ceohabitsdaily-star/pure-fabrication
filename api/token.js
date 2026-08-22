export default function handler(req, res) {
  const { pass } = req.query;
  if (!pass || pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.status(200).json({ token: process.env.GH_TOKEN });
}
