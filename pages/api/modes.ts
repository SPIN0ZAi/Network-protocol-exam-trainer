import type { NextApiRequest, NextApiResponse } from 'next'

const MODES = [
  { key: 'arp', label: 'ARP solo', description: 'Aprende cuándo se usa ARP y cuándo no.' },
  { key: 'arp-dns', label: 'ARP + DNS', description: 'Añade resolución de nombres a la práctica.' },
  { key: 'arp-dns-dhcp', label: 'ARP + DNS + DHCP', description: 'Incluye obtención de configuración IP.' },
  { key: 'full', label: 'ARP + DNS + DHCP + servidor', description: 'Flujo completo con TCP/HTTP y cierre.' }
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(MODES)
}
