import { AdvisoryRecommendationPanel } from './components/AdvisoryRecommendationPanel'
import { CropMonitoringView } from './components/CropMonitoringView'
import { DashboardShell } from './components/DashboardShell'
import { DiseaseAnalyzerPanel } from './components/DiseaseAnalyzerPanel'
import { FieldManager } from './components/FieldManager'
import { MarketPanel } from './components/MarketPanel'
import { FarmerHomeHero } from './components/FarmerHomeHero'

function App() {
  return (
    <>
      <FarmerHomeHero />
      <DashboardShell>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)]">
          <CropMonitoringView />
          <FieldManager />
        </div>
        <div className="mt-6">
          <AdvisoryRecommendationPanel />
        </div>
        <div id="leaf-analysis" className="mt-6">
          <DiseaseAnalyzerPanel />
        </div>
        <div id="market" className="mt-6">
          <MarketPanel />
        </div>
      </DashboardShell>
    </>
  )
}

export default App
