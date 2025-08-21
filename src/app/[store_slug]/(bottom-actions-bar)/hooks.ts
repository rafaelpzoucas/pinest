import { useRouteMatcher } from '../hooks'
import { bottomActionConfig } from './config'

export function useBottomAction() {
  return useRouteMatcher(bottomActionConfig, '*')
}
