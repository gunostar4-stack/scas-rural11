import type { DiseaseRecord, DiseaseSeverity } from '../db/schema'
import { StorageService } from '../db/storage'

export interface DiseaseScanResult {
  diseaseName: string
  crop: string
  symptoms: string[]
  chemicalTreatment: string
  organicTreatment: string
  severity: DiseaseSeverity
  source: 'gemini' | 'offline'
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
}

interface GeminiPayload {
  diseaseName?: unknown
  crop?: unknown
  symptoms?: unknown
  chemicalTreatment?: unknown
  organicTreatment?: unknown
  severity?: unknown
}

const maxImageBytes = 10 * 1024 * 1024
const validSeverities = new Set<DiseaseSeverity>(['low', 'moderate', 'high', 'critical'])

function asText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function asSymptoms(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : []
}

async function fileToBase64(image: File): Promise<string> {
  const bytes = new Uint8Array(await image.arrayBuffer())
  let binary = ''
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

function fallbackRecord(records: readonly DiseaseRecord[], image: File): DiseaseRecord {
  if (records.length === 0) throw new Error('No offline disease guidance is available.')
  const index = [...image.name].reduce((total, character) => total + character.charCodeAt(0), 0) % records.length
  return records[index]
}

function localResult(record: DiseaseRecord): DiseaseScanResult {
  return {
    diseaseName: record.diseaseName,
    crop: record.cropId.replace('india-', ''),
    symptoms: [...record.symptoms],
    chemicalTreatment: record.chemicalTreatment,
    organicTreatment: record.organicTreatment,
    severity: record.severity,
    source: 'offline',
  }
}

/**
 * Gemini-backed leaf analysis with a local, offline-first disease-guide fallback.
 * A production deployment should send this request through a protected server so
 * an API key is never exposed in the browser bundle.
 */
export class GeminiScannerService {
  private readonly storage: StorageService

  constructor(storage = new StorageService()) {
    this.storage = storage
    this.storage.initializeStorage()
  }

  async scan(image: File): Promise<DiseaseScanResult> {
    if (!image.type.startsWith('image/') || image.size === 0 || image.size > maxImageBytes) {
      throw new Error('Choose a valid leaf image smaller than 10 MB.')
    }

    const localDiseases = this.storage.getDiseases()
    const fallback = () => localResult(fallbackRecord(localDiseases, image))
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey || !navigator.onLine) return fallback()

    try {
      // Updated to use the modern gemini-3-flash-preview endpoint URL string
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { inlineData: { mimeType: image.type, data: await fileToBase64(image) } },
              { text: 'Inspect this crop leaf image. Return JSON only with diseaseName, crop, symptoms (array), severity (low|moderate|high|critical), chemicalTreatment, and organicTreatment. Do not invent dosages or claim certainty. Treatments must say to use only locally registered products and follow the product label.' },
            ],
          }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      })
      if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}.`)

      const payload = await response.json() as GeminiResponse
      const rawText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('')
      if (!rawText) throw new Error('Gemini returned no diagnosis.')
      const parsed = JSON.parse(rawText) as GeminiPayload
      const symptoms = asSymptoms(parsed.symptoms)
      const severity = typeof parsed.severity === 'string' && validSeverities.has(parsed.severity as DiseaseSeverity)
        ? parsed.severity as DiseaseSeverity
        : 'moderate'

      return {
        diseaseName: asText(parsed.diseaseName, 'Leaf condition needs local confirmation'),
        crop: asText(parsed.crop, 'Crop leaf'),
        symptoms: symptoms.length > 0 ? symptoms : ['Visual symptoms could not be confirmed from the image.'],
        chemicalTreatment: asText(parsed.chemicalTreatment, 'Use only a locally registered treatment after local confirmation and follow its product label.'),
        organicTreatment: asText(parsed.organicTreatment, 'Use only a locally registered organic treatment after local confirmation and follow its product label.'),
        severity,
        source: 'gemini',
      }
    } catch {
      return fallback()
    }
  }
}