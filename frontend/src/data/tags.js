// Section : Importations nécessaires
// Tags/Compétences prédéfinis pour Nexus Connect

// Section : Logique métier et structure du module
export const AVAILABLE_TAGS = [
  // Tech & Digital
  { value: "Développement Web", category: "tech", icon: "💻" },
  { value: "Développement Mobile", category: "tech", icon: "📱" },
  { value: "Design UI/UX", category: "tech", icon: "🎨" },
  { value: "Data Science", category: "tech", icon: "📊" },
  { value: "Cybersécurité", category: "tech", icon: "🔒" },
  { value: "DevOps", category: "tech", icon: "⚙️" },
  { value: "IA & Machine Learning", category: "tech", icon: "🤖" },
  { value: "Blockchain", category: "tech", icon: "⛓️" },
  
  // Marketing & Communication
  { value: "Marketing Digital", category: "marketing", icon: "📈" },
  { value: "SEO", category: "marketing", icon: "🔍" },
  { value: "Social Media", category: "marketing", icon: "📱" },
  { value: "Content Marketing", category: "marketing", icon: "✍️" },
  { value: "Community Management", category: "marketing", icon: "👥" },
  { value: "Publicité", category: "marketing", icon: "📢" },
  { value: "Relations Publiques", category: "marketing", icon: "🎙️" },
  { value: "Communication", category: "marketing", icon: "💬" },
  
  // Design & Créatif
  { value: "Design Graphique", category: "design", icon: "🎨" },
  { value: "Branding", category: "design", icon: "🎯" },
  { value: "Illustration", category: "design", icon: "✏️" },
  { value: "Photographie", category: "design", icon: "📷" },
  { value: "Vidéo", category: "design", icon: "🎥" },
  { value: "Animation", category: "design", icon: "🎬" },
  { value: "Print Design", category: "design", icon: "🖨️" },
  
  // Business & Finance
  { value: "Comptabilité", category: "business", icon: "💰" },
  { value: "Finance", category: "business", icon: "💵" },
  { value: "Audit", category: "business", icon: "📋" },
  { value: "Conseil Business", category: "business", icon: "💼" },
  { value: "Gestion de Projet", category: "business", icon: "📊" },
  { value: "Business Plan", category: "business", icon: "📝" },
  { value: "Levée de Fonds", category: "business", icon: "💸" },
  { value: "Import-Export", category: "business", icon: "🚢" },
  
  // Juridique
  { value: "Droit des Affaires", category: "legal", icon: "⚖️" },
  { value: "Droit Fiscal", category: "legal", icon: "📊" },
  { value: "Propriété Intellectuelle", category: "legal", icon: "©️" },
  { value: "Conseil Juridique", category: "legal", icon: "👨‍⚖️" },
  { value: "Contrats", category: "legal", icon: "📄" },
  
  // RH & Formation
  { value: "Recrutement", category: "hr", icon: "🤝" },
  { value: "Formation", category: "hr", icon: "📚" },
  { value: "Coaching", category: "hr", icon: "🎯" },
  { value: "Gestion RH", category: "hr", icon: "👥" },
  { value: "Mentorat", category: "hr", icon: "🧑‍🏫" },
  
  // Agriculture & Environnement
  { value: "Agriculture", category: "agriculture", icon: "🌾" },
  { value: "Agroalimentaire", category: "agriculture", icon: "🥗" },
  { value: "Élevage", category: "agriculture", icon: "🐄" },
  { value: "Environnement", category: "environment", icon: "🌍" },
  { value: "Énergie Renouvelable", category: "environment", icon: "☀️" },
  { value: "Développement Durable", category: "environment", icon: "♻️" },
  
  // Commerce & Vente
  { value: "Commerce", category: "commerce", icon: "🛍️" },
  { value: "E-commerce", category: "commerce", icon: "🛒" },
  { value: "Vente", category: "commerce", icon: "💳" },
  { value: "Distribution", category: "commerce", icon: "📦" },
  { value: "Retail", category: "commerce", icon: "🏪" },
  
  // Construction & Immobilier
  { value: "Construction", category: "construction", icon: "🏗️" },
  { value: "Architecture", category: "construction", icon: "🏛️" },
  { value: "BTP", category: "construction", icon: "👷" },
  { value: "Immobilier", category: "real-estate", icon: "🏠" },
  { value: "Rénovation", category: "construction", icon: "🔨" },
  
  // Artisanat & Production
  { value: "Artisanat", category: "crafts", icon: "🔨" },
  { value: "Textile", category: "crafts", icon: "🧵" },
  { value: "Couture", category: "crafts", icon: "👗" },
  { value: "Maroquinerie", category: "crafts", icon: "👜" },
  { value: "Menuiserie", category: "crafts", icon: "🪚" },
  { value: "Bijouterie", category: "crafts", icon: "💎" },
  { value: "Poterie", category: "crafts", icon: "🏺" },
  
  // Beauté & Bien-être
  { value: "Cosmétiques", category: "beauty", icon: "💄" },
  { value: "Coiffure", category: "beauty", icon: "💇" },
  { value: "Esthétique", category: "beauty", icon: "✨" },
  { value: "Bien-être", category: "wellness", icon: "🧘" },
  { value: "Santé", category: "health", icon: "🏥" },
  
  // Transport & Logistique
  { value: "Transport", category: "logistics", icon: "🚚" },
  { value: "Logistique", category: "logistics", icon: "📦" },
  { value: "Livraison", category: "logistics", icon: "🚴" },
  { value: "Supply Chain", category: "logistics", icon: "⛓️" },
  
  // Tourisme & Hôtellerie
  { value: "Tourisme", category: "tourism", icon: "✈️" },
  { value: "Hôtellerie", category: "tourism", icon: "🏨" },
  { value: "Restauration", category: "food", icon: "🍽️" },
  { value: "Événementiel", category: "events", icon: "🎉" },
  { value: "Traiteur", category: "food", icon: "🍱" },
  
  // Services Généraux
  { value: "Traduction", category: "services", icon: "🌐" },
  { value: "Rédaction", category: "services", icon: "✍️" },
  { value: "Secrétariat", category: "services", icon: "📋" },
  { value: "Assistance Virtuelle", category: "services", icon: "💻" },
  { value: "Nettoyage", category: "services", icon: "🧹" },
  { value: "Sécurité", category: "services", icon: "🛡️" },
  
  // Autres
  { value: "Consulting", category: "other", icon: "💡" },
  { value: "Innovation", category: "other", icon: "🚀" },
  { value: "Entrepreneuriat", category: "other", icon: "💼" },
  { value: "Startup", category: "other", icon: "🌟" },
  { value: "PME", category: "other", icon: "🏢" },
];

// Grouper les tags par catégorie
export const TAGS_BY_CATEGORY = {
  tech: AVAILABLE_TAGS.filter(t => t.category === "tech"),
  marketing: AVAILABLE_TAGS.filter(t => t.category === "marketing"),
  design: AVAILABLE_TAGS.filter(t => t.category === "design"),
  business: AVAILABLE_TAGS.filter(t => t.category === "business"),
  legal: AVAILABLE_TAGS.filter(t => t.category === "legal"),
  hr: AVAILABLE_TAGS.filter(t => t.category === "hr"),
  agriculture: AVAILABLE_TAGS.filter(t => t.category === "agriculture"),
  environment: AVAILABLE_TAGS.filter(t => t.category === "environment"),
  commerce: AVAILABLE_TAGS.filter(t => t.category === "commerce"),
  construction: AVAILABLE_TAGS.filter(t => t.category === "construction"),
  "real-estate": AVAILABLE_TAGS.filter(t => t.category === "real-estate"),
  crafts: AVAILABLE_TAGS.filter(t => t.category === "crafts"),
  beauty: AVAILABLE_TAGS.filter(t => t.category === "beauty"),
  wellness: AVAILABLE_TAGS.filter(t => t.category === "wellness"),
  health: AVAILABLE_TAGS.filter(t => t.category === "health"),
  logistics: AVAILABLE_TAGS.filter(t => t.category === "logistics"),
  tourism: AVAILABLE_TAGS.filter(t => t.category === "tourism"),
  food: AVAILABLE_TAGS.filter(t => t.category === "food"),
  events: AVAILABLE_TAGS.filter(t => t.category === "events"),
  services: AVAILABLE_TAGS.filter(t => t.category === "services"),
  other: AVAILABLE_TAGS.filter(t => t.category === "other"),
};

// Noms des catégories en français
export const CATEGORY_NAMES = {
  tech: "Tech & Digital",
  marketing: "Marketing & Com",
  design: "Design & Créatif",
  business: "Business & Finance",
  legal: "Juridique",
  hr: "RH & Formation",
  agriculture: "Agriculture",
  environment: "Environnement",
  commerce: "Commerce & Vente",
  construction: "Construction",
  "real-estate": "Immobilier",
  crafts: "Artisanat",
  beauty: "Beauté",
  wellness: "Bien-être",
  health: "Santé",
  logistics: "Transport & Logistique",
  tourism: "Tourisme",
  food: "Restauration",
  events: "Événementiel",
  services: "Services",
  other: "Autres"
};

// Fonction helper pour rechercher des tags
export const searchTags = (query) => {
  const lowerQuery = query.toLowerCase();
  return AVAILABLE_TAGS.filter(tag => 
    tag.value.toLowerCase().includes(lowerQuery)
  );
};

// ──────────────────────────────────
// Hop-Syder Développeur
// Full Stack & Data Scientist Nexus Partners
// 📧 daoudaabassichristian@gmail.com
// 📱 +229 0196701733
// 🌐 nexuspartners.xyz
// ──────────────────────────────────
