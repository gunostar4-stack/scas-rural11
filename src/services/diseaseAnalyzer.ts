/**
 * A deterministic, browser-side disease-classification simulation.
 * Replace `extractSimulatedFeatureVector` with an on-device or API model when
 * a validated vision model becomes available; the catalog and result contract
 * can remain unchanged.
 */

export type SeverityRating = 'low' | 'moderate' | 'high' | 'critical'

export interface PesticideTreatment {
  name: string
  type: 'organic' | 'chemical'
  application: string
  precautions: string
}

export interface DiseaseCatalogEntry {
  id: string
  diseaseName: string
  crop: string
  pathogen: string
  visualFeatureVector: readonly number[]
  treatments: readonly PesticideTreatment[]
}

export interface DiseaseAnalysisResult {
  predictedDiseaseName: string
  crop: string
  confidenceLevel: number
  severityRating: SeverityRating
  recommendedTreatments: PesticideTreatment[]
  analysisMethod: 'simulated-feature-vector-match'
  analyzedFileName: string
}

const featureVectorLength = 8
const maximumImageBytes = 10 * 1024 * 1024

/** Representative catalog entries for common Indian crop leaf diseases. */
export const indianCropDiseaseCatalog: readonly DiseaseCatalogEntry[] = [
  {
    id: 'wheat-leaf-rust',
    diseaseName: 'Wheat leaf rust',
    crop: 'Wheat',
    pathogen: 'Puccinia triticina',
    visualFeatureVector: [0.91, 0.32, 0.18, 0.76, 0.45, 0.63, 0.24, 0.58],
    treatments: [
      { name: 'Neem oil', type: 'organic', application: 'Apply a labelled neem-based formulation to both leaf surfaces at the first sign of infection.', precautions: 'Test on a small area first and avoid spraying during strong sun or rain.' },
      { name: 'Propiconazole', type: 'chemical', application: 'Use only a locally registered formulation and follow the product label for crop stage, dose, and interval.', precautions: 'Wear required PPE and follow the pre-harvest interval on the label.' },
    ],
  },
  {
    id: 'rice-blast',
    diseaseName: 'Rice blast',
    crop: 'Rice',
    pathogen: 'Magnaporthe oryzae',
    visualFeatureVector: [0.26, 0.84, 0.69, 0.31, 0.77, 0.42, 0.55, 0.19],
    treatments: [
      { name: 'Bacillus subtilis biofungicide', type: 'organic', application: 'Apply a registered biofungicide according to its label and improve field airflow where practical.', precautions: 'Use a freshly prepared spray mix and do not mix with incompatible products.' },
      { name: 'Tricyclazole', type: 'chemical', application: 'Use only a locally registered formulation as directed on the label after confirming disease pressure.', precautions: 'Respect label restrictions, PPE requirements, and water-body buffer guidance.' },
    ],
  },
  {
    id: 'tomato-early-blight',
    diseaseName: 'Tomato early blight',
    crop: 'Tomato',
    pathogen: 'Alternaria solani',
    visualFeatureVector: [0.62, 0.21, 0.88, 0.47, 0.38, 0.74, 0.53, 0.67],
    treatments: [
      { name: 'Copper soap', type: 'organic', application: 'Apply a registered copper soap at the label rate, focusing on lower and older leaves.', precautions: 'Avoid repeated overuse; copper can accumulate in soil.' },
      { name: 'Mancozeb', type: 'chemical', application: 'Use a locally registered protectant fungicide in line with the label and resistance-management plan.', precautions: 'Follow all PPE, re-entry, and pre-harvest instructions.' },
    ],
  },
  {
    id: 'tomato-late-blight',
    diseaseName: 'Tomato late blight',
    crop: 'Tomato',
    pathogen: 'Phytophthora infestans',
    visualFeatureVector: [0.43, 0.64, 0.28, 0.89, 0.71, 0.35, 0.82, 0.46],
    treatments: [
      { name: 'Bacillus-based biofungicide', type: 'organic', application: 'Apply a registered product preventively or at the earliest symptoms, following label timing.', precautions: 'Remove severely infected leaves and sanitize tools to reduce spread.' },
      { name: 'Cymoxanil + mancozeb', type: 'chemical', application: 'Use only a locally registered product and rotate modes of action according to its label.', precautions: 'Do not exceed label limits; observe PPE and harvest intervals.' },
    ],
  },
]

function normalize(vector: readonly number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0))
  return magnitude === 0 ? vector.map(() => 0) : vector.map((value) => value / magnitude)
}

function cosineSimilarity(left: readonly number[], right: readonly number[]): number {
  if (left.length !== featureVectorLength || right.length !== featureVectorLength) {
    throw new Error(`Feature vectors must contain ${featureVectorLength} values.`)
  }
  const normalizedLeft = normalize(left)
  const normalizedRight = normalize(right)
  return normalizedLeft.reduce((sum, value, index) => sum + value * normalizedRight[index], 0)
}

function severityFromConfidence(confidenceLevel: number): SeverityRating {
  if (confidenceLevel >= 0.88) return 'critical'
  if (confidenceLevel >= 0.75) return 'high'
  if (confidenceLevel >= 0.6) return 'moderate'
  return 'low'
}

/** Classifies a precomputed visual feature vector, allowing a real model to be plugged in later. */
export function classifyLeafFeatureVector(featureVector: readonly number[]): Omit<DiseaseAnalysisResult, 'analyzedFileName'> {
  const match = indianCropDiseaseCatalog.reduce((bestMatch, candidate) => {
    const similarity = cosineSimilarity(featureVector, candidate.visualFeatureVector)
    return similarity > bestMatch.similarity ? { candidate, similarity } : bestMatch
  }, { candidate: indianCropDiseaseCatalog[0], similarity: -1 })
  const confidenceLevel = Number(Math.max(0, Math.min(1, match.similarity)).toFixed(2))

  return {
    predictedDiseaseName: match.candidate.diseaseName,
    crop: match.candidate.crop,
    confidenceLevel,
    severityRating: severityFromConfidence(confidenceLevel),
    recommendedTreatments: match.candidate.treatments.map((treatment) => ({ ...treatment })),
    analysisMethod: 'simulated-feature-vector-match',
  }
}

/**
 * Produces a repeatable simulation vector from image bytes. It is not a
 * biological diagnosis and must not be used as the sole basis for treatment.
 */
export async function extractSimulatedFeatureVector(image: File): Promise<number[]> {
  if (!image.type.startsWith('image/')) throw new Error('Please provide an image file.')
  if (image.size === 0) throw new Error('The image file is empty.')
  if (image.size > maximumImageBytes) throw new Error('The image must be 10 MB or smaller.')

  const bytes = new Uint8Array(await image.arrayBuffer())
  const bucketTotals = Array.from({ length: featureVectorLength }, () => 0)
  const bucketCounts = Array.from({ length: featureVectorLength }, () => 0)
  const stride = Math.max(1, Math.floor(bytes.length / 4096))

  for (let index = 0; index < bytes.length; index += stride) {
    const bucket = Math.floor((index / bytes.length) * featureVectorLength)
    bucketTotals[bucket] += bytes[index]
    bucketCounts[bucket] += 1
  }

  return bucketTotals.map((total, index) => total / (bucketCounts[index] * 255 || 1))
}

/** Accepts a browser File and returns a JSON-serializable simulated diagnosis. */
export async function analyzeLeafImage(image: File): Promise<DiseaseAnalysisResult> {
  const featureVector = await extractSimulatedFeatureVector(image)
  return { ...classifyLeafFeatureVector(featureVector), analyzedFileName: image.name }
}
