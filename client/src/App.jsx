import { Navigate, Route, Routes } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}

export default App;
