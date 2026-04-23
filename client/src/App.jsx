import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Videos from './pages/Videos';
import Semesters from './pages/Semesters';
import SubjectDetail from './pages/SubjectDetail';
import Analytics from './pages/Analytics';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="notes" element={<Notes />} />
          <Route path="videos" element={<Videos />} />
          <Route path="semesters" element={<Semesters />} />
          <Route path="subjects/:id" element={<SubjectDetail />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
