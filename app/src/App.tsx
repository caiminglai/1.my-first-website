import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import ConceptAntibody from './pages/ConceptAntibody'
import UserSubmission from './pages/UserSubmission'
import CareerDeconstruction from './pages/CareerDeconstruction'
import TechDeconstruction from './pages/TechDeconstruction'
import TermTimeline from './pages/TermTimeline'
import DisciplinePage from './pages/DisciplinePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/discipline/:id" element={<DisciplinePage />} />
      <Route path="/antibody" element={<ConceptAntibody />} />
      <Route path="/submit" element={<UserSubmission />} />
      <Route path="/deconstruction" element={<CareerDeconstruction />} />
      <Route path="/tech" element={<TechDeconstruction />} />
      <Route path="/timeline" element={<TermTimeline />} />
    </Routes>
  )
}
