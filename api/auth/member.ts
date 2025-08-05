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

    // Test member credentials matching actual database
    const testMembers = [
      { id: '1', email: 'admin@golf.com', phone: '(973) 123-4567', firstName: 'Admin', lastName: 'User', memberNumber: 'A001' },
      { id: '2', email: 'afergyy@gmail.com', phone: '(908) 555-0123', firstName: 'Andrew', lastName: 'Ferguson', memberNumber: 'M002' },
      { id: '3', email: 'john.smith@email.com', phone: '(973) 555-1234', firstName: 'John', lastName: 'Smith', memberNumber: 'M101' },
      { id: '4', email: 'mary.jones@email.com', phone: '(908) 555-5678', firstName: 'Mary', lastName: 'Jones', memberNumber: 'M102' }
    ];

    // Normalize phone numbers by removing all non-digits
    const normalizePhone = (phone: string) => phone.replace(/\D/g, '');
    const normalizedInputPhone = normalizePhone(phone);
    
    const member = testMembers.find(m => 
      m.email === email && normalizePhone(m.phone) === normalizedInputPhone
    );
    
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