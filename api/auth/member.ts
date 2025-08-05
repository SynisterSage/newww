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
    const { email, phone } = req.body;
    
    if (!email || !phone) {
      return res.status(400).json({ error: "Email and phone are required" });
    }

    // Test member credentials (simplified for Vercel testing)
    const testMembers = [
      { id: '1', email: 'admin@golf.com', phone: '123-456-7890', firstName: 'Admin', lastName: 'User', memberNumber: 'A001' },
      { id: '2', email: 'afergyy@gmail.com', phone: '987-654-3210', firstName: 'Andrew', lastName: 'Ferguson', memberNumber: 'M002' }
    ];

    const member = testMembers.find(m => m.email === email && m.phone === phone);
    
    if (!member) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    res.status(200).json({ 
      id: member.id, 
      sessionToken, 
      firstName: member.firstName, 
      lastName: member.lastName, 
      memberNumber: member.memberNumber 
    });
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
}