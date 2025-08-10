import type { VercelRequest, VercelResponse } from '@vercel/node'
import serverless from 'serverless-http'
import app, { ready } from '../server/index'

// Make sure routes/middleware are ready before handling
const handler = serverless(app as any)

export default async (req: VercelRequest, res: VercelResponse) => {
  await ready
  // @ts-ignore serverless-http expects Node req/res
  return handler(req, res)
}