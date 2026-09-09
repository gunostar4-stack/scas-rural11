/** Normalized, persistence-agnostic SCAS data contracts. */
export type ID = string
export type ISODateTime = string

export type SoilTexture = 'sandy' | 'silty' | 'loamy' | 'clayey'
export type DrainageClass = 'poor' | 'moderate' | 'well'
export type WeatherTrend = 'drying' | 'stable' | 'wetting'
export type AdvisoryPriority = 'low' | 'medium' | 'high' | 'critical'
export type AdvisoryAction = 'irrigate' | 'fertilize' | 'scout' | 'protect' | 'delay-planting'
export type MarketTrend = 'rising' | 'falling' | 'stable'
export type DiseaseSeverity = 'low' | 'moderate' | 'high' | 'critical'

export interface AuditFields { createdAt: ISODateTime; updatedAt: ISODateTime }

export interface Region extends AuditFields {
  id: ID
  name: string
  country: string
  climateZone: string
}

export interface Farm extends AuditFields {
  id: ID
  regionId: ID
  name: string
  latitude: number
  longitude: number
}

export interface Field extends AuditFields {
  id: ID
  farmId: ID
  name: string
  areaHectares: number
}

export interface Crop extends AuditFields {
  id: ID
  name: string
  scientificName: string
  plantingWindowMonths: number[]
  optimalPhRange: { min: number; max: number }
}

export interface SoilType extends AuditFields {
  id: ID
  name: string
  texture: SoilTexture
  drainage: DrainageClass
  typicalPhRange: { min: number; max: number }
}

/** A time-bound planting of one crop in one field. */
export interface GrowingSeason extends AuditFields {
  id: ID
  fieldId: ID
  cropId: ID
  plantedOn: string
  expectedHarvestOn: string | null
  seasonLabel: string
}

/** Raw field measurement; unit names are kept on numeric properties. */
export interface SoilObservation extends AuditFields {
  id: ID
  fieldId: ID
  soilTypeId: ID
  observedAt: ISODateTime
  ph: number
  nitrogenMgPerKg: number | null
  phosphorusMgPerKg: number | null
  potassiumMgPerKg: number | null
  moisturePercent: number | null
  source: string
}

/** Raw regional weather observation rather than a derived recommendation. */
export interface WeatherCondition extends AuditFields {
  id: ID
  regionId: ID
  observedAt: ISODateTime
  temperatureCelsius: number
  rainfallMillimeters: number
  humidityPercent: number
  trend: WeatherTrend
  source: string
}

/** Derived advice with explicit provenance and foreign-key references. */
export interface RegionalAdvisoryRecommendation extends AuditFields {
  id: ID
  regionId: ID
  cropId: ID
  soilTypeId: ID | null
  priority: AdvisoryPriority
  action: AdvisoryAction
  title: string
  message: string
  validFrom: ISODateTime
  validUntil: ISODateTime
  source: string
  ruleVersion: string
}

/** Phase 1 crop profile used for offline Indian crop guidance. */
export interface CropData {
  id: ID
  name: 'Wheat' | 'Paddy' | 'Soybean' | 'Onion'
  regionalNames: Readonly<Record<string, string>>
  agroClimaticZone: string
  npkRatio: { nitrogen: number; phosphorus: number; potassium: number }
}

export interface DiseaseRecord {
  id: ID
  cropId: CropData['id']
  diseaseName: string
  symptoms: readonly string[]
  severity: DiseaseSeverity
  organicTreatment: string
  chemicalTreatment: string
}

/** e-NAM-style price snapshot. Monetary values are Indian rupees per quintal. */
export interface MarketPriceRecord {
  id: ID
  cropId: CropData['id']
  districtName: string
  marketName: string
  state: string
  modalPriceInrPerQuintal: number
  observedOn: string
  trend: MarketTrend
}

const mockTimestamp = '2026-09-09T08:00:00Z'

export const mockCrops: Crop[] = [
  { id: 'crop-maize', name: 'Maize', scientificName: 'Zea mays', plantingWindowMonths: [3, 4, 5, 6], optimalPhRange: { min: 5.8, max: 7 }, createdAt: mockTimestamp, updatedAt: mockTimestamp },
  { id: 'crop-rice', name: 'Rice', scientificName: 'Oryza sativa', plantingWindowMonths: [5, 6, 7], optimalPhRange: { min: 5.5, max: 6.5 }, createdAt: mockTimestamp, updatedAt: mockTimestamp },
  { id: 'crop-soybean', name: 'Soybean', scientificName: 'Glycine max', plantingWindowMonths: [4, 5, 6], optimalPhRange: { min: 6, max: 7 }, createdAt: mockTimestamp, updatedAt: mockTimestamp },
]

export const mockSoilTypes: SoilType[] = [
  { id: 'soil-loam', name: 'River Valley Loam', texture: 'loamy', drainage: 'well', typicalPhRange: { min: 6, max: 7.2 }, createdAt: mockTimestamp, updatedAt: mockTimestamp },
  { id: 'soil-clay', name: 'Red Clay', texture: 'clayey', drainage: 'moderate', typicalPhRange: { min: 5.5, max: 6.8 }, createdAt: mockTimestamp, updatedAt: mockTimestamp },
  { id: 'soil-sand', name: 'Coastal Sand', texture: 'sandy', drainage: 'well', typicalPhRange: { min: 5, max: 6.5 }, createdAt: mockTimestamp, updatedAt: mockTimestamp },
]

export const mockRegions: Region[] = [
  { id: 'region-northern-plains', name: 'Northern Plains', country: 'Ghana', climateZone: 'Tropical savanna', createdAt: mockTimestamp, updatedAt: mockTimestamp },
  { id: 'region-coastal-belt', name: 'Coastal Belt', country: 'Ghana', climateZone: 'Tropical wet and dry', createdAt: mockTimestamp, updatedAt: mockTimestamp },
]

export const mockWeatherConditions: WeatherCondition[] = [
  { id: 'weather-northern-plains-2026-09-09', regionId: 'region-northern-plains', observedAt: mockTimestamp, temperatureCelsius: 27.4, rainfallMillimeters: 4.2, humidityPercent: 71, trend: 'wetting', source: 'SCAS weather station', createdAt: mockTimestamp, updatedAt: mockTimestamp },
  { id: 'weather-coastal-belt-2026-09-09', regionId: 'region-coastal-belt', observedAt: mockTimestamp, temperatureCelsius: 29.1, rainfallMillimeters: 0.8, humidityPercent: 64, trend: 'drying', source: 'SCAS weather station', createdAt: mockTimestamp, updatedAt: mockTimestamp },
]

export const mockRegionalAdvisories: RegionalAdvisoryRecommendation[] = [
  { id: 'advisory-northern-maize-scout', regionId: 'region-northern-plains', cropId: 'crop-maize', soilTypeId: 'soil-loam', priority: 'high', action: 'scout', title: 'Scout maize for fungal pressure', message: 'Recent rainfall and high humidity increase disease risk. Inspect lower leaves within 48 hours.', validFrom: '2026-09-09T00:00:00Z', validUntil: '2026-09-12T23:59:59Z', source: 'SCAS crop disease rule set', ruleVersion: 'disease-risk-1.0.0', createdAt: mockTimestamp, updatedAt: mockTimestamp },
  { id: 'advisory-coastal-soybean-irrigate', regionId: 'region-coastal-belt', cropId: 'crop-soybean', soilTypeId: 'soil-sand', priority: 'medium', action: 'irrigate', title: 'Schedule light irrigation', message: 'Sandy soil and a drying weather trend may reduce available moisture. Irrigate during the next cool period.', validFrom: '2026-09-09T00:00:00Z', validUntil: '2026-09-11T23:59:59Z', source: 'SCAS soil moisture rule set', ruleVersion: 'moisture-balance-1.0.0', createdAt: mockTimestamp, updatedAt: mockTimestamp },
]
