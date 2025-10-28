import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const visionContent = {
  badge: 'Vision Nexus • Pont numérique béninois',
  title: 'Offrir à chaque talent béninois une vitrine numérique fiable et connectée.',
  description:
    "Nexus Connect met en lumière les entrepreneurs, artisans et startups d'Afrique de l'Ouest. Notre plateforme facilite la découverte, la collaboration et l'accès à des opportunités régionales sans expertise technique préalable.",
  bullets: [
    'Présence digitale instantanée, même pour les entrepreneurs hors ligne.',
    'Référencement géolocalisé et recherche multicritères adaptés au contexte local.',
    'Passerelles IA pour décrire, recommander et mesurer chaque interaction.',
  ],
  primaryCta: {
    label: 'Découvrir les solutions Nexus',
    to: '/solutions',
  },
  secondaryCta: {
    label: 'Lancer mon espace professionnel',
    to: '/contact',
  },
  statsCard: {
    subtitle: 'Pont Nexus Connect',
    description:
      "Notre ambition : cartographier et propulser 100 000 acteurs économiques ouest-africains d'ici 2027 en reliant collectivités, entreprises, institutions et investisseurs.",
    stats: [
      {
        value: '4 500',
        label: 'Profils artisanaux et startups en cours d\'onboarding',
      },
      {
        value: '72%',
        label: 'Entrepreneurs sans présence numérique auparavant',
      },
      {
        value: '30',
        label: 'Partenariats locaux activés avec mairies et incubateurs',
      },
    ],
    testimonial: {
      quote:
        '“Nexus Connect ouvre le marché béninois à de nouvelles collaborations en valorisant nos savoir-faire.”',
      author: 'Pont Nexus Connect',
    },
  },
};

const VisionSection = () => {
  return (
    <section id="vision" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Colonne gauche */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-jaune-soleil/10 px-4 py-2 text-sm font-semibold text-jaune-soleil uppercase tracking-wide">
              {visionContent.badge}
            </div>
            <h2 className="text-3xl font-bold text-bleu-marine md:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {visionContent.title}
            </h2>
            <p className="text-lg text-gray-600 md:text-xl">
              {visionContent.description}
            </p>
            <ul className="space-y-4">
              {visionContent.bullets.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-vert-emeraude" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to={visionContent.primaryCta.to} className="w-full sm:w-auto">
                <Button className="w-full bg-bleu-marine text-white hover:bg-bleu-marine/90">
                  {visionContent.primaryCta.label}
                </Button>
              </Link>
              <Link to={visionContent.secondaryCta.to} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full border-bleu-marine text-bleu-marine hover:bg-bleu-marine/5"
                >
                  {visionContent.secondaryCta.label}
                </Button>
              </Link>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="flex">
            <div className="relative flex-1 rounded-[2rem] bg-gradient-to-br from-jaune-soleil via-vert-emeraude to-pourpre-royal p-[1px] shadow-2xl">
              <div className="h-full rounded-[calc(2rem-1px)] bg-white/95 p-8 md:p-10">
                <div className="space-y-8">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-vert-emeraude">
                      {visionContent.statsCard.subtitle}
                    </p>
                    <p className="mt-3 text-lg text-gray-700 md:text-xl">
                      {visionContent.statsCard.description}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {visionContent.statsCard.stats.map((stat, index) => (
                      <div
                        key={index}
                        className="rounded-2xl bg-gray-50/80 p-5 shadow-sm transition hover:bg-gray-100"
                      >
                        <div className="text-3xl font-bold text-bleu-marine md:text-4xl">
                          {stat.value}
                        </div>
                        <div className="mt-1 text-sm font-medium text-gray-600 md:text-base">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <blockquote className="rounded-2xl bg-bleu-marine/95 p-6 text-white shadow-lg md:p-8">
                    <p className="text-lg italic leading-relaxed md:text-xl">
                      {visionContent.statsCard.testimonial.quote}
                    </p>
                    <footer className="mt-4 text-sm font-semibold uppercase tracking-wide text-jaune-soleil">
                      {visionContent.statsCard.testimonial.author}
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
