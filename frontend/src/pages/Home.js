// Section : Importations nécessaires
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { IMAGES } from '@/config/images';
import { useAuth } from '@/contexts/AuthContext';
import VisionSection from '@/components/VisionSection';
import { apiClient } from '@/lib/httpClient';

// Section : Logique métier et structure du module
const ServiceCard = ({ service, index }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Card
      ref={ref}
      className={`group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-md transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } hover:-translate-y-2 hover:shadow-2xl`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${service.accentClass} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative">
        <Badge className={`mb-4 inline-flex items-center gap-2 border ${service.badgeClass}`}>
          {service.badge}
        </Badge>
        <h3 className="text-2xl font-bold text-bleu-marine">
          {service.title}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          {service.description}
        </p>
        <ul className="mt-6 space-y-3 text-sm text-gray-700">
          {service.points.map((point) => (
            <li key={`${service.key}-${point}`} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-vert-emeraude" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

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
      const response = await apiClient.get('/contact/stats', { skipErrorToast: true });
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

  const serviceModules = useMemo(() => [
    {
      key: 'annuaire',
      badge: 'Annuaire',
      badgeClass: 'bg-bleu-marine/10 text-bleu-marine border-bleu-marine/30',
      accentClass: 'from-bleu-marine/15 via-white/0 to-transparent',
      title: 'Annuaire professionnel intelligent',
      description:
        'Référencez les entrepreneurs, artisans et startups béninois avec une recherche multicritères optimisée pour les langues locales et les réalités territoriales.',
      points: [
        'Recherche par ville, secteur et compétences',
        'Cartographie interactive',
        'Mode hors-ligne pour les agents de terrain'
      ]
    },
    {
      key: 'profils',
      badge: 'Profil',
      badgeClass: 'bg-vert-emeraude/10 text-vert-emeraude border-vert-emeraude/30',
      accentClass: 'from-vert-emeraude/15 via-white/0 to-transparent',
      title: 'Profils personnalisables',
      description:
        'Chaque acteur raconte son histoire avec des fiches produits, des photos, des tarifs et des liens de contact centralisés.',
      points: [
        'Templates métiers adaptés',
        'Validation Nexus Partners',
        'Support multilingue'
      ]
    },
    {
      key: 'pilotage',
      badge: 'Pilotage',
      badgeClass: 'bg-jaune-soleil/10 text-jaune-soleil border-jaune-soleil/30',
      accentClass: 'from-jaune-soleil/20 via-white/0 to-transparent',
      title: 'Pilotage administratif',
      description:
        'Le tableau de bord Nexus permet de valider les inscriptions, suivre les engagements et animer la communauté locale.',
      points: [
        'Workflow de validation',
        'Alertes de conformité',
        'Exports pour partenaires publics'
      ]
    },
    {
      key: 'ia',
      badge: 'IA',
      badgeClass: 'bg-pourpre-royal/10 text-pourpre-royal border-pourpre-royal/30',
      accentClass: 'from-pourpre-royal/15 via-white/0 to-transparent',
      title: 'IA copilote (bientôt)',
      description:
        'Des agents IA pour suggérer des mises en relation, générer des descriptions professionnelles et analyser les tendances régionales.',
      points: [
        'Recommandations intelligentes',
        'Analyse des secteurs porteurs',
        'Rédaction assistée'
      ]
    }
  ], []);

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

      <VisionSection />

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col gap-4">
            <Badge className="w-fit bg-bleu-marine text-white px-4 py-1 text-sm font-semibold tracking-wide">
              Suite Nexus Connect
            </Badge>
            <h2 className="text-4xl font-bold text-bleu-marine md:text-5xl">
              Des services conçus pour le terrain ouest-africain
            </h2>
            <p className="max-w-3xl text-lg text-gray-600">
              Une plateforme modulaire qui répond aux besoins des entrepreneurs, des réseaux d'accompagnement et des institutions publiques. Chaque service est pensé pour les réalités du Bénin et de l'Afrique de l'Ouest.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {serviceModules.map((service, index) => (
              <ServiceCard key={service.key} service={service} index={index} />
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

// ──────────────────────────────────
// Hop-Syder Développeur
// Full Stack & Data Scientist Nexus Partners
// 📧 daoudaabassichristian@gmail.com
// 📱 +229 0196701733
// 🌐 nexuspartners.xyz
// ──────────────────────────────────
