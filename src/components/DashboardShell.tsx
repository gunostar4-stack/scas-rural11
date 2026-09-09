import type { ReactNode } from 'react'
import { Leaf, Menu, Sprout } from 'lucide-react'

interface DashboardShellProps {
  children: ReactNode
}

const navigation = [
  { label: 'Monitoring', href: '#monitoring' },
  { label: 'Fields', href: '#fields' },
  { label: 'Advisories', href: '#advisories' },
]

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#overview" className="flex items-center gap-3 font-semibold text-emerald-900" aria-label="SCAS dashboard home">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-700 text-white"><Sprout aria-hidden="true" className="size-5" /></span>
            <span><span className="block text-base">SCAS</span><span className="block text-xs font-medium text-stone-500">Smart Crop Advisory</span></span>
          </a>
          <nav aria-label="Primary navigation" className="hidden items-center gap-1 sm:flex">
            {navigation.map((item) => <a key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">{item.label}</a>)}
          </nav>
          <a href="#advisories" className="hidden items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 sm:flex"><Leaf aria-hidden="true" className="size-4" /> View advice</a>
          <a href="#navigation" className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 sm:hidden" aria-label="Jump to dashboard sections"><Menu aria-hidden="true" className="size-5" /></a>
        </div>
      </header>
      <div id="overview" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl bg-emerald-900 px-6 py-8 text-white shadow-sm sm:px-8">
          <p className="text-sm font-semibold tracking-wide text-emerald-200">FIELD INTELLIGENCE</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Grow with clearer, local guidance.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-100 sm:text-base">Track crop conditions, organize field records, and turn regional observations into practical next steps.</p>
        </div>
        <nav id="navigation" aria-label="Dashboard sections" className="mb-6 flex gap-2 overflow-x-auto pb-1 sm:hidden">
          {navigation.map((item) => <a key={item.href} href={item.href} className="shrink-0 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700">{item.label}</a>)}
        </nav>
        {children}
      </div>
    </main>
  )
}
