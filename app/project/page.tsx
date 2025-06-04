
export const metadata = {
  title: 'blog',
  description: 'read my blog.',
}

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        my projects.
      </h1>
      <p className="mb-4">
        {`i've had the chance to work with some wonderful teams on diverse problems and tech stacks, which has allowed me to learn and grow continuously.`}
      </p>
      <div className="my-8">
        
        <p className="mb-4">and here are some projects i've built :</p>
        <hr className="my-6 border-neutral-100 dark:border-neutral-800" />
        
        <hr className="my-6 border-neutral-100 dark:border-neutral-800" />
      </div>
    </section>
  );
}

