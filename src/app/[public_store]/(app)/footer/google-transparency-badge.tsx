'use client'

import { ShieldCheck } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

const GoogleTransparencyBadge = () => {
  const params = useParams()

  useEffect(() => {
    // Cria o script para carregar o badge do Google
    const script = document.createElement('script')
    script.src =
      'https://transparencyreport.google.com/transparencyreport/safebrowsing/status/script.js'
    script.async = true
    document.body.appendChild(script)

    // Remove o script quando o componente desmontar
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="transparency-badge">
      <a
        href={`https://transparencyreport.google.com/safebrowsing/search?url=${process.env.NEXT_PUBLIC_APP_URL}/${params.public_store}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-row gap-2 font-bold"
      >
        <ShieldCheck />
        Google
      </a>
    </div>
  )
}

export default GoogleTransparencyBadge
