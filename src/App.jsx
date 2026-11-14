import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import WoundDetail from './pages/WoundDetail'
import UploadPage from './pages/UploadPage'
import ApiTest from './pages/ApiTest'
import NotFound from './pages/NotFound'
import AnalysisResult from './pages/AnalysisResult'
import WoundProgress from './pages/WoundProgress'
import WoundReport from './pages/WoundReport'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:patientId" element={<PatientDetail />} />
        <Route path="/wounds/:woundId" element={<WoundDetail />} />
        <Route
          path="/wounds/:woundId/progress"
          element={<WoundProgress />}
        />
        <Route path="/wounds/:woundId/report" element={<WoundReport />} />
        <Route
          path="/wounds/:woundId/results/:imageId"
          element={<AnalysisResult />}
        />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dev-test" element={<ApiTest />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}