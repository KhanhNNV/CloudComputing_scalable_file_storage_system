import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Outlet là nơi các trang con (Drive, Trash) sẽ được render */}
          <Outlet context={{ searchQuery, setSearchQuery }} /> 
        </main>
      </div>
    </div>
  );
}