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
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Test admin credentials
    const testAdmins = [
      { id: 'admin1', email: 'admin@golf.com', password: 'admin123', firstName: 'Admin', lastName: 'User' },
      { id: 'admin2', email: 'afergyy@gmail.com', password: 'Booly1969!', firstName: 'Andrew', lastName: 'Ferguson' }
    ];

    const admin = testAdmins.find(a => a.email === email && a.password === password);
    
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    res.status(200).json({ 
      id: admin.id, 
      sessionToken, 
      firstName: admin.firstName, 
      lastName: admin.lastName,
      role: 'admin'
    });
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
}