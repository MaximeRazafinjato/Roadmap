import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/auth-context';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/auth/protected-route';
import { AdminRoute } from './components/auth/AdminRoute';
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import Layout from './components/Layout';
import StepsPageTable from './pages/StepsPageTable';
import StepDetailPage from './pages/StepDetailPage';
import TimelinePage from './pages/TimelinePage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/auth/login-page';
import RegisterPage from './pages/auth/register-page';
import './App.css';
import './styles/step-form.css';
import './styles/step-buttons.css';
import './styles/timeline.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public routes (only accessible when not authenticated) */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <RegisterPage />
                      </PublicRoute>
                    }
                  />

                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/timeline" replace />} />
                    <Route path="timeline" element={<TimelinePage />} />
                    <Route path="steps" element={<StepsPageTable />} />
                    <Route path="steps/:id" element={<StepDetailPage />} />
                    <Route
                      path="users"
                      element={
                        <AdminRoute>
                          <UsersPage />
                        </AdminRoute>
                      }
                    />
                  </Route>

                  {/* Unauthorized page */}
                  <Route
                    path="/unauthorized"
                    element={
                      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
                          <p className="text-gray-600 mb-4">
                            You don't have permission to access this resource.
                          </p>
                          <Navigate to="/timeline" />
                        </div>
                      </div>
                    }
                  />

                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/timeline" replace />} />
                </Routes>
              </AnimatePresence>
              <Toaster
                position="bottom-right"
                richColors
                expand
                closeButton
                duration={4000}
                theme="auto"
              />
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
