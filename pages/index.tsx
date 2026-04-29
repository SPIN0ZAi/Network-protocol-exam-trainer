import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
      <Head>
        <title>Networking Exercise - Landing</title>
      </Head>
      <h1>Networking Exercise - Landing</h1>
      <p>Use the interactive exercise page or open a mode directly:</p>
      <ul>
        <li><a href="/networking_exercise.html">Abrir herramienta completa</a></li>
        <li><Link href="/arp">ARP solo</Link></li>
        <li><Link href="/arp-dns">ARP + DNS</Link></li>
        <li><Link href="/dhcp">DHCP</Link></li>
        <li><Link href="/full">Flujo completo</Link></li>
      </ul>
      <p>API endpoints:</p>
      <ul>
        <li><a href="/api/modes">/api/modes</a></li>
        <li><a href="/api/scenarios">/api/scenarios</a></li>
        <li><a href="/api/progress">/api/progress (GET/POST)</a></li>
      </ul>
    </div>
  )
}
