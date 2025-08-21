import { usePathname } from 'next/navigation'

/**
 * Hook genérico para fazer matching de rotas com padrões dinâmicos
 * Prioriza rotas com mais segmentos estáticos
 */
export function useRouteMatcher<T>(
  config: Record<string, T>,
  fallbackKey = '*',
) {
  const pathname = usePathname()

  function matchRoute(pathname: string): T {
    // Match exato primeiro
    if (config[pathname]) {
      return config[pathname]
    }

    // Separa padrões por tipo
    const allPatterns = Object.keys(config).filter((key) => key !== fallbackKey)

    // Primeiro: padrões que têm segmentos estáticos misturados com dinâmicos
    // Ex: /[store_slug]/cart tem 1 segmento estático
    const mixedPatterns = allPatterns
      .filter((pattern) => pattern.includes('[') && pattern.includes('/'))
      .sort((a, b) => {
        // Ordena por: mais segmentos estáticos primeiro, depois mais segmentos totais
        const aStatic = a
          .split('/')
          .filter((seg) => seg && !seg.includes('[')).length
        const bStatic = b
          .split('/')
          .filter((seg) => seg && !seg.includes('[')).length
        if (aStatic !== bStatic) return bStatic - aStatic
        return b.split('/').length - a.split('/').length
      })

    for (const pattern of mixedPatterns) {
      if (matchesPattern(pathname, pattern)) {
        return config[pattern]
      }
    }

    // Segundo: padrões puramente dinâmicos
    // Ex: /[store_slug]/[product_slug] tem 0 segmentos estáticos
    const dynamicPatterns = allPatterns
      .filter(
        (pattern) => pattern.includes('[') && !mixedPatterns.includes(pattern),
      )
      .sort((a, b) => b.split('/').length - a.split('/').length)

    for (const pattern of dynamicPatterns) {
      if (matchesPattern(pathname, pattern)) {
        return config[pattern]
      }
    }

    // Fallback para configuração padrão
    return config[fallbackKey] as T
  }

  function matchesPattern(pathname: string, pattern: string): boolean {
    const pathSegments = pathname.split('/').filter(Boolean)
    const patternSegments = pattern.split('/').filter(Boolean)

    // Se o número de segmentos não bate, não é match
    if (pathSegments.length !== patternSegments.length) {
      return false
    }

    // Verifica cada segmento
    for (let i = 0; i < patternSegments.length; i++) {
      const patternSegment = patternSegments[i]
      const pathSegment = pathSegments[i]

      // Se é um parâmetro dinâmico [algo], aceita qualquer valor
      if (patternSegment.startsWith('[') && patternSegment.endsWith(']')) {
        continue
      }

      // Se é um segmento fixo, deve ser exato
      if (patternSegment !== pathSegment) {
        return false
      }
    }

    return true
  }

  const matchedConfig = matchRoute(pathname)

  return {
    config: matchedConfig,
    pathname,
  }
}
