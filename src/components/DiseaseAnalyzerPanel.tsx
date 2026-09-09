import { useState } from 'react'
import { Camera, WifiOff } from 'lucide-react'
import { DiseaseScannerModal } from './DiseaseScannerModal'

/** Entry point for the scanner; the upload and analysis workflow lives in the modal. */
export function DiseaseAnalyzerPanel() {
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  return (
    <section aria-labelledby="leaf-analysis-title" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><Camera aria-hidden="true" className="size-6" /></span><div><p className="text-sm font-semibold text-emerald-700">LEAF HEALTH CHECK</p><h2 id="leaf-analysis-title" className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">Scan a crop leaf</h2><p className="mt-1 max-w-xl text-sm leading-6 text-stone-600">Upload a clear leaf photo for AI guidance when online, with trusted offline disease guidance as a fallback.</p></div></div>
        <button type="button" onClick={() => setIsScannerOpen(true)} className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><Camera aria-hidden="true" className="size-5" />Open scanner</button>
      </div>
      <p className="mt-4 flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 text-xs text-stone-600"><WifiOff aria-hidden="true" className="size-4 text-emerald-700" />Offline mode uses disease guidance saved on this device.</p>
      <DiseaseScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </section>
  )
}
