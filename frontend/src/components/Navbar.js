import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import AuthModal from './AuthModal';
import { Menu, X, User, LogOut, ChevronDown, CreditCard, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      const mode = event.detail?.mode || 'login';
      setAuthMode(mode);
      setShowAuthModal(true);
    };

    window.addEventListener('open-auth-modal', handleOpenAuthModal);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuthModal);
  }, []);

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const getUserDisplayName = () => {
    if (user?.first_name) {
      const lastInitial = user?.last_name ? `${user.last_name[0].toUpperCase()}.` : '';
      return `${user.first_name} ${lastInitial}`.trim();
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Mon compte';
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-jaune-soleil rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-bleu-marine">N</span>
                </div>
                <span className="text-xl font-bold text-bleu-marine">Nexus Connect</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-charbon hover:text-jaune-soleil transition-colors font-medium">
                Accueil
              </Link>
              <Link to="/annuaire" className="text-charbon hover:text-jaune-soleil transition-colors font-medium">
                Annuaire
              </Link>
              {!isAuthenticated && (
                <Link to="/contact" className="text-charbon hover:text-jaune-soleil transition-colors font-medium">
                  Contact
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <Link to="/ma-carte" className="text-charbon hover:text-jaune-soleil transition-colors font-medium">
                    Ma Carte
                  </Link>
                  <Link to="/mon-profil" className="text-charbon hover:text-jaune-soleil transition-colors font-medium">
                    Mon Profil
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 hover:bg-jaune-soleil/10">
                        <User className="w-4 h-4" />
                        <span>{getUserDisplayName()}</span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2 text-xs text-gray-500">
                        Connecté en tant que
                        <br />
                        <span className="font-medium text-charbon">{user?.email}</span>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/ma-carte" className="cursor-pointer">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Ma Carte
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/mon-profil" className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Mon Profil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleLoginClick}
                  className="border-bleu-marine text-bleu-marine hover:bg-bleu-marine hover:text-white"
                >
                  Se connecter
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-charbon hover:text-jaune-soleil"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-charbon hover:bg-jaune-soleil/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/annuaire"
                className="block px-3 py-2 rounded-md text-charbon hover:bg-jaune-soleil/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Annuaire
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/contact"
                  className="block px-3 py-2 rounded-md text-charbon hover:bg-jaune-soleil/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/ma-carte"
                    className="block px-3 py-2 rounded-md text-charbon hover:bg-jaune-soleil/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ma Carte
                  </Link>
                  <Link
                    to="/mon-profil"
                    className="block px-3 py-2 rounded-md text-charbon hover:bg-jaune-soleil/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mon Profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-charbon hover:bg-jaune-soleil/10"
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </>
  );
};

export default Navbar;
