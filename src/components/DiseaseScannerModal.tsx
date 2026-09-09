import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, LoaderCircle, Upload, X } from 'lucide-react'
import { GeminiScannerService, type DiseaseScanResult } from '../services/geminiScannerService'

interface DiseaseScannerModalProps {
  isOpen: boolean
  onClose: () => void
}

const scannerService = new GeminiScannerService()

export function DiseaseScannerModal({ isOpen, onClose }: DiseaseScannerModalProps) {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<DiseaseScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedImage = event.target.files?.[0] ?? null
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImage(selectedImage)
    setPreviewUrl(selectedImage ? URL.createObjectURL(selectedImage) : null)
    setResult(null)
    setError(null)
  }

  async function analyze() {
    if (!image) {
      setError('Choose a clear leaf photo before analysis.')
      return
    }
    setError(null)
    setResult(null)
    setIsAnalyzing(true)
    try {
      setResult(await scannerService.scan(image))
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'The leaf image could not be analyzed.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-labelledby="disease-scanner-title">
      <div className="mx-auto my-4 w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:my-10 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-emerald-700">LEAF DISEASE SCANNER</p><h2 id="disease-scanner-title" className="mt-1 text-2xl font-bold text-slate-950">Scan a leaf photo</h2><p className="mt-1 text-sm text-slate-600">Use Gemini when connected; offline guidance is always available.</p></div><button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-emerald-700" aria-label="Close scanner"><X aria-hidden="true" className="size-5" /></button></div>

        <div className="mt-5 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-4">
          <label htmlFor="disease-leaf-image" className="block cursor-pointer text-center"><Upload aria-hidden="true" className="mx-auto size-7 text-emerald-700" /><span className="mt-2 block font-semibold text-emerald-950">Upload or select a leaf photo</span><span className="mt-1 block text-xs text-emerald-800">Image files up to 10 MB</span></label>
          <input id="disease-leaf-image" type="file" accept="image/*" onChange={selectImage} className="sr-only" />
          {previewUrl && <img src={previewUrl} alt="Selected leaf preview" className="mt-4 max-h-64 w-full rounded-lg object-contain" />}
          {image && <p className="mt-3 text-center text-sm text-slate-700">Selected: <span className="font-semibold">{image.name}</span></p>}
          <button type="button" disabled={isAnalyzing} onClick={analyze} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:bg-emerald-400">{isAnalyzing && <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />}{isAnalyzing ? 'Analyzing leaf…' : 'Analyze leaf'}</button>
        </div>

        {error && <p role="alert" className="mt-4 flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{error}</p>}
        {result && <section aria-live="polite" className="mt-5 rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{result.source === 'gemini' ? 'Gemini guidance' : 'Offline guidance'}</p><h3 className="mt-1 text-xl font-bold text-slate-950">{result.diseaseName}</h3><p className="text-sm capitalize text-slate-600">{result.crop} · {result.severity} priority</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{result.source === 'gemini' ? 'Online' : 'Offline'}</span></div><div className="mt-4"><h4 className="font-bold text-slate-900">Observed symptoms</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{result.symptoms.map((symptom) => <li key={symptom}>{symptom}</li>)}</ul></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><article className="rounded-lg bg-amber-50 p-3"><h4 className="font-bold text-amber-950">Chemical treatment</h4><p className="mt-1 text-sm leading-5 text-amber-900">{result.chemicalTreatment}</p></article><article className="rounded-lg bg-emerald-50 p-3"><h4 className="font-bold text-emerald-950">Organic treatment</h4><p className="mt-1 text-sm leading-5 text-emerald-900">{result.organicTreatment}</p></article></div><p className="mt-4 flex gap-2 text-xs leading-5 text-slate-600"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-700" />Confirm the diagnosis locally. Use only locally registered products and follow the product label, PPE, and harvest interval.</p></section>}
      </div>
    </div>
  )
}
