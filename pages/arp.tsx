import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ArpPage() {
  const router = useRouter()
  useEffect(() => {
    // Redirect to the static HTML with mode param
    window.location.replace('/networking_exercise.html?mode=arp')
  }, [])
  return <div>Redirigiendo a ARP...</div>
}
