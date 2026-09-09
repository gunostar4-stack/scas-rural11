import type {
  Crop,
  CropData,
  DiseaseRecord,
  Field,
  ID,
  MarketPriceRecord,
  RegionalAdvisoryRecommendation,
  SoilObservation,
} from './schema'

/** Small local-storage surface that can be replaced with an in-memory adapter in tests. */
export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type ScasCollection = 'crops' | 'fields' | 'soil-observations' | 'advisories'

export interface ScasStorageRecords {
  crops: Crop
  fields: Field
  'soil-observations': SoilObservation
  advisories: RegionalAdvisoryRecommendation
}

export type NewRecord<T extends { id: ID; createdAt: string; updatedAt: string }> =
  Omit<T, 'createdAt' | 'updatedAt'> &
  Partial<Pick<T, 'createdAt' | 'updatedAt'>>

const storagePrefix = 'scas:v1:'

function getDefaultStorage(): StorageAdapter | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function collectionKey(collection: ScasCollection): string {
  return `${storagePrefix}${collection}`
}

function isRecordArray(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every((item) => item !== null && typeof item === 'object')
}

/** Loads a collection, returning an empty array for missing, malformed, or unavailable storage. */
export function loadRecords<K extends ScasCollection>(
  collection: K,
  storage: StorageAdapter | null = getDefaultStorage(),
): ScasStorageRecords[K][] {
  if (!storage) return []

  try {
    const rawValue = storage.getItem(collectionKey(collection))
    if (!rawValue) return []

    const parsedValue: unknown = JSON.parse(rawValue)
    return isRecordArray(parsedValue) ? (parsedValue as unknown as ScasStorageRecords[K][]) : []
  } catch {
    return []
  }
}

/** Saves an entire normalized collection. Returns false when persistence is unavailable. */
export function saveRecords<K extends ScasCollection>(
  collection: K,
  records: readonly ScasStorageRecords[K][],
  storage: StorageAdapter | null = getDefaultStorage(),
): boolean {
  if (!storage) return false

  try {
    storage.setItem(collectionKey(collection), JSON.stringify(records))
    return true
  } catch {
    return false
  }
}

/** Filters any loaded collection without weakening its record type. */
export function filterRecords<K extends ScasCollection>(
  collection: K,
  predicate: (record: ScasStorageRecords[K]) => boolean,
  storage?: StorageAdapter | null,
): ScasStorageRecords[K][] {
  return loadRecords(collection, storage).filter(predicate)
}

/** Inserts a record with generated audit timestamps and rejects duplicate stable IDs. */
export function insertRecord<K extends ScasCollection>(
  collection: K,
  record: NewRecord<ScasStorageRecords[K]>,
  storage: StorageAdapter | null = getDefaultStorage(),
  now: () => string = () => new Date().toISOString(),
): ScasStorageRecords[K] {
  const existingRecords = loadRecords(collection, storage)
  if (existingRecords.some((existingRecord) => existingRecord.id === record.id)) {
    throw new Error(`A ${collection} record with id "${record.id}" already exists.`)
  }

  const timestamp = now()
  const savedRecord = {
    ...record,
    createdAt: record.createdAt ?? timestamp,
    updatedAt: record.updatedAt ?? timestamp,
  } as ScasStorageRecords[K]

  if (!saveRecords(collection, [...existingRecords, savedRecord], storage)) {
    throw new Error('SCAS local storage is unavailable or full.')
  }

  return savedRecord
}

export const loadCrops = (storage?: StorageAdapter | null) => loadRecords('crops', storage)
export const saveCrops = (records: readonly Crop[], storage?: StorageAdapter | null) => saveRecords('crops', records, storage)
export const insertCrop = (record: NewRecord<Crop>, storage?: StorageAdapter | null) => insertRecord('crops', record, storage)

export const loadFields = (storage?: StorageAdapter | null) => loadRecords('fields', storage)
export const saveFields = (records: readonly Field[], storage?: StorageAdapter | null) => saveRecords('fields', records, storage)
export const insertField = (record: NewRecord<Field>, storage?: StorageAdapter | null) => insertRecord('fields', record, storage)
export const getFieldsForFarm = (farmId: ID, storage?: StorageAdapter | null) => filterRecords('fields', (field) => field.farmId === farmId, storage)

export const loadSoilObservations = (storage?: StorageAdapter | null) => loadRecords('soil-observations', storage)
export const saveSoilObservations = (records: readonly SoilObservation[], storage?: StorageAdapter | null) => saveRecords('soil-observations', records, storage)
export const insertSoilObservation = (record: NewRecord<SoilObservation>, storage?: StorageAdapter | null) => insertRecord('soil-observations', record, storage)
export const getSoilObservationsForField = (fieldId: ID, storage?: StorageAdapter | null) => filterRecords('soil-observations', (observation) => observation.fieldId === fieldId, storage)

export const loadAdvisories = (storage?: StorageAdapter | null) => loadRecords('advisories', storage)
export const saveAdvisories = (records: readonly RegionalAdvisoryRecommendation[], storage?: StorageAdapter | null) => saveRecords('advisories', records, storage)
export const insertAdvisory = (record: NewRecord<RegionalAdvisoryRecommendation>, storage?: StorageAdapter | null) => insertRecord('advisories', record, storage)
export const getAdvisoriesForRegion = (regionId: ID, storage?: StorageAdapter | null) => filterRecords('advisories', (advisory) => advisory.regionId === regionId, storage)

const offlineCropData: readonly CropData[] = [
  { id: 'india-wheat', name: 'Wheat', regionalNames: { Hindi: 'गेहूं', Marathi: 'गहू', Punjabi: 'ਕਣਕ' }, agroClimaticZone: 'Upper and Middle Gangetic Plains', npkRatio: { nitrogen: 120, phosphorus: 60, potassium: 40 } },
  { id: 'india-paddy', name: 'Paddy', regionalNames: { Hindi: 'धान', Marathi: 'भात', Tamil: 'நெல்' }, agroClimaticZone: 'Eastern and Coastal Plains', npkRatio: { nitrogen: 100, phosphorus: 50, potassium: 50 } },
  { id: 'india-soybean', name: 'Soybean', regionalNames: { Hindi: 'सोयाबीन', Marathi: 'सोयाबीन' }, agroClimaticZone: 'Central Plateau and Hills', npkRatio: { nitrogen: 20, phosphorus: 60, potassium: 40 } },
  { id: 'india-onion', name: 'Onion', regionalNames: { Hindi: 'प्याज', Marathi: 'कांदा', Kannada: 'ಈರುಳ್ಳಿ' }, agroClimaticZone: 'Western Plateau and Hills', npkRatio: { nitrogen: 100, phosphorus: 50, potassium: 50 } },
]

const offlineDiseaseData: readonly DiseaseRecord[] = [
  { id: 'disease-wheat-rust', cropId: 'india-wheat', diseaseName: 'Wheat leaf rust', symptoms: ['Orange-brown leaf pustules', 'Premature leaf drying'], severity: 'high', organicTreatment: 'Use neem-based formulations and remove heavily affected leaves.', chemicalTreatment: 'Use only a locally registered triazole fungicide as directed on its label.' },
  { id: 'disease-paddy-blast', cropId: 'india-paddy', diseaseName: 'Rice blast', symptoms: ['Diamond-shaped leaf lesions', 'Neck rot in panicles'], severity: 'high', organicTreatment: 'Apply a registered Bacillus-based biofungicide and avoid excess nitrogen.', chemicalTreatment: 'Use only a locally registered blast fungicide according to its label.' },
  { id: 'disease-soybean-rust', cropId: 'india-soybean', diseaseName: 'Soybean rust', symptoms: ['Small tan lesions', 'Rust-coloured pustules under leaves'], severity: 'moderate', organicTreatment: 'Improve airflow and apply a registered neem or biofungicide product.', chemicalTreatment: 'Use a locally registered fungicide with label-directed rotation of modes of action.' },
  { id: 'disease-onion-purple-blotch', cropId: 'india-onion', diseaseName: 'Onion purple blotch', symptoms: ['Purple concentric leaf spots', 'Leaf tip dieback'], severity: 'moderate', organicTreatment: 'Remove infected debris and use a registered copper-based organic treatment.', chemicalTreatment: 'Use only a locally registered protectant fungicide according to the product label.' },
]

const offlineMarketPrices: readonly MarketPriceRecord[] = [
  { id: 'price-nashik-onion', cropId: 'india-onion', districtName: 'Nashik', marketName: 'Lasalgaon APMC', state: 'Maharashtra', modalPriceInrPerQuintal: 2450, observedOn: '2026-09-09', trend: 'rising' },
  { id: 'price-nashik-soybean', cropId: 'india-soybean', districtName: 'Nashik', marketName: 'Nashik APMC', state: 'Maharashtra', modalPriceInrPerQuintal: 4280, observedOn: '2026-09-09', trend: 'stable' },
  { id: 'price-pune-onion', cropId: 'india-onion', districtName: 'Pune', marketName: 'Pune APMC', state: 'Maharashtra', modalPriceInrPerQuintal: 2310, observedOn: '2026-09-09', trend: 'falling' },
  { id: 'price-pune-wheat', cropId: 'india-wheat', districtName: 'Pune', marketName: 'Pune APMC', state: 'Maharashtra', modalPriceInrPerQuintal: 2675, observedOn: '2026-09-09', trend: 'rising' },
  { id: 'price-latur-soybean', cropId: 'india-soybean', districtName: 'Latur', marketName: 'Latur APMC', state: 'Maharashtra', modalPriceInrPerQuintal: 4190, observedOn: '2026-09-09', trend: 'stable' },
  { id: 'price-latur-paddy', cropId: 'india-paddy', districtName: 'Latur', marketName: 'Latur APMC', state: 'Maharashtra', modalPriceInrPerQuintal: 2480, observedOn: '2026-09-09', trend: 'rising' },
  { id: 'price-lucknow-paddy', cropId: 'india-paddy', districtName: 'Lucknow', marketName: 'Lucknow Mandi', state: 'Uttar Pradesh', modalPriceInrPerQuintal: 2350, observedOn: '2026-09-09', trend: 'stable' },
]

/** Offline-first cache for the India crop, disease, and e-NAM price snapshots. */
export class StorageService {
  private readonly storage: StorageAdapter

  constructor(storage?: StorageAdapter) {
    this.storage = storage ?? this.createStorageAdapter()
  }

  initializeStorage(): void {
    this.ensureCollection('crop-data', offlineCropData)
    this.ensureCollection('disease-data', offlineDiseaseData)
    this.ensureCollection('market-prices', offlineMarketPrices)
  }

  getCrops(): CropData[] { return this.readCollection<CropData>('crop-data') }
  getDiseases(): DiseaseRecord[] { return this.readCollection<DiseaseRecord>('disease-data') }
  getMarketPrices(): MarketPriceRecord[] { return this.readCollection<MarketPriceRecord>('market-prices') }

  getMarketPricesByDistrict(districtName: string): MarketPriceRecord[] {
    const normalizedDistrict = districtName.trim().toLocaleLowerCase('en-IN')
    return this.getMarketPrices().filter((price) => price.districtName.toLocaleLowerCase('en-IN').includes(normalizedDistrict))
  }

  private createStorageAdapter(): StorageAdapter {
    if (typeof window !== 'undefined') {
      try { return window.localStorage } catch { /* Use volatile storage if browser access is denied. */ }
    }
    const memoryCache = new Map<string, string>()
    return { getItem: (key) => memoryCache.get(key) ?? null, setItem: (key, value) => { memoryCache.set(key, value) } }
  }

  private ensureCollection<T>(name: string, defaults: readonly T[]): void {
    if (this.readCollection<T>(name).length === 0) this.storage.setItem(`${storagePrefix}offline:${name}`, JSON.stringify(defaults))
  }

  private readCollection<T>(name: string): T[] {
    try {
      const rawValue = this.storage.getItem(`${storagePrefix}offline:${name}`)
      const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : []
      return Array.isArray(parsedValue) ? parsedValue as T[] : []
    } catch { return [] }
  }
}
