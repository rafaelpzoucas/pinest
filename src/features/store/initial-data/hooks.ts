'use client'

import { useQuery } from '@tanstack/react-query'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useRef, useState } from 'react'
import { getStoreInitialData, readCategoryWithProducts } from './read'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useStoreParams() {
  const [category, setCategory] = useQueryState(
    'categoria',
    parseAsString.withDefault(''),
  )

  return {
    selectedCategory: category,
    setSelectedCategory: setCategory,
  }
}

export function useStoreData(subdomain: string, initialData?: any) {
  return useQuery({
    queryKey: ['store-initial-data', subdomain],
    queryFn: async () => {
      const [data, error] = await getStoreInitialData({
        subdomain,
      })

      if (error) {
        throw error
      }

      return data
    },
    initialData, // Usa dados do servidor como estado inicial
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useLazyCategories(categoryId: string, enabled = false) {
  return useQuery({
    queryKey: ['category-with-products', categoryId],
    queryFn: async () => {
      const [data, error] = await readCategoryWithProducts({ categoryId })

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '200px',
    freezeOnceVisible = true,
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Se já intersectou e está configurado para "freezar", não faz nada
    if (freezeOnceVisible && hasIntersected) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting

        setIsIntersecting(isElementIntersecting)

        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold,
        root,
        rootMargin,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible, hasIntersected])

  return {
    ref,
    isIntersecting,
    hasIntersected,
  }
}
