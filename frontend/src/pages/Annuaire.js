import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { COUNTRIES, getCountryCities } from '@/data/countries';
import { PROFILE_TYPES } from '@/data/profileTypes';
import { Search, MapPin, Star, Crown, Phone, Mail } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Annuaire = () => {
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    city: '',
    profileType: '',
    minRating: ''
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  const fetchEntrepreneurs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.location) params.append('location', filters.location);
      if (filters.city) params.append('city', filters.city);
      if (filters.profileType) params.append('profileType', filters.profileType);
      if (filters.minRating) params.append('minRating', filters.minRating);
      params.append('limit', '50');

      const response = await axios.get(`${API}/entrepreneurs?${params.toString()}`);
      setEntrepreneurs(response.data);
    } catch (error) {
      console.error('Failed to fetch entrepreneurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEntrepreneurs();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'location' ? { city: '' } : {})
    }));
  };

  const openWhatsApp = async (entrepreneurId) => {
    try {
      const response = await axios.get(`${API}/entrepreneurs/${entrepreneurId}/contact`);
      const { whatsapp } = response.data;
      // Nettoyer le numéro (enlever espaces, tirets, etc.)
      const cleanNumber = whatsapp.replace(/[^\d+]/g, '');
      // Ouvrir WhatsApp
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
    }
  };

  const openEmail = async (entrepreneurId) => {
    try {
      const response = await axios.get(`${API}/entrepreneurs/${entrepreneurId}/contact`);
      const { email } = response.data;
      // Ouvrir client email
      window.location.href = `mailto:${email}`;
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      city: '',
      profileType: '',
      minRating: ''
    });
    setSearch('');
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
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
                  value={filters.city}
                  onValueChange={(value) => handleFilterChange('city', value)}
                  disabled={!filters.location || filters.location === 'all'}
                >
                  <SelectTrigger data-testid="city-filter">
                    <SelectValue placeholder="Ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {filters.location && filters.location !== 'all' &&
                      getCountryCities(filters.location).map(city => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>

                <Select value={filters.profileType} onValueChange={(value) => handleFilterChange('profileType', value)}>
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

                <Select value={filters.minRating} onValueChange={(value) => handleFilterChange('minRating', value)}>
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
        <div className="mb-4">
          <p className="text-gray-600">
            {loading ? 'Chargement...' : `${entrepreneurs.length} profil(s) trouvé(s)`}
          </p>
        </div>

        {/* Entrepreneurs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entrepreneurs.map((entrepreneur) => (
            <Card
              key={entrepreneur.id}
              className={`hover:shadow-xl transition-shadow duration-300 relative ${
                entrepreneur.isPremium ? 'ring-2 ring-jaune-soleil' : ''
              }`}
              data-testid="entrepreneur-card"
            >
              {entrepreneur.isPremium && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-jaune-soleil text-bleu-marine">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                {/* Logo/Avatar */}
                <div className="flex justify-center mb-4">
                  {entrepreneur.logo ? (
                    <img
                      src={entrepreneur.logo}
                      alt={entrepreneur.companyName || entrepreneur.firstName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-jaune-soleil flex items-center justify-center text-3xl font-bold text-bleu-marine">
                      {(entrepreneur.companyName || entrepreneur.firstName || 'U').charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-bleu-marine mb-1">
                    {entrepreneur.companyName || `${entrepreneur.firstName} ${entrepreneur.lastName}`}
                  </h3>
                  {entrepreneur.activityName && (
                    <p className="text-sm text-gray-600 mb-2">
                      {entrepreneur.activityName}
                    </p>
                  )}
                  <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {entrepreneur.city}, {COUNTRIES[entrepreneur.location]?.name}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {entrepreneur.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {entrepreneur.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Rating */}
                {entrepreneur.rating > 0 && (
                  <div className="flex items-center justify-center mb-4">
                    <Star className="w-4 h-4 fill-jaune-soleil text-jaune-soleil mr-1" />
                    <span className="text-sm font-medium">
                      {entrepreneur.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({entrepreneur.reviewCount})
                    </span>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchContactInfo(entrepreneur.id)}
                    className="flex-1"
                    data-testid="show-phone-btn"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Numéro
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchContactInfo(entrepreneur.id)}
                    className="flex-1"
                    data-testid="show-email-btn"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {entrepreneurs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              Aucun profil trouvé. Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}
      </div>

      {/* Contact Info Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informations de contact</DialogTitle>
          </DialogHeader>
          {contactInfo && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Téléphone</label>
                <p className="text-lg font-semibold">{contactInfo.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                <p className="text-lg font-semibold">{contactInfo.whatsapp}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-lg font-semibold">{contactInfo.email}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Annuaire;