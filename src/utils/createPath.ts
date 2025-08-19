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
  if (!storeSubdomain) return ''

  const isLocalhost =
    typeof window !== 'undefined'
      ? window.location.hostname.startsWith('localhost')
      : process.env.NODE_ENV === 'development'

  const isStaging = isStagingEnvironment()

  if (isLocalhost || isStaging) {
    return `${storeSubdomain}`
  }

  return '' // produção usa reescrita, não precisa prefixar
}

export const createPath = (
  path: string,
  storeSubdomain: string | undefined | null,
) => {
  const rootPath = getRootPath(storeSubdomain)
  if (!rootPath) return path
  return `/v2/${rootPath}${path}`
}
