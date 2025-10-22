// Types de profils avec icônes
export const PROFILE_TYPES = [
  {
    value: "entreprise",
    label: "Entreprise",
    description: "Société établie avec structure formelle",
    icon: "🏢"
  },
  {
    value: "freelance",
    label: "Freelance",
    description: "Professionnel indépendant",
    icon: "💼"
  },
  {
    value: "pme",
    label: "PME",
    description: "Petite et Moyenne Entreprise",
    icon: "🏪"
  },
  {
    value: "artisan",
    label: "Artisan",
    description: "Métier manuel et savoir-faire",
    icon: "🔨"
  },
  {
    value: "ONG",
    label: "ONG",
    description: "Organisation non gouvernementale",
    icon: "🤝"
  },
  {
    value: "cabinet",
    label: "Cabinet",
    description: "Cabinet de conseil ou services",
    icon: "📊"
  },
  {
    value: "organisation",
    label: "Organisation",
    description: "Association ou collectif",
    icon: "🌍"
  },
  {
    value: "autre",
    label: "Autre",
    description: "Autre type d'activité",
    icon: "✨"
  }
];

export const getProfileType = (value) => {
  return PROFILE_TYPES.find(pt => pt.value === value);
};
