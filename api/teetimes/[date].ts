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

  const { date } = req.query;

  // Generate sample tee times for the requested date
  const teetimes = [];
  const startTime = 7; // 7 AM
  const endTime = 19; // 7 PM
  
  for (let hour = startTime; hour < endTime; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      teetimes.push({
        id: `${date}-${timeString}`,
        date: date,
        time: timeString,
        available: true,
        bookedBy: [],
        playerNames: [],
        maxPlayers: 4
      });
    }
  }

  res.status(200).json(teetimes);
}