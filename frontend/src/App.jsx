import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './layouts/MainLayout';
import PatientDashboard from './pages/PatientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmergencyForm from './pages/EmergencyForm';
import EmergencyTracking from './pages/EmergencyTracking';
import HealthProfile from './pages/HealthProfile';
import SystemDiagnostics from './pages/SystemDiagnostics';
import { Toaster } from 'react-hot-toast';
import Chatbot from './components/Chatbot';

// Auth Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: {
          borderRadius: '20px',
          background: '#0f172a',
          color: '#fff',
          padding: '16px 24px',
          fontWeight: 'bold',
          fontSize: '14px'
        },
      }} />
      <Chatbot />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/system-diagnostics" element={<SystemDiagnostics />} />

        {/* Patient Routes */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <MainLayout role="patient" />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="emergency" element={<EmergencyForm />} />
          <Route path="tracking/:id" element={<EmergencyTracking />} />
          <Route path="health" element={<HealthProfile />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Hospital Routes */}
        <Route path="/hospital" element={
          <ProtectedRoute allowedRoles={['hospital']}>
            <MainLayout role="hospital" />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<HospitalDashboard />} />
          <Route path="resources" element={<HospitalDashboard />} />
          <Route path="queue" element={<HospitalDashboard />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminDashboard />} />
          <Route path="settings" element={<AdminDashboard />} />
          <Route path="config" element={<Navigate to="/admin/settings" />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
