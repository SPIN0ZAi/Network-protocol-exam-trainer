import { useEffect } from 'react'

export default function FullPage() {
  useEffect(() => {
    window.location.replace('/networking_exercise.html?mode=full')
  }, [])
  return <div>Redirigiendo al flujo completo...</div>
}
