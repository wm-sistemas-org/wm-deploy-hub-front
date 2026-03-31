import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/auth/Login';
import { Projects } from './pages/dashboard/Projects';
import { Releases } from './pages/dashboard/Releases';
import { useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

// Dashboard wrapper to provide layout
function Dashboard() {
  const { logout, user } = useAuth();
  return (
    <DashboardLayout onLogout={logout} userName={user?.name || "User"}>
      <Routes>
        <Route path="/" element={<Navigate to="projects" replace />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId/releases" element={<Releases />} />
      </Routes>
    </DashboardLayout>
  );
}


import { PublicPortal } from './pages/public/PublicPortal';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/public/:orgSlug" element={<PublicPortal />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
