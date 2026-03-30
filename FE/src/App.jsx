import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Drive from './pages/Drive/Drive';

function App() {
  return (
    <BrowserRouter>
      <Routes>
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