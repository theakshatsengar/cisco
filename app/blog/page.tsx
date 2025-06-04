import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'blog',
  description: 'read my blog.',
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">my blog.</h1>
      <hr className="my-6 border-neutral-100 dark:border-neutral-800" />
      <hr className="my-6 border-neutral-100 dark:border-neutral-800" />
    </section>
  )
}
