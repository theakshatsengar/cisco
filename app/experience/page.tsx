import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'blog',
  description: 'read my blog.',
}

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        experience.
      </h1>
      <p className="mb-4">
        {`i've had the chance to work with some wonderful teams on diverse problems and tech stacks, which has allowed me to learn and grow continuously.`}
      </p>
      <div className="my-8">
        <p className="mb-4">here’s a brief overview of my professional experience so far :</p>
        <hr className="my-6 border-neutral-100 dark:border-neutral-800" />
        <BlogPosts />
        <hr className="my-6 border-neutral-100 dark:border-neutral-800" />
      </div>
    </section>
  );
}

