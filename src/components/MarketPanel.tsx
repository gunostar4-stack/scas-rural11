import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Search, Store } from 'lucide-react'
import type { CropData, MarketPriceRecord } from '../db/schema'
import { StorageService } from '../db/storage'
import { MarketService } from '../services/marketService'

const storageService = new StorageService()
const marketService = new MarketService(storageService)

function trendIcon(trend: MarketPriceRecord['trend']) {
  if (trend === 'rising') return <ArrowUpRight aria-hidden="true" className="size-4" />
  if (trend === 'falling') return <ArrowDownRight aria-hidden="true" className="size-4" />
  return <ArrowRight aria-hidden="true" className="size-4" />
}

export function MarketPanel() {
  const [district, setDistrict] = useState('Nashik')
  const cropsById = useMemo(() => new Map(storageService.getCrops().map((crop) => [crop.id, crop] as const)), [])
  const prices = marketService.fetchDistrictPrices(district)

  return (
    <section aria-labelledby="market-title" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><Store aria-hidden="true" className="size-5" /></span><div><p className="text-sm font-semibold text-emerald-700">e-NAM MARKET WATCH</p><h2 id="market-title" className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">District market prices</h2><p className="mt-1 text-sm leading-6 text-stone-600">Offline cached price snapshots, shown in ₹ per quintal.</p></div></div>
      <label className="relative mt-5 block"><span className="sr-only">Search by district</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" /><input value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="Search Nashik, Pune…" className="block w-full rounded-xl border border-stone-300 bg-stone-50 py-3 pl-10 pr-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{prices.map((price) => <MarketPriceCard key={price.id} price={price} crop={cropsById.get(price.cropId)} />)}</div>
      {prices.length === 0 && <div className="mt-5 rounded-xl border border-dashed border-stone-300 p-6 text-center"><p className="font-semibold text-stone-800">No cached prices for “{district || 'this district'}”</p><p className="mt-1 text-sm text-stone-500">Try Nashik, Pune, or Latur.</p></div>}
    </section>
  )
}

function MarketPriceCard({ price, crop }: { price: MarketPriceRecord; crop: CropData | undefined }) {
  const trendClass = marketService.getTrendIndicator(price.trend)
  return <article className="rounded-xl border border-stone-200 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-stone-900">{crop?.name ?? 'Crop'}</h3><p className="mt-1 text-sm text-stone-600">{price.marketName}</p></div><span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${trendClass}`}>{trendIcon(price.trend)}{price.trend}</span></div><p className="mt-5 text-2xl font-bold tracking-tight text-stone-900">₹{price.modalPriceInrPerQuintal.toLocaleString('en-IN')}<span className="ml-1 text-sm font-medium text-stone-500">/ quintal</span></p><dl className="mt-4 flex justify-between gap-3 border-t border-stone-100 pt-3 text-xs"><div><dt className="text-stone-500">District</dt><dd className="mt-1 font-semibold text-stone-700">{price.districtName}, {price.state}</dd></div><div className="text-right"><dt className="text-stone-500">Updated</dt><dd className="mt-1 font-semibold text-stone-700">{new Date(price.observedOn).toLocaleDateString('en-IN')}</dd></div></dl></article>
}
