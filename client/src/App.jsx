import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';
import ChannelPage from './pages/ChannelPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="hero-glow" />
        <Navbar />
        <Routes>
          <Route path="/"            element={<Feed />} />
          <Route path="/posts/:id"   element={<PostDetail />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/u/:username" element={<ProfilePage />} />
          <Route path="/c/:tag"      element={<ChannelPage />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
