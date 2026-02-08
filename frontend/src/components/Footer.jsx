import { FiShoppingBag } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <FiShoppingBag />
            MarketHub
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} MarketHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
