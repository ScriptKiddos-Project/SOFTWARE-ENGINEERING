// import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  User, 
  Settings, 
  X,
  Trophy,
  Clock,
  Star,
  PlusCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
    },
    {
      name: 'Clubs',
      href: '/clubs',
      icon: Users,
    },
    {
      name: 'Profile',
      href: '/me',
      icon: User,
    },
  ];

  const adminNavigation: NavItem[] = [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Settings,
      roles: ['super_admin'],
    },
  ];

  const quickActions = [
    {
      name: 'Join Club',
      icon: PlusCircle,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-600',
    },
    {
      name: 'Register Event',
      icon: Calendar,
      color: 'text-green-600 bg-green-50 hover:bg-green-100',
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const canAccessRoute = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || 'student');
  };

  return (
    <>
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:hidden">
            <span className="text-lg font-semibold text-gray-900">Menu</span>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Admin Navigation */}
            {adminNavigation.some(item => canAccessRoute(item)) && (
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </h3>
                <div className="mt-2 space-y-1">
                  {adminNavigation
                    .filter(item => canAccessRoute(item))
                    .map((item) => {
                      const isActive = isActiveRoute(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={onClose}
                          className={`
                            group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                            ${isActive
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                            }
                          `}
                        >
                          <item.icon className={`
                            mr-3 h-5 w-5 flex-shrink-0
                            ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                          `} />
                          {item.name}
                        </Link>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Your Stats
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-gray-700">Points</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {user?.total_points || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-700">Hours</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {user?.total_volunteer_hours || 0}h
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="mt-2 space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.name}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${action.color}
                    `}
                  >
                    <action.icon className="mr-3 h-5 w-5" />
                    {action.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">
                  Level {Math.floor((user?.total_points || 0) / 100) + 1}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ 
                      width: `${((user?.total_points || 0) % 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;