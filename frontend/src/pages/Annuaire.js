// Section : Importations nécessaires
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { COUNTRIES, getCountryCities } from '@/data/countries';
import { PROFILE_TYPES } from '@/data/profileTypes';
import { Search, MapPin, Star, Crown, Phone, Mail } from 'lucide-react';

// Section : Logique métier et structure du module
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const PAGE_SIZE = 9;
const CACHE_TTL = 5 * 60 * 1000;

const Annuaire = () => {
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    city: '',
    profileType: '',
    minRating: ''
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const cacheRef = useRef(new Map());
  const contactCacheRef = useRef(new Map());

  const tagColorClasses = [
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-indigo-100 text-indigo-700'
  ];

  const fetchEntrepreneurs = useCallback(async () => {
    const normalizedFilters = {
      country_code: filters.location || '',
      city: filters.city || '',
      profile_type: filters.profileType || '',
      min_rating: filters.minRating || ''
    };

    const cacheKey = JSON.stringify({ search: searchTerm, filters: normalizedFilters, page });
    const now = Date.now();
    const cachedEntry = cacheRef.current.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      setEntrepreneurs(cachedEntry.data);
      setHasMore(cachedEntry.hasMore);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (normalizedFilters.country_code) params.append('country_code', normalizedFilters.country_code);
      if (normalizedFilters.city) params.append('city', normalizedFilters.city);
      if (normalizedFilters.profile_type) params.append('profile_type', normalizedFilters.profile_type);
      if (normalizedFilters.min_rating) params.append('min_rating', normalizedFilters.min_rating);
      params.append('limit', PAGE_SIZE.toString());
      params.append('offset', ((page - 1) * PAGE_SIZE).toString());

      const response = await axios.get(`${API}/entrepreneurs?${params.toString()}`);
      const data = Array.isArray(response.data) ? response.data : [];
      const more = data.length === PAGE_SIZE;
      setEntrepreneurs(data);
      setHasMore(more);
      cacheRef.current.set(cacheKey, { data, hasMore: more, timestamp: now });
    } catch (error) {
      console.error('Failed to fetch entrepreneurs:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filters, page, searchTerm]);

  useEffect(() => {
    fetchEntrepreneurs();
  }, [fetchEntrepreneurs]);

  const handleSearch = () => {
    const normalized = searchInput.trim();
    cacheRef.current.clear();
    setEntrepreneurs([]);
    setHasMore(false);
    if (searchTerm !== normalized) {
      setSearchTerm(normalized);
    } else if (page === 1) {
      fetchEntrepreneurs();
    }
    if (page !== 1) {
      setPage(1);
    }
  };

  const handleFilterChange = (key, value) => {
    const normalizedValue = value === 'all' ? '' : value;
    setFilters((prev) => {
      const next = {
        ...prev,
        [key]: normalizedValue,
      };
      if (key === 'location') {
        next.city = '';
      }
      return next;
    });
    cacheRef.current.clear();
    setPage(1);
    setEntrepreneurs([]);
    setHasMore(false);
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  };

  const goToNextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const fetchContactInfo = useCallback(async (entrepreneurId) => {
    if (contactCacheRef.current.has(entrepreneurId)) {
      return contactCacheRef.current.get(entrepreneurId);
    }

    const response = await axios.get(`${API}/entrepreneurs/${entrepreneurId}/contact`);
    contactCacheRef.current.set(entrepreneurId, response.data);
    return response.data;
  }, []);

  const openWhatsApp = useCallback(async (entrepreneurId) => {
    try {
      const info = await fetchContactInfo(entrepreneurId);
      if (!info?.whatsapp) {
        return;
      }
      const cleanNumber = info.whatsapp.replace(/[^\d+]/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
    }
  }, [fetchContactInfo]);

  const openEmail = useCallback(async (entrepreneurId) => {
    try {
      const info = await fetchContactInfo(entrepreneurId);
      if (!info?.email) {
        return;
      }
      window.location.href = `mailto:${info.email}`;
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
    }
  }, [fetchContactInfo]);

  const clearFilters = () => {
    setFilters({
      location: '',
      city: '',
      profileType: '',
      minRating: ''
    });
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
    cacheRef.current.clear();
    contactCacheRef.current.clear();
    setHasMore(false);
    setEntrepreneurs([]);
  };

  const openProfile = (entrepreneurId) => {
    window.open(`/annuaire?profile=${entrepreneurId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-bleu-marine mb-4" data-testid="annuaire-title">
            Annuaire des Entrepreneurs
          </h1>
          <p className="text-xl text-gray-600">
            Découvrez des professionnels talentueux à travers l'Afrique de l'Ouest
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4">
                <Input
                  placeholder="Rechercher par nom, entreprise, compétences..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="flex-1"
                  data-testid="search-input"
                />
                <Button
                  onClick={handleSearch}
                  className="bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90"
                  data-testid="search-button"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={filters.location || 'all'} onValueChange={(value) => handleFilterChange('location', value)}>
                  <SelectTrigger data-testid="country-filter">
                    <SelectValue placeholder="Pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les pays</SelectItem>
                    {Object.values(COUNTRIES).map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.city || 'all'}
                  onValueChange={(value) => handleFilterChange('city', value)}
                  disabled={!filters.location}
                >
                  <SelectTrigger data-testid="city-filter">
                    <SelectValue placeholder="Ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {filters.location &&
                      getCountryCities(filters.location).map(city => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>

                <Select value={filters.profileType || 'all'} onValueChange={(value) => handleFilterChange('profileType', value)}>
                  <SelectTrigger data-testid="profile-type-filter">
                    <SelectValue placeholder="Type de profil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {PROFILE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.minRating || 'all'} onValueChange={(value) => handleFilterChange('minRating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Note minimale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les notes</SelectItem>
                    <SelectItem value="4">4+ étoiles</SelectItem>
                    <SelectItem value="3">3+ étoiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-gray-600">
            {loading ? 'Chargement...' : `Page ${page} • ${entrepreneurs.length} profil(s) affiché(s)`}
          </p>
          {!loading && (
            <span className="text-sm text-gray-500">
              Résultats mis en cache pendant 5 minutes pour des chargements rapides
            </span>
          )}
        </div>

        {/* Entrepreneurs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entrepreneurs.map((entrepreneur) => {
            const fullName = `${entrepreneur.first_name || ''} ${entrepreneur.last_name || ''}`.trim();
            const isPremium = Boolean(entrepreneur.is_premium);

            return (
              <Card
                key={entrepreneur.id}
                className={`relative overflow-hidden rounded-3xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl border-2 ${isPremium
                  ? 'bg-gradient-to-br from-amber-50 via-white to-amber-100 border-[#FAD02E] shadow-[0_10px_40px_rgba(250,208,46,0.25)]'
                  : 'bg-white border-gray-200 hover:border-bleu-marine/20'
                  }`}
                data-testid="entrepreneur-card"
              >
                {isPremium && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-amber-400 to-amber-300 text-bleu-marine font-semibold tracking-wide">
                      <Crown className="w-3 h-3 mr-1" />
                      PREMIUM
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 lg:p-8">
                  <div className="flex justify-center mb-5">
                    {entrepreneur.logo_url ? (
                      <div className={`p-1 rounded-full ${isPremium ? 'bg-gradient-to-br from-amber-300 to-amber-500' : 'bg-gray-200'}`}>
                        <img
                          src={entrepreneur.logo_url}
                          alt={entrepreneur.company_name || fullName || 'Logo'}
                          loading="lazy"
                          decoding="async"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-jaune-soleil flex items-center justify-center text-4xl font-bold text-bleu-marine shadow-inner">
                        {(entrepreneur.company_name || entrepreneur.first_name || 'U').charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-5 space-y-2">
                    <h3 className="text-2xl font-extrabold text-bleu-marine">
                      {entrepreneur.company_name || 'Carte entrepreneur'}
                    </h3>
                    <h4 className="text-sm text-gray-500">{fullName}</h4>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {entrepreneur.city}, {COUNTRIES[entrepreneur.country_code]?.name || entrepreneur.country_code}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {entrepreneur.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {(entrepreneur.tags || []).slice(0, 5).map((tag, index) => (
                      <span
                        key={`${entrepreneur.id}-tag-${tag}-${index}`}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${tagColorClasses[index % tagColorClasses.length]}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {entrepreneur.rating > 0 && (
                    <div className="flex items-center justify-center gap-2 text-bleu-marine mb-5">
                      <Star className="w-4 h-4 fill-jaune-soleil text-jaune-soleil" />
                      <span className="text-sm font-medium">
                        {entrepreneur.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({entrepreneur.review_count || 0} avis)
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openWhatsApp(entrepreneur.id)}
                      className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500 text-emerald-700"
                      data-testid="whatsapp-btn"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEmail(entrepreneur.id)}
                      className="flex-1 border border-bleu-marine text-bleu-marine hover:bg-bleu-marine/10"
                      data-testid="email-btn"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-gray-500 hover:text-bleu-marine"
                      onClick={() => openProfile(entrepreneur.id)}
                    >
                      Voir profil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {(entrepreneurs.length > 0 || page > 1) && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Page {page}{!hasMore && entrepreneurs.length < PAGE_SIZE ? ' • Dernière page' : ''}
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={goToPreviousPage}
                disabled={page === 1 || loading}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                onClick={goToNextPage}
                disabled={!hasMore || loading}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}

        {entrepreneurs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              Aucun profil trouvé. Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Annuaire;

// ──────────────────────────────────
// Hop-Syder Développeur
// Full Stack & Data Scientist Nexus Partners
// 📧 daoudaabassichristian@gmail.com
// 📱 +229 0196701733
// 🌐 nexuspartners.xyz
// ──────────────────────────────────
