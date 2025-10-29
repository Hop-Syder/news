// Section : Importations nécessaires
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/httpClient';

// Section : Logique métier et structure du module
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await apiClient.post('/contact', formData, { skipErrorToast: true });
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: "Comment créer mon profil sur Nexus Connect ?",
      answer: "Il suffit de cliquer sur 'Créer mon profil' dans le menu, de vous inscrire avec votre email, puis de suivre les 3 étapes simples : choisir votre type de profil, renseigner vos informations et publier votre profil."
    },
    {
      question: "La plateforme est-elle vraiment gratuite ?",
      answer: "Oui ! La création de profil et l'accès à l'annuaire sont entièrement gratuits. Nous proposons également des options premium pour plus de visibilité."
    },
    {
      question: "Dans quels pays Nexus Connect est-il disponible ?",
      answer: "Nexus Connect couvre 8 pays d'Afrique de l'Ouest : Bénin, Togo, Nigeria, Ghana, Sénégal, Côte d'Ivoire, Burkina Faso et Mali."
    },
    {
      question: "Comment mes données de contact sont-elles protégées ?",
      answer: "Nous utilisons un système anti-scraping : vos coordonnées (téléphone et email) ne sont révélées que lorsqu'un utilisateur clique explicitement sur le bouton de contact."
    },
    {
      question: "Puis-je modifier mon profil après publication ?",
      answer: "Oui, vous pouvez modifier votre profil à tout moment depuis votre tableau de bord."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-bleu-marine mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une question ? Une suggestion ? Notre équipe est là pour vous aider.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-bleu-marine">
                  Envoyez-nous un message
                </CardTitle>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-6 bg-vert-emeraude/10 border-vert-emeraude">
                    <CheckCircle2 className="h-4 w-4 text-vert-emeraude" />
                    <AlertDescription className="text-vert-emeraude">
                      Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Votre nom"
                      data-testid="contact-name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="exemple@email.com"
                      data-testid="contact-email-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Sujet de votre message"
                      data-testid="contact-subject-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Votre message..."
                      data-testid="contact-message-input"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90"
                    data-testid="contact-submit-btn"
                  >
                    {loading ? 'Envoi...' : 'Envoyer le message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info & FAQ */}
          <div className="space-y-8">
            {/* About Nexus Partners */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-bleu-marine">
                  À propos de Nexus Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Nexus Connect est développé par <strong>Nexus Partners</strong>, une initiative dédiée à la transformation digitale de l'Afrique de l'Ouest.
                </p>
                <p className="text-gray-700">
                  Notre mission : réduire la fracture numérique en offrant aux entrepreneurs, artisans et startups une présence en ligne instantanée et professionnelle.
                </p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-bleu-marine">
                  Coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-jaune-soleil mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Téléphone</p>
                    <p className="text-gray-600">+229 0196701733</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-jaune-soleil mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">contact@nexusconnect.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-jaune-soleil mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Adresse</p>
                    <p className="text-gray-600">Cotonou, Bénin</p>
                  </div>
                </div>
                <div className="pt-4">
                  <a
                    href="https://wa.me/2290196701733"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-vert-emeraude text-white rounded-lg hover:bg-vert-emeraude/90 transition-colors"
                  >
                    <span className="mr-2">📱</span>
                    Contactez-nous sur WhatsApp
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-bleu-marine">
                  Comment ça marche ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-jaune-soleil rounded-full flex items-center justify-center text-bleu-marine font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Inscrivez-vous</p>
                      <p className="text-sm text-gray-600">Créez votre compte gratuitement en quelques secondes</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-jaune-soleil rounded-full flex items-center justify-center text-bleu-marine font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Créez votre profil</p>
                      <p className="text-sm text-gray-600">Remplissez vos informations en 3 étapes simples</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-jaune-soleil rounded-full flex items-center justify-center text-bleu-marine font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Soyez visible</p>
                      <p className="text-sm text-gray-600">Votre profil est maintenant accessible à des milliers d'utilisateurs</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-bleu-marine mb-8 text-center">
            Questions Fréquentes (FAQ)
          </h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;

// ──────────────────────────────────
// Hop-Syder Développeur
// Full Stack & Data Scientist Nexus Partners
// 📧 daoudaabassichristian@gmail.com
// 📱 +229 0196701733
// 🌐 nexuspartners.xyz
// ──────────────────────────────────
