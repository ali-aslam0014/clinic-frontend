import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReceptionistLayout from './components/layout/ReceptionistLayout';
import Dashboard from './pages/receptionist/Dashboard';
// ... other imports

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/receptionist/*" element={
          <ReceptionistLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              {/* Add other receptionist routes here */}
            </Routes>
          </ReceptionistLayout>
        } />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App; 