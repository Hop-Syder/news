import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charbon text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-jaune-soleil rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-bleu-marine">N</span>
              </div>
              <span className="text-xl font-bold">Nexus Connect</span>
            </div>
            <p className="text-gray-300 text-sm">
              La plateforme de networking pour les entrepreneurs d'Afrique de l'Ouest.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-jaune-soleil">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-jaune-soleil transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/annuaire" className="text-gray-300 hover:text-jaune-soleil transition-colors text-sm">
                  Annuaire
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-jaune-soleil transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-jaune-soleil transition-colors text-sm">
                  Créer mon profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-jaune-soleil">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-jaune-soleil flex-shrink-0" />
                <span className="text-gray-300">+229 0196701733</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-jaune-soleil flex-shrink-0" />
                <span className="text-gray-300">contact@nexusconnect.com</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-jaune-soleil flex-shrink-0" />
                <span className="text-gray-300">Cotonou, Bénin</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-jaune-soleil">Suivez-nous</h3>
            <p className="text-gray-300 text-sm mb-4">
              Restez informé des dernières opportunités
            </p>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/2290196701733"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-vert-emeraude rounded-lg flex items-center justify-center hover:bg-vert-emeraude/80 transition-colors"
              >
                <span className="text-xl">📱</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Nexus Connect - Développé avec ❤️ au Bénin par Nexus Partners
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
