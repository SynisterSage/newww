import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';

// CORS headers
const setCORSHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://pgcapp-12fba.web.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const events = await sql`SELECT * FROM events ORDER BY date ASC`;
      res.status(200).json(events);
    } else if (req.method === 'POST') {
      const { title, description, date, time, location, category, price, maxParticipants } = req.body;
      
      const eventId = randomUUID();
      const event = await sql`
        INSERT INTO events (id, title, description, date, time, location, category, price, max_participants, current_participants)
        VALUES (${eventId}, ${title}, ${description}, ${date}, ${time}, ${location}, ${category}, ${price || 0}, ${maxParticipants || 50}, 0)
        RETURNING *
      `;
      
      res.status(201).json(event[0]);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Events API Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}