import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Sample events data for testing
  const events = [
    {
      id: '1',
      title: 'Golf Tournament',
      description: 'Annual club championship',
      date: '2025-08-15',
      time: '08:00',
      location: 'Main Course',
      maxParticipants: 50,
      currentParticipants: 23,
      createdBy: 'admin'
    },
    {
      id: '2', 
      title: 'Social Hour',
      description: 'Monthly member social gathering',
      date: '2025-08-20',
      time: '18:00',
      location: 'Clubhouse',
      maxParticipants: 100,
      currentParticipants: 45,
      createdBy: 'admin'
    }
  ];

  res.status(200).json(events);
}