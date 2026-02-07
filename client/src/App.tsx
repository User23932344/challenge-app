
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthStore } from './store/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <div>
                
                <div style={{ padding: '20px' }}>
                  <h1>Dashboard (временная заглушка)</h1>
                  <p>Добро пожаловать, {user?.username}!</p>
                </div>
              </div>
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