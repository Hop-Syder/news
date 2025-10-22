import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import AuthModal from './AuthModal';
import { Menu, X, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
              <Link to="/contact" className="text-charbon hover:text-jaune-soleil transition-colors font-medium">
                Contact
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button className="bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90">
                      <User className="w-4 h-4 mr-2" />
                      Mon Profil
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-charbon hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleAuthClick('login')}
                    className="border-bleu-marine text-bleu-marine hover:bg-bleu-marine hover:text-white"
                  >
                    Connexion
                  </Button>
                  <Button
                    onClick={() => handleAuthClick('register')}
                    className="bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90"
                  >
                    Créer mon profil
                  </Button>
                </>
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
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-charbon hover:bg-jaune-soleil/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
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
                <>
                  <button
                    onClick={() => {
                      handleAuthClick('login');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-charbon hover:bg-jaune-soleil/10"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => {
                      handleAuthClick('register');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md bg-jaune-soleil text-bleu-marine font-medium"
                  >
                    Créer mon profil
                  </button>
                </>
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
