import { cn } from '@/lib/utils'

export function LoadingBar({
  isLoading,
  stop,
}: {
  stop?: boolean
  isLoading: boolean
}) {
  return (
    <div className="relative w-full h-1 bg-secondary/70 rounded-full">
      <div
        className={cn(
          'absolute h-1 bg-primary rounded-full transition-all duration-300 ease-in-out',
          stop && 'w-full',
          isLoading && 'animate-loading-bar',
        )}
        style={{
          animation: isLoading ? 'loadingBar 1200ms ease-out infinite' : 'none',
        }}
      ></div>
      <style jsx>{`
        @keyframes loadingBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
