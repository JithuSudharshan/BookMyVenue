import { Routes, Route } from 'react-router-dom'
import UserRoutes from './routes/UserRoutes'
import VendorRoutes from './routes/VendorRoutes'

function App() {
  return (
    <div className="font-sans antialiased text-dark bg-background min-h-screen">
      <Routes>
        <Route path="/vendor/*" element={<VendorRoutes />} />
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
    </div>
  )
}

export default App
