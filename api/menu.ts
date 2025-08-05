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

  // Sample menu data
  const menuItems = [
    {
      id: '1',
      name: 'Club Sandwich',
      description: 'Turkey, bacon, lettuce, tomato on toasted bread',
      price: 14.99,
      category: 'Lunch',
      available: true
    },
    {
      id: '2', 
      name: 'Caesar Salad',
      description: 'Fresh romaine, parmesan, croutons, caesar dressing',
      price: 12.99,
      category: 'Lunch',
      available: true
    },
    {
      id: '3',
      name: 'Grilled Salmon',
      description: 'Atlantic salmon with seasonal vegetables',
      price: 24.99,
      category: 'Dinner',
      available: true
    }
  ];

  res.status(200).json(menuItems);
}