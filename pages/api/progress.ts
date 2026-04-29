import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'

const PROGRESS_FILE = path.join(process.cwd(), 'progress.json')
const DEFAULT = { quizzesSolved: 0, bestScore: 0, lastScenario: '', lastStage: 'arp' }

function readProgress() {
  try {
    if (!fs.existsSync(PROGRESS_FILE)) return DEFAULT
    const raw = fs.readFileSync(PROGRESS_FILE, 'utf-8')
    return { ...DEFAULT, ...(JSON.parse(raw) || {}) }
  } catch (e) {
    return DEFAULT
  }
}

function writeProgress(obj: any) {
  const next = { ...readProgress(), ...obj }
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(next, null, 2), 'utf-8')
  } catch (e) {
    // ignore on serverless
  }
  return next
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(readProgress())
  }
  if (req.method === 'POST') {
    const payload = req.body || {}
    const updated = writeProgress(payload)
    return res.status(200).json(updated)
  }
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end('Method Not Allowed')
}
