import MapView from "../src/components/map/components/MapView"
import './App.css'
import TripForm from './components/TripForm'

function App() {
  return (
    <main className="app">
      <TripForm />
      <MapView />
    </main>
  )
}

export default App
