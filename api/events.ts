import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";
import { insertEventSchema } from "../shared/schema";

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
    if (req.method === 'GET') {
      const events = await storage.getEvents();
      res.status(200).json(events);
    } else if (req.method === 'POST') {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}