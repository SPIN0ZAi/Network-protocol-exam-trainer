import { useEffect } from 'react'

export default function DhcpPage() {
  useEffect(() => {
    window.location.replace('/networking_exercise.html?mode=arp-dns-dhcp')
  }, [])
  return <div>Redirigiendo a DHCP...</div>
}
