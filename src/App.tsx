import { SearchHeader } from './features/search/components/SearchHeader'
import { VaccineTabs } from './features/search/components/VaccineTabs'
import { PriceList } from './features/price-list/components/PriceList'
import { Footer } from './components/common/Footer'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <SearchHeader />
      <VaccineTabs />
      <main className="content-area">
        <PriceList />
      </main>
      <Footer />
    </div>
  )
}

export default App
