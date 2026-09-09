import type { MarketPriceRecord, MarketTrend } from '../db/schema'
import { StorageService } from '../db/storage'

export class MarketService {
  private readonly storageService: StorageService

  constructor(storageService: StorageService = new StorageService()) {
    this.storageService = storageService
    this.storageService.initializeStorage()
  }

  fetchDistrictPrices(districtName: string): MarketPriceRecord[] {
    return this.storageService.getMarketPricesByDistrict(districtName)
  }

  getTrendIndicator(trend: MarketTrend): string {
    if (trend === 'rising') return 'bg-emerald-100 text-emerald-800'
    if (trend === 'falling') return 'bg-rose-100 text-rose-800'
    return 'bg-stone-100 text-stone-700'
  }
}
