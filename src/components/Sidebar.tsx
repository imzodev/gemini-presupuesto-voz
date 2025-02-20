import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Tags, Settings } from 'lucide-react';

interface NavItem {
  name: string;
  icon: any;
  path: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Transactions', icon: Wallet, path: '/transactions' },
  { name: 'Categories', icon: Tags, path: '/categories' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200 shadow-sm">
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Budget Manager</h1>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-700 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent'
                  } group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-in-out border-l-4`}
                >
                  <item.icon
                    className={`${
                      location.pathname === item.path
                        ? 'text-blue-700'
                        : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150 ease-in-out`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <nav className="grid grid-cols-4 h-16">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`${
                location.pathname === item.path
                  ? 'text-blue-700'
                  : 'text-gray-500 hover:text-gray-900'
              } flex flex-col items-center justify-center space-y-1 text-xs font-medium`}
            >
              <item.icon
                className={`${
                  location.pathname === item.path
                    ? 'text-blue-700'
                    : 'text-gray-400'
                } h-5 w-5 transition-colors duration-150 ease-in-out`}
              />
              <span className="truncate max-w-[64px]">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Safe area spacing for mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
}