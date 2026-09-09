import { useState } from 'react'
import { Plus, Sprout } from 'lucide-react'
import type { Crop } from '../db/schema'
import { mockCrops } from '../db/schema'
import { insertCrop, loadCrops, saveCrops } from '../db/storage'

function cropId(name: string) {
  return `crop-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
}

export function CropMonitoringView() {
  const [crops, setCrops] = useState<Crop[]>(() => {
    const savedCrops = loadCrops()
    if (savedCrops.length > 0) return savedCrops
    saveCrops(mockCrops)
    return mockCrops
  })
  const [name, setName] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  function addCrop(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = name.trim()
    if (!normalizedName || !scientificName.trim()) return
    try {
      const newCrop = insertCrop({ id: cropId(normalizedName), name: normalizedName, scientificName: scientificName.trim(), plantingWindowMonths: [5, 6, 7], optimalPhRange: { min: 5.5, max: 7 } })
      setCrops((current) => [...current, newCrop])
      setName('')
      setScientificName('')
      setNotice(`${newCrop.name} is now being monitored.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to add crop.')
    }
  }

  return <section id="monitoring" aria-labelledby="monitoring-title" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">CROP MONITORING</p><h2 id="monitoring-title" className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">Current crop profiles</h2><p className="mt-1 text-sm text-stone-600">Use crop pH ranges to compare field soil observations.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">{crops.length} crops</span></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{crops.map((crop) => <article key={crop.id} className="rounded-xl border border-stone-200 p-4"><Sprout aria-hidden="true" className="size-5 text-emerald-700" /><h3 className="mt-3 font-semibold text-stone-900">{crop.name}</h3><p className="text-sm italic text-stone-500">{crop.scientificName}</p><dl className="mt-4 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-stone-500">Ideal pH</dt><dd className="font-semibold text-stone-800">{crop.optimalPhRange.min}–{crop.optimalPhRange.max}</dd></div><div><dt className="text-stone-500">Planting</dt><dd className="font-semibold text-stone-800">Months {crop.plantingWindowMonths.join(', ')}</dd></div></dl></article>)}</div>
    <form onSubmit={addCrop} className="mt-5 grid gap-3 rounded-xl bg-stone-50 p-4 sm:grid-cols-[1fr_1fr_auto]" aria-label="Add monitored crop"><label className="text-sm font-medium text-stone-700">Crop name<input value={name} onChange={(event) => setName(event.target.value)} required className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900" /></label><label className="text-sm font-medium text-stone-700">Scientific name<input value={scientificName} onChange={(event) => setScientificName(event.target.value)} required className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900" /></label><button type="submit" className="self-end rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"><Plus aria-hidden="true" className="mr-1 inline size-4" />Add crop</button></form>
    {notice && <p role="status" className="mt-3 text-sm text-emerald-800">{notice}</p>}
  </section>
}
