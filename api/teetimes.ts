import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";
import { insertTeetimeSchema } from "../shared/schema";

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
      const { date } = req.query;
      const teetimes = await storage.getTeetimes(date as string);
      res.status(200).json(teetimes);
    } else if (req.method === 'POST') {
      const teetimeData = insertTeetimeSchema.parse(req.body);
      const teetime = await storage.createTeetime(teetimeData);
      res.status(201).json(teetime);
    } else if (req.method === 'PATCH') {
      const { id } = req.query;
      const updates = req.body;
      const teetime = await storage.updateTeetime(id as string, updates);
      res.status(200).json(teetime);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Teetimes API Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}