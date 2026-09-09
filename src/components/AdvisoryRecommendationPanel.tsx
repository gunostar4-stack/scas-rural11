import { useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
import { mockCrops, mockRegions, mockRegionalAdvisories, type Crop, type RegionalAdvisoryRecommendation } from '../db/schema'
import { insertAdvisory, loadAdvisories, loadCrops, saveAdvisories } from '../db/storage'

const priorityStyle = { low: 'bg-sky-100 text-sky-800', medium: 'bg-amber-100 text-amber-800', high: 'bg-orange-100 text-orange-800', critical: 'bg-rose-100 text-rose-800' }

export function AdvisoryRecommendationPanel() {
  const [advisories, setAdvisories] = useState<RegionalAdvisoryRecommendation[]>(() => {
    const storedAdvisories = loadAdvisories()
    if (storedAdvisories.length > 0) return storedAdvisories
    saveAdvisories(mockRegionalAdvisories)
    return mockRegionalAdvisories
  })
  const [crops] = useState<Crop[]>(() => {
    const storedCrops = loadCrops()
    return storedCrops.length > 0 ? storedCrops : mockCrops
  })
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [cropId, setCropId] = useState('crop-maize')
  const [notice, setNotice] = useState<string | null>(null)

  function addAdvisory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !message.trim()) return
    try {
      const now = new Date()
      const advisory = insertAdvisory({ id: `advisory-${now.getTime()}`, regionId: mockRegions[0].id, cropId, soilTypeId: null, priority: 'medium', action: 'scout', title: title.trim(), message: message.trim(), validFrom: now.toISOString(), validUntil: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), source: 'Farmer dashboard entry', ruleVersion: 'manual-1.0.0' })
      setAdvisories((current) => [advisory, ...current])
      setTitle('')
      setMessage('')
      setNotice('Advisory saved for the Northern Plains.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to save advisory.') }
  }

  return <section id="advisories" aria-labelledby="advisories-title" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">ADVISORY RECOMMENDATIONS</p><h2 id="advisories-title" className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">What needs attention</h2></div><AlertTriangle aria-hidden="true" className="size-7 text-amber-600" /></div><div className="mt-5 space-y-3">{advisories.map((advisory) => <article key={advisory.id} className="rounded-xl border border-stone-200 p-4"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${priorityStyle[advisory.priority]}`}>{advisory.priority}</span><span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{advisory.action.replace('-', ' ')}</span></div><h3 className="mt-3 font-semibold text-stone-900">{advisory.title}</h3><p className="mt-1 text-sm leading-6 text-stone-600">{advisory.message}</p><p className="mt-3 text-xs text-stone-500">Valid until {new Date(advisory.validUntil).toLocaleDateString()} · {advisory.source}</p></article>)}</div><form onSubmit={addAdvisory} className="mt-5 grid gap-3 rounded-xl bg-stone-50 p-4" aria-label="Create advisory"><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-stone-700">Advisory title<input value={title} onChange={(event) => setTitle(event.target.value)} required className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900" /></label><label className="text-sm font-medium text-stone-700">Crop<select value={cropId} onChange={(event) => setCropId(event.target.value)} className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900">{crops.map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}</select></label></div><label className="text-sm font-medium text-stone-700">Recommended action<textarea value={message} onChange={(event) => setMessage(event.target.value)} required rows={3} className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900" /></label><button type="submit" className="justify-self-start rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"><Plus aria-hidden="true" className="mr-1 inline size-4" />Save advisory</button></form>{notice && <p role="status" className="mt-3 text-sm text-emerald-800">{notice}</p>}</section>
}
