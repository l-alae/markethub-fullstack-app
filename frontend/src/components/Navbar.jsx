import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiShoppingBag, FiLogOut, FiUser, FiBarChart2, FiUsers } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
            <FiShoppingBag className="text-2xl" />
            MarketHub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
              Products
            </Link>
            {user && (
              <>
                <Link to="/products/new" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                  Add Product
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors font-medium flex items-center gap-1">
                  <FiBarChart2 /> Dashboard
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin/users" className="text-gray-600 hover:text-primary-600 transition-colors font-medium flex items-center gap-1">
                <FiUsers /> Users
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <FiUser />
                  {user.username}
                  {isAdmin && (
                    <span className="ml-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Admin</span>
                  )}
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-1">
                  <FiLogOut /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 pb-4 space-y-2">
          <Link to="/products" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-primary-600">
            Products
          </Link>
          {user && (
            <>
              <Link to="/products/new" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-primary-600">
                Add Product
              </Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-primary-600">
                Dashboard
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin/users" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-primary-600">
              Manage Users
            </Link>
          )}
          <hr className="my-2" />
          {user ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Signed in as <strong>{user.username}</strong></p>
              <button onClick={handleLogout} className="btn-secondary text-sm w-full">Logout</button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm block text-center">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm block text-center">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
