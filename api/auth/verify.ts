import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionToken } = req.body;
    
    if (!sessionToken) {
      return res.status(401).json({ error: "Session token required" });
    }

    // For testing, accept any session token and return a valid user
    const testUser = {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      memberNumber: 'T001'
    };

    res.status(200).json(testUser);
  } catch (error) {
    res.status(500).json({ error: "Session verification failed" });
  }
}