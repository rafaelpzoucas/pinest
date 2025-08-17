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

function getV2Prefix() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname
    return path.startsWith('/v2') ? 'v2' : ''
  }
  // fallback no server
  const pathname = process.env.NEXT_PUBLIC_PATHNAME || ''
  return pathname.startsWith('/v2') ? 'v2' : ''
}

export const getRootPath = (storeSubdomain: string | undefined | null) => {
  if (!storeSubdomain) return ''

  const isLocalhost =
    typeof window !== 'undefined'
      ? window.location.hostname.startsWith('localhost')
      : process.env.NODE_ENV === 'development'

  const isStaging = isStagingEnvironment()
  const v2Prefix = getV2Prefix()

  if (isLocalhost || isStaging) {
    return [v2Prefix, storeSubdomain].filter(Boolean).join('/')
  }

  // produção usa rewrite
  return v2Prefix
}

export const createPath = (
  path: string,
  storeSubdomain: string | undefined | null,
) => {
  const rootPath = getRootPath(storeSubdomain)
  if (!rootPath) return path
  return `/${rootPath}${path}`
}
