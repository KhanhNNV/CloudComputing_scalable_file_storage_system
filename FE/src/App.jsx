import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Drive from './pages/Drive/Drive';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Drive />} />
            <Route path="trash" element={<div className="p-4">Trash Page Coming Soon</div>} />
          </Route>
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;