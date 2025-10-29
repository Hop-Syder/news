// Section : Importations nécessaires
import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Section : Logique métier et structure du module
const reasonMessages = {
  idle_timeout: {
    title: 'Session expirée pour votre sécurité',
    description:
      'Vous avez été déconnecté après 5 minutes d’inactivité. Merci de vous reconnecter pour continuer.',
  },
  expired: {
    title: 'Session expirée',
    description:
      'Votre session n’est plus valide. Veuillez vous reconnecter pour poursuivre.',
  },
  session_expired: {
    title: 'Session expirée',
    description:
      'Votre session a expiré. Merci de vous reconnecter pour continuer sur Nexus Connect.',
  },
  manual: {
    title: 'Vous êtes déconnecté',
    description:
      'Vous avez quitté votre session en toute sécurité. Connectez-vous pour reprendre votre navigation.',
  },
};

const Connexion = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const reason = searchParams.get('reason');

  const message = reasonMessages[reason] ?? {
    title: 'Connexion à Nexus Connect',
    description: 'Veuillez vous connecter pour accéder à votre espace sécurisé.',
  };

  useEffect(() => {
    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('open-auth-modal', {
          detail: { mode: 'login' },
        })
      );
    } else {
      navigate('/ma-carte', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-[60vh]">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6 text-center">
          <Alert variant="destructive" className="justify-start text-left">
            <AlertTitle className="text-lg font-semibold text-charbon">
              {message.title}
            </AlertTitle>
            <AlertDescription className="text-gray-700">
              {message.description}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {!isAuthenticated && (
              <Button
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('open-auth-modal', { detail: { mode: 'login' } })
                  )
                }
                className="w-full bg-bleu-marine hover:bg-bleu-marine/90"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Se connecter
              </Button>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center text-bleu-marine font-medium hover:underline"
            >
              Revenir à l’accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion;

// ──────────────────────────────────
// Hop-Syder Développeur
// Full Stack & Data Scientist Nexus Partners
// 📧 daoudaabassichristian@gmail.com
// 📱 +229 0196701733
// 🌐 nexuspartners.xyz
// ──────────────────────────────────
