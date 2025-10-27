import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { ArrowRight, Users, Building2, Globe, Star } from 'lucide-react';
import { IMAGES } from '@/config/images';
import { useAuth } from '@/contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfiles: 0,
    totalViews: 0,
    totalProblems: 0
  });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/contact/stats`);
      const data = response.data || {};
      setStats({
        totalUsers: data.totalUsers ?? data.total_users ?? 0,
        totalProfiles: data.totalProfiles ?? data.total_profiles ?? 0,
        totalViews: data.totalViews ?? data.total_views ?? 0,
        totalProblems: data.totalProblems ?? data.total_problems ?? 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/ma-carte');
    } else {
      window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'register' } }));
    }
  };

  const services = [
    {
      icon: <Users className="w-12 h-12 text-jaune-soleil" />,
      title: "Annuaire Professionnel",
      description: "Recherchez et découvrez des entrepreneurs dans toute l'Afrique de l'Ouest"
    },
    {
      icon: <Building2 className="w-12 h-12 text-vert-emeraude" />,
      title: "Profils Vérifiés",
      description: "Des profils authentiques et validés pour une confiance maximale"
    },
    {
      icon: <Globe className="w-12 h-12 text-pourpre-royal" />,
      title: "Réseau Régional",
      description: "Connectez-vous avec 8 pays d'Afrique de l'Ouest"
    },
    {
      icon: <Star className="w-12 h-12 text-rose-pastel" />,
      title: "Visibilité Accrue",
      description: "Augmentez votre visibilité et développez votre activité"
    }
  ];

  const testimonials = [
    {
      name: "Amina Diallo",
      role: "Designer Freelance",
      country: "Sénégal",
      text: "Nexus Connect m'a permis de trouver des clients dans toute la région. Ma visibilité a augmenté de 300% !",
      rating: 5
    },
    {
      name: "Kofi Mensah",
      role: "Fondateur, TechStart Ghana",
      country: "Ghana",
      text: "Une plateforme indispensable pour les entrepreneurs africains. Simple, efficace et professionnelle.",
      rating: 5
    },
    {
      name: "Fatou Touré",
      role: "Artisan",
      country: "Mali",
      text: "J'ai créé mon profil en quelques minutes. Maintenant, mes produits sont visibles partout en Afrique de l'Ouest.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-bleu-marine via-pourpre-royal to-bleu-marine text-white py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 47, 108, 0.85), rgba(74, 35, 90, 0.85)), url(${IMAGES.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Connectez l'Afrique de l'Ouest
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              La plateforme de networking qui donne une présence digitale instantanée aux entrepreneurs, artisans et startups
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90 text-lg px-8 py-6"
                data-testid="get-started-btn"
                onClick={handleGetStarted}
              >
                Créer mon profil gratuitement
                <ArrowRight className="ml-2" />
              </Button>
              <Link to="/annuaire">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-bleu-marine text-lg px-8 py-6"
                >
                  Explorer l'annuaire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-jaune-soleil mb-2">
                {stats.totalUsers}+
              </div>
              <div className="text-gray-600">Utilisateurs inscrits</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-vert-emeraude mb-2">
                {stats.totalProfiles}+
              </div>
              <div className="text-gray-600">Profils publiés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pourpre-royal mb-2">
                8
              </div>
              <div className="text-gray-600">Pays couverts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-bleu-marine mb-2">
                100%
              </div>
              <div className="text-gray-600">Gratuit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-bleu-marine mb-4">
              Nos Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des outils puissants pour développer votre présence en ligne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-bleu-marine mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-bleu-marine mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez les témoignages de nos utilisateurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-jaune-soleil text-jaune-soleil" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold text-bleu-marine">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {testimonial.role}
                    </p>
                    <p className="text-sm text-gray-500">
                      {testimonial.country}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-jaune-soleil to-vert-emeraude">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-bleu-marine mb-6">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-xl text-charbon mb-8">
            Rejoignez des milliers d'entrepreneurs qui font confiance à Nexus Connect
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-bleu-marine text-white hover:bg-bleu-marine/90 text-lg px-12 py-6"
          >
            Créer mon profil maintenant
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
