import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Courses from './pages/Courses';
import FeaturesServices from './pages/FeaturesServices';
import About from './pages/About';
import Contact from './pages/Contact';
import CourseResults from './pages/CourseResults';
import SemestersList from './pages/SemestersList';
import SubjectsList from './pages/SubjectsList';
import Notes from './pages/Notes';
import SubjectDetail from './pages/SubjectDetail';
import Analytics from './pages/Analytics';
import AdminContact from './pages/AdminContact';

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
        
        <Route path="/" element={<MainLayout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/results" element={<CourseResults />} />
          <Route path="features-services" element={<FeaturesServices />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Protected Routes */}
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="admin/contact" element={<ProtectedRoute><AdminContact /></ProtectedRoute>} />
          <Route path="subjects/:id" element={<ProtectedRoute><SubjectDetail /></ProtectedRoute>} />
          <Route path="course/:courseId/semesters" element={<ProtectedRoute><SemestersList /></ProtectedRoute>} />
          <Route path="course/:courseId/semesters/:semester/subjects" element={<ProtectedRoute><SubjectsList /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
