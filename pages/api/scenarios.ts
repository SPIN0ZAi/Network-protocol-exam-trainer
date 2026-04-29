import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'

const DATA_PATH = path.join(process.cwd(), 'data', 'scenarios.json')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8')
    const scenarios = JSON.parse(raw)
    res.status(200).json(scenarios)
  } catch (err) {
    res.status(500).json({ error: 'Could not read scenarios' })
  }
}
