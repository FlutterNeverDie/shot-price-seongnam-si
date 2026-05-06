import { SearchHeader } from './features/search/components/SearchHeader'
import { VaccineTabs } from './features/search/components/VaccineTabs'
import { DistrictTabs } from './features/search/components/DistrictTabs'
import { PriceList } from './features/price-list/components/PriceList'
import { Footer } from './components/common/Footer'
import { ApiKeyNotice } from './components/common/ApiKeyNotice'
import './App.css'

const SERVICE_KEY = import.meta.env.VITE_HIRA_SERVICE_KEY;

function App() {
  const hasApiKey = !!SERVICE_KEY && SERVICE_KEY !== 'undefined';

  return (
    <div className="app-container">
      {!hasApiKey && <ApiKeyNotice />}
      <SearchHeader />
      <VaccineTabs />
      <DistrictTabs />
      <main className="content-area">
        <PriceList />
      </main>
      <Footer />
    </div>
  )
}

export default App
