const isStagingEnvironment = () => {
  if (typeof window !== 'undefined') {
    return ['staging.pinest.com.br', 'staging-pinest.vercel.app'].includes(
      window.location.hostname,
    )
  }

  // Detecção no servidor - melhorada
  const hostname =
    process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || ''
  const isStaging =
    hostname.includes('staging') ||
    hostname.includes('staging-pinest') ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_GIT_COMMIT_REF === 'staging'

  return isStaging
}

export const getRootPath = (storeSubdomain: string | undefined | null) => {
  console.log('getRootPath called with:', { storeSubdomain })

  if (!storeSubdomain) {
    console.log('No storeSubdomain, returning empty')
    return ''
  }

  try {
    const isLocalhost =
      typeof window !== 'undefined'
        ? window.location.hostname.startsWith('localhost')
        : process.env.NODE_ENV === 'development'

    console.log('Environment check:', {
      isLocalhost,
      nodeEnv: process.env.NODE_ENV,
      hasWindow: typeof window !== 'undefined',
    })

    const isStaging = isStagingEnvironment()
    console.log('Staging check:', { isStaging })

    if (isLocalhost || isStaging) {
      console.log('Returning prefixed path:', `/${storeSubdomain}`)
      return `/${storeSubdomain}`
    }

    console.log('Returning empty path for production')
    return ''
  } catch (error) {
    console.error('Error in getRootPath:', error)
    return '' // fallback seguro
  }
}

export const createPath = (
  path: string,
  storeSubdomain: string | undefined | null,
) => {
  const rootPath = getRootPath(storeSubdomain)
  if (!rootPath) return path
  return `/${rootPath}${path}`
}
