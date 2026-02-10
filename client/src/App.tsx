
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout'; 
import { Dashboard } from './pages/Dashboard';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Layout> 
                <Dashboard/>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;