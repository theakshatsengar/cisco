import { Session } from 'next-auth'
import { NavClient } from './nav-client'

const navItems = {
  '/chat': {
    name: 'cisco',
  },
}

export function Navbar({ session }: { session: Session | null }) {
  return (
    <aside className="-ml-[8px] mb-0 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start justify-between relative px-0 pb-0 fade md:relative"
          id="nav"
        >
          <div className="flex flex-col">
            <h1 className="mb-2 text-2xl font-semibold tracking-tighter">chat with cisco.</h1>
          </div>
          <NavClient session={session} />
        </nav>
        <hr className="mt-2 border-neutral-100 dark:border-neutral-800" />
      </div>
    </aside>
  )
}
