import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiShield, FiSearch, FiBarChart2, FiPackage, FiUpload } from 'react-icons/fi';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { icon: <FiPackage />, title: 'Product Management', desc: 'Full CRUD operations with image upload support' },
    { icon: <FiShield />, title: 'Secure Authentication', desc: 'JWT-based auth with role-based access control' },
    { icon: <FiSearch />, title: 'Search & Filter', desc: 'Dynamic search, filtering, and sorting capabilities' },
    { icon: <FiBarChart2 />, title: 'Dashboard Analytics', desc: 'Visual statistics and inventory insights' },
    { icon: <FiUpload />, title: 'File Upload', desc: 'Image upload with validation and preview' },
    { icon: <FiArrowRight />, title: 'RESTful API', desc: 'Clean REST architecture with proper validation' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
              Welcome to <span className="text-primary-200">MarketHub</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-8">
              A modern full-stack product marketplace management platform. 
              Manage your inventory, track statistics, and collaborate with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="bg-white text-primary-700 font-semibold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors text-lg flex items-center justify-center gap-2">
                Browse Products <FiArrowRight />
              </Link>
              {!user && (
                <Link to="/register" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors text-lg">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card p-6 text-center">
              <div className="text-primary-600 text-3xl mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to manage your products?</h2>
          <p className="text-gray-600 mb-8">
            Join MarketHub today and start managing your product inventory with our powerful platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/products" className="btn-primary text-lg py-3 px-8">
              View Products
            </Link>
            {user && (
              <Link to="/dashboard" className="btn-secondary text-lg py-3 px-8">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
