import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Drive from './pages/Drive/Drive';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Các route KHÔNG CÓ Sidebar/Header (Trang độc lập) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Các route CÓ Sidebar/Header (Nằm trong MainLayout) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Drive />} />
          {/* Tuần sau làm thêm trang Trash sau */}
          <Route path="trash" element={<div className="p-4">Trash Page Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;