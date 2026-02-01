import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Pill } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  onBack?: () => void;
}

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/browse', icon: Pill, label: 'Medicines' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/cart', icon: ShoppingCart, label: 'Cart' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showNav = true,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemCount } = useApp();
  const cartCount = getCartItemCount();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
      {/* Main Content */}
      <main className={cn("flex-1", showNav && "bottom-nav-padding")}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border safe-bottom z-50">
          <div className="max-w-lg mx-auto flex items-center justify-around py-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              const isCart = path === '/cart';

              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="relative">
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={cn(
                        "transition-transform duration-200",
                        isActive && "scale-110"
                      )}
                    />
                    {isCart && cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      isActive && "font-semibold"
                    )}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 w-10 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default MobileLayout;
