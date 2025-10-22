// Pays et villes d'Afrique de l'Ouest
export const COUNTRIES = {
  BJ: {
    code: "BJ",
    name: "Bénin",
    flag: "🇧🇯",
    cities: ["Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Djougou", "Bohicon"]
  },
  TG: {
    code: "TG",
    name: "Togo",
    flag: "🇹🇬",
    cities: ["Lomé", "Sokodé", "Kara", "Atakpamé", "Kpalimé", "Dapaong"]
  },
  NG: {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City"]
  },
  GH: {
    code: "GH",
    name: "Ghana",
    flag: "🇬🇭",
    cities: ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Tema"]
  },
  SN: {
    code: "SN",
    name: "Sénégal",
    flag: "🇸🇳",
    cities: ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Touba"]
  },
  CI: {
    code: "CI",
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    cities: ["Abidjan", "Yamoussoukro", "Bouaké", "Daloa", "San-Pédro", "Korhogo"]
  },
  BF: {
    code: "BF",
    name: "Burkina Faso",
    flag: "🇧🇫",
    cities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora", "Dédougou"]
  },
  ML: {
    code: "ML",
    name: "Mali",
    flag: "🇲🇱",
    cities: ["Bamako", "Sikasso", "Mopti", "Koutiala", "Kayes", "Ségou"]
  }
};

export const getCountryList = () => {
  return Object.values(COUNTRIES);
};

export const getCountryCities = (countryCode) => {
  return COUNTRIES[countryCode]?.cities || [];
};

export const getCountryName = (countryCode) => {
  return COUNTRIES[countryCode]?.name || countryCode;
};
