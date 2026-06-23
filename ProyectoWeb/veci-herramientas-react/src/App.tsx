import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToolsProvider } from './context/ToolsContext';
import { LoansProvider } from './context/LoansContext';
import { type ReactNode } from 'react';

// --- PÁGINAS EXISTENTES ---
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MyLoansPage from './pages/MyLoansPage';

// --- NUEVAS PÁGINAS INTEGRADAS ---
import ToolsPage from './pages/ToolsPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import UnavailableToolsPage from './pages/UnavailableToolsPage';

// --- GUARDS (PROTECCIÓN DE RUTAS) ---

// 1. ProtectedRoute: Si NO está logueado, manda al Login
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-blue-600 font-medium">Cargando Veci-Herramientas...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 2. PublicRoute: Si YA está logueado, manda al Dashboard
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- APP PRINCIPAL ---

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToolsProvider>
          <LoansProvider>
            
            <Routes>
              {/* Redirección inicial */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Ruta PÚBLICA (Login) */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />

              {/* Rutas PROTEGIDAS (Requieren Login) */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* Catálogo y Gestión de Herramientas */}
              <Route path="/tools" element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
              <Route path="/unavailable" element={<ProtectedRoute><UnavailableToolsPage /></ProtectedRoute>} />

              {/* Préstamos */}
              <Route path="/my-loans" element={<ProtectedRoute><MyLoansPage /></ProtectedRoute>} />

              {/* Social y Perfil */}
              <Route path="/user/:id" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

              {/* Administración */}
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

              {/* Ruta 404 - Redirigir al Dashboard o Login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

          </LoansProvider>
        </ToolsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;