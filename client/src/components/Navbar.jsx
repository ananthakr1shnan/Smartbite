import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Check for both token and userEmail
  const isLoggedIn = localStorage.getItem('token') || localStorage.getItem('userEmail');

  console.log('Login status:', isLoggedIn); // Debug log

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  // Remove this condition to always show navbar except on login/register
  if (!isLoggedIn && ['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2">
              <span className="text-2xl">🍳</span>
              <span className="font-bold text-xl text-indigo-900">SmartBite</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;