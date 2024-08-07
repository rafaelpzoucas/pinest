import { MDXContent } from '@/components/mdx-content'
import Content from './content.mdx'

export default function PrivacyPolicyPage() {
  return (
    <section className="flex items-center justify-center w-full p-8 py-28">
      <MDXContent>
        <Content />
      </MDXContent>
    </section>
  )
}
