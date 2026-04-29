import { useEffect } from 'react'

export default function ArpDnsPage() {
  useEffect(() => {
    window.location.replace('/networking_exercise.html?mode=arp-dns')
  }, [])
  return <div>Redirigiendo a ARP + DNS...</div>
}
