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
      const { date } = req.query;
      
      if (date) {
        // Get tee times for specific date
        let teetimes = await sql`SELECT * FROM teetimes WHERE date = ${date} ORDER BY time ASC`;
        
        // If no tee times exist for this date, auto-generate them
        if (teetimes.length === 0) {
          const times = [];
          for (let hour = 6; hour <= 13; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
              const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              times.push(timeStr);
            }
          }
          
          // Insert generated tee times
          for (const time of times) {
            const id = randomUUID();
            await sql`
              INSERT INTO teetimes (id, date, time, booked_by, player_names, notes, status)
              VALUES (${id}, ${date}, ${time}, '[]', '[]', '', 'available')
            `;
          }
          
          // Fetch the newly created tee times
          teetimes = await sql`SELECT * FROM teetimes WHERE date = ${date} ORDER BY time ASC`;
        }
        
        res.status(200).json(teetimes);
      } else {
        // Get all tee times
        const teetimes = await sql`SELECT * FROM teetimes ORDER BY date ASC, time ASC`;
        res.status(200).json(teetimes);
      }
    } else if (req.method === 'POST') {
      const { date, time, bookedBy, playerNames, notes } = req.body;
      
      const id = randomUUID();
      const teetime = await sql`
        INSERT INTO teetimes (id, date, time, booked_by, player_names, notes, status)
        VALUES (${id}, ${date}, ${time}, ${JSON.stringify(bookedBy || [])}, ${JSON.stringify(playerNames || [])}, ${notes || ''}, 'booked')
        RETURNING *
      `;
      
      res.status(201).json(teetime[0]);
    } else if (req.method === 'PATCH') {
      const { id } = req.query;
      const updates = req.body;
      
      // Handle tee time updates with direct SQL template literals
      
      if (updates.bookedBy !== undefined || updates.playerNames !== undefined || updates.status !== undefined) {
        // Use direct SQL template literals instead of parameterized queries
        if (updates.bookedBy !== undefined && updates.playerNames !== undefined && updates.status !== undefined) {
          const teetime = await sql`
            UPDATE teetimes 
            SET booked_by = ${JSON.stringify(updates.bookedBy)}, 
                player_names = ${JSON.stringify(updates.playerNames)}, 
                status = ${updates.status} 
            WHERE id = ${id} 
            RETURNING *
          `;
          res.status(200).json(teetime[0]);
        } else if (updates.bookedBy !== undefined && updates.playerNames !== undefined) {
          const teetime = await sql`
            UPDATE teetimes 
            SET booked_by = ${JSON.stringify(updates.bookedBy)}, 
                player_names = ${JSON.stringify(updates.playerNames)} 
            WHERE id = ${id} 
            RETURNING *
          `;
          res.status(200).json(teetime[0]);
        } else if (updates.status !== undefined) {
          const teetime = await sql`
            UPDATE teetimes 
            SET status = ${updates.status} 
            WHERE id = ${id} 
            RETURNING *
          `;
          res.status(200).json(teetime[0]);
        } else {
          res.status(400).json({ message: 'No valid fields to update' });
        }
      } else {
        res.status(400).json({ message: 'No valid fields to update' });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Teetimes API Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}