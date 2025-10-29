// Section : Importations nécessaires
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Section : Logique métier et structure du module
const EmailConfirmation = () => {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-bleu-marine via-pourpre-royal to-bleu-marine flex items-center justify-center px-4">
      <Card className="max-w-lg w-full shadow-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-5xl">📨</div>
          <h1 className="text-3xl font-bold text-bleu-marine">
            Confirmez votre adresse email
          </h1>
          <p className="text-gray-600">
            Nous vous avons envoyé un lien de confirmation{email ? ` à l'adresse ${email}` : ''}.<br />
            Cliquez sur ce lien pour activer votre compte et finaliser la création de votre profil.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Vérifiez votre dossier spam si vous ne voyez pas l'email dans votre boîte de réception.</p>
            <p>• Le lien expire après quelques minutes, n'attendez pas trop !</p>
          </div>
          <Link to="/">
            <Button className="bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90">
              Retour à l'accueil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;

// ──────────────────────────────────
// Hop-Syder Développeur
// Full Stack & Data Scientist Nexus Partners
// 📧 daoudaabassichristian@gmail.com
// 📱 +229 0196701733
// 🌐 nexuspartners.xyz
// ──────────────────────────────────
