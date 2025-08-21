import { useRouteMatcher } from '../hooks'
import { navigationConfig } from './config'

export function useNavigation() {
  return useRouteMatcher(navigationConfig, '*')
}
