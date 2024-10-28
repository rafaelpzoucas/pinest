import { ReactNode } from 'react'

export function MDXContent({ children }: { children: ReactNode }) {
  return (
    <div
      className="prose prose-headings:text-foreground prose-blockquote:text-foreground
        prose-strong:text-foreground prose-pre:bg-secondary
        prose-p:text-muted-foreground prose-ul:text-muted-foreground"
    >
      {children}
    </div>
  )
}
