import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";

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
    if (req.method === 'POST') {
      const { email, phone, isAdmin } = req.body;
      
      if (isAdmin) {
        // Admin authentication
        const validAdmins = [
          { email: "admin@golf.com", phone: "admin123" },
          { email: "afergyy@gmail.com", phone: "Booly1969!" }
        ];
        
        const admin = validAdmins.find(a => a.email === email && a.phone === phone);
        if (admin) {
          res.status(200).json({ 
            success: true, 
            user: { id: 'admin', email, isAdmin: true } 
          });
        } else {
          res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }
      } else {
        // Member authentication
        const users = await storage.getUsers();
        const user = users.find(u => u.email === email && u.phone === phone);
        if (user) {
          res.status(200).json({ success: true, user });
        } else {
          res.status(401).json({ success: false, message: 'Invalid member credentials' });
        }
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Auth Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}