import React from 'react';
import { Outlet } from 'react-router-dom';
import '../components/user/Profile/Profile.css';

function MainLayout() {
  return (
    <div className="profile-theme-scope">
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
