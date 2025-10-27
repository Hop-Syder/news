import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { COUNTRIES, getCountryCities } from '@/data/countries';
import { PROFILE_TYPES } from '@/data/profileTypes';
import { AVAILABLE_TAGS, CATEGORY_NAMES, TAGS_BY_CATEGORY } from '@/data/tags';
import { ChevronLeft, ChevronRight, CheckCircle2, Upload, X, Search, EyeOff } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, session, loading: authLoading, getAccessToken } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    profileType: '',
    firstName: '',
    lastName: '',
    companyName: '',
    activityName: '',
    logo: '',
    description: '',
    tags: [],
    phone: '',
    whatsapp: '',
    email: user?.email || '',
    location: '',
    city: '',
    website: '',
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusVariant, setStatusVariant] = useState('success');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [draftApplied, setDraftApplied] = useState(false);

  const buildPayload = () => ({
    profile_type: formData.profileType,
    first_name: formData.firstName,
    last_name: formData.lastName,
    company_name: formData.companyName || null,
    activity_name: formData.activityName || null,
    description: formData.description,
    tags: formData.tags,
    phone: formData.phone,
    whatsapp: formData.whatsapp,
    email: formData.email,
    country_code: formData.location ? formData.location.toUpperCase() : '',
    city: formData.city,
    website: formData.website || null,
    logo_url: formData.logo || null,
    portfolio: []
  });

  const formatLastSavedLabel = (value) => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch (error) {
      return '';
    }
  };

  const getStatusAlertClasses = () => {
    if (statusVariant === 'info') {
      return 'mb-6 bg-blue-100 border-blue-300 text-blue-800';
    }
    if (statusVariant === 'warning') {
      return 'mb-6 bg-yellow-100 border-yellow-300 text-yellow-800';
    }
    return 'mb-6 bg-green-100 border-green-300 text-green-800';
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
    if (user) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const loadDraft = async () => {
      if (authLoading || !user || !session?.access_token) {
        return;
      }

      try {
        const { data } = await axios.get(`${API}/entrepreneurs/draft`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (data?.form_data && Object.keys(data.form_data).length > 0) {
          const draftData = data.form_data;
          setFormData(prev => {
            const next = {
              ...prev,
              ...draftData,
              email: draftData.email || prev.email || user.email || ''
            };

            if (draftData.location) {
              next.location = draftData.location;
              next.city = draftData.city || '';
            }

            if (!draftData.tags) {
              next.tags = prev.tags;
            }

            return next;
          });

          setLogoPreview(draftData.logo || '');
          setDraftApplied(true);
        }

        if (data?.current_step) {
          const nextStep = Math.min(Math.max(data.current_step, 1), 4);
          setCurrentStep(nextStep);
        }

        if (data?.updated_at) {
          setLastSavedAt(data.updated_at);
        }
      } catch (error) {
        console.error('Failed to load entrepreneur draft:', error);
      }
    };

    loadDraft();
  }, [authLoading, user, session]);

  useEffect(() => {
    const loadPublishedProfile = async () => {
      if (authLoading || !user || !session?.access_token) {
        return;
      }

      try {
        const { data } = await axios.get(`${API}/entrepreneurs/me`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (data) {
          setProfileId(data.id);
          setIsPublished(Boolean(data.is_active));

          if (!draftApplied) {
            setFormData(prev => ({
              ...prev,
              profileType: data.profile_type || '',
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              companyName: data.company_name || '',
              activityName: data.activity_name || '',
              description: data.description || '',
              tags: Array.isArray(data.tags) ? data.tags : [],
              phone: data.phone || '',
              whatsapp: data.whatsapp || '',
              email: data.email || prev.email || user.email || '',
              location: data.country_code || '',
              city: data.city || '',
              website: data.website || '',
              logo: data.logo_url || ''
            }));

            setLogoPreview(data.logo_url || '');
          }

          if (data.updated_at) {
            setLastSavedAt(data.updated_at);
          }

          if (data.is_active === false && !statusMessage) {
            setStatusVariant('warning');
            setStatusMessage('Ce profil est hors ligne. Publiez-le pour le rendre visible dans l\'annuaire.');
          }
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Failed to load published profile:', error);
        }
      }
    };

    loadPublishedProfile();
  }, [authLoading, user, session, draftApplied]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'location' ? { city: '' } : {})
    }));
    setError('');
    setStatusMessage('');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 2MB)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
    setStatusMessage('');
  };

  const removeLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo: '' }));
    setStatusMessage('');
  };

  const addTag = (tagValue) => {
    if (formData.tags.length < 5 && !formData.tags.includes(tagValue)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagValue]
      }));
      setStatusMessage('');
    }
  };

  const removeTag = (tagValue) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagValue)
    }));
    setStatusMessage('');
  };

  const handleSaveDraft = async () => {
    setError('');
    setStatusMessage('');

    const accessToken = getAccessToken();
    if (!accessToken) {
      setError('Votre session a expiré. Veuillez vous reconnecter.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        form_data: formData,
        current_step: currentStep
      };

      const { data } = await axios.put(`${API}/entrepreneurs/draft`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      setStatusVariant('success');
      setStatusMessage('Brouillon enregistré avec succès.');
      if (data?.updated_at) {
        setLastSavedAt(data.updated_at);
      } else {
        setLastSavedAt(new Date().toISOString());
      }
      setDraftApplied(true);
    } catch (error) {
      console.error('Save draft error:', error);
      setError(error.response?.data?.detail || 'Impossible de sauvegarder le brouillon');
    } finally {
      setSaving(false);
    }
  };

  const filteredTags = () => {
    let tags = AVAILABLE_TAGS;
    
    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      tags = TAGS_BY_CATEGORY[selectedCategory] || [];
    }
    
    // Filtrer par recherche
    if (tagSearchQuery) {
      tags = tags.filter(tag => 
        tag.value.toLowerCase().includes(tagSearchQuery.toLowerCase())
      );
    }
    
    return tags;
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.profileType) {
        setError('Veuillez sélectionner un type de profil');
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.firstName || !formData.lastName) {
        setError('Veuillez renseigner votre nom et prénom');
        return false;
      }
      if (!formData.description || formData.description.length > 200) {
        setError('La description est requise (max 200 caractères)');
        return false;
      }
      if (!formData.location || !formData.city) {
        setError('Veuillez sélectionner un pays et une ville');
        return false;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.phone || !formData.whatsapp || !formData.email) {
        setError('Tous les champs de contact sont requis');
        return false;
      }
      if (formData.tags.length === 0) {
        setError('Ajoutez au moins une compétence');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError('');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handlePublish = async () => {
    if (!validateStep()) return;

    setError('');
    setStatusMessage('');

    const accessToken = getAccessToken();
    if (!accessToken) {
      setError('Votre session a expiré. Veuillez vous reconnecter.');
      return;
    }

    setProcessing(true);

    try {
      const payload = {
        ...buildPayload(),
        is_active: true
      };

      let response;
      if (profileId) {
        response = await axios.put(`${API}/entrepreneurs/${profileId}`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      } else {
        response = await axios.post(`${API}/entrepreneurs`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      }

      const data = response?.data;
      if (data?.id) {
        setProfileId(data.id);
      }

      setIsPublished(true);
      setStatusVariant('success');
      setStatusMessage('Profil publié avec succès. Votre carte est visible dans l\'annuaire.');
      setLastSavedAt(data?.updated_at || new Date().toISOString());

      try {
        await axios.delete(`${API}/entrepreneurs/draft`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setDraftApplied(false);
      } catch (draftError) {
        console.warn('Unable to clear draft after publish:', draftError);
      }
    } catch (error) {
      console.error('Publish error:', error);
      setError(error.response?.data?.detail || 'Une erreur est survenue lors de la publication');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!profileId) {
      setError('Aucun profil publié à dépublier pour le moment.');
      return;
    }

    setError('');
    setStatusMessage('');

    const accessToken = getAccessToken();
    if (!accessToken) {
      setError('Votre session a expiré. Veuillez vous reconnecter.');
      return;
    }

    setProcessing(true);

    try {
      const { data } = await axios.put(`${API}/entrepreneurs/${profileId}`, { is_active: false }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      setIsPublished(false);
      setStatusVariant('warning');
      setStatusMessage('Profil dépublié. Votre carte est maintenant masquée dans l\'annuaire.');
      setLastSavedAt(data?.updated_at || new Date().toISOString());
    } catch (error) {
      console.error('Unpublish error:', error);
      setError(error.response?.data?.detail || 'Impossible de dépublier le profil');
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-bleu-marine mb-4" data-testid="dashboard-title">
            Créer votre profil
          </h1>
          <p className="text-xl text-gray-600">
            Complétez votre profil en 3 étapes simples
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-bleu-marine">
              Étape {currentStep} sur 4
            </span>
            <span className="text-sm font-medium text-bleu-marine">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardContent className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {statusMessage && (
              <Alert variant="default" className={getStatusAlertClasses()}>
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Profile Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-bleu-marine text-center mb-6">
                  Quel type de profil souhaitez-vous créer ?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {PROFILE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleChange('profileType', type.value)}
                      className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                        formData.profileType === type.value
                          ? 'border-jaune-soleil bg-jaune-soleil/10'
                          : 'border-gray-200 hover:border-jaune-soleil/50'
                      }`}
                      data-testid={`profile-type-${type.value}`}
                    >
                      <div className="text-4xl mb-3">{type.icon}</div>
                      <div className="font-semibold text-bleu-marine mb-1">
                        {type.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: General Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-bleu-marine text-center mb-6">
                  Informations générales
                </h2>

                {/* Logo Upload */}
                <div>
                  <Label>Logo / Photo de profil</Label>
                  <div className="mt-2">
                    {logoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
                        />
                        <button
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-jaune-soleil">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-2">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom *</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="Jean"
                      data-testid="first-name-input"
                    />
                  </div>
                  <div>
                    <Label>Nom *</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder="Dupont"
                      data-testid="last-name-input"
                    />
                  </div>
                </div>

                <div>
                  <Label>Nom de l'entreprise</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Mon Entreprise SARL"
                  />
                </div>

                <div>
                  <Label>Nom d'activité</Label>
                  <Input
                    value={formData.activityName}
                    onChange={(e) => handleChange('activityName', e.target.value)}
                    placeholder="Développeur Web, Designer, etc."
                  />
                </div>

                <div>
                  <Label>Description * ({formData.description.length}/200)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    maxLength={200}
                    rows={4}
                    placeholder="Décrivez votre activité en quelques mots..."
                    data-testid="description-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pays *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => handleChange('location', value)}
                    >
                      <SelectTrigger data-testid="country-select">
                        <SelectValue placeholder="Sélectionner un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(COUNTRIES).map(country => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ville *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => handleChange('city', value)}
                      disabled={!formData.location}
                    >
                      <SelectTrigger data-testid="city-select">
                        <SelectValue placeholder="Sélectionner une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.location &&
                          getCountryCities(formData.location).map(city => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact & Tags */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-bleu-marine text-center mb-6">
                  Détails publics
                </h2>

                <div>
                  <Label>Compétences / Tags * (max 5) - {formData.tags.length}/5 sélectionnés</Label>
                  
                  {/* Tags sélectionnés */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-jaune-soleil/10 rounded-lg border border-jaune-soleil">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} className="bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90 px-3 py-1.5 text-sm">
                          {AVAILABLE_TAGS.find(t => t.value === tag)?.icon} {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-red-600"
                            type="button"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Barre de recherche */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      placeholder="Rechercher une compétence..."
                      className="pl-10"
                      disabled={formData.tags.length >= 5}
                    />
                  </div>

                  {/* Filtres par catégorie */}
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    <Button
                      type="button"
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className={selectedCategory === 'all' ? 'bg-bleu-marine' : ''}
                    >
                      Toutes
                    </Button>
                    {Object.keys(CATEGORY_NAMES).slice(0, 6).map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className={selectedCategory === cat ? 'bg-bleu-marine' : ''}
                      >
                        {CATEGORY_NAMES[cat]}
                      </Button>
                    ))}
                  </div>

                  {/* Liste des tags disponibles */}
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {filteredTags().map((tag) => {
                        const isSelected = formData.tags.includes(tag.value);
                        const isDisabled = formData.tags.length >= 5 && !isSelected;
                        
                        return (
                          <button
                            key={tag.value}
                            type="button"
                            onClick={() => isSelected ? removeTag(tag.value) : addTag(tag.value)}
                            disabled={isDisabled}
                            className={`
                              px-3 py-2 rounded-lg text-sm font-medium text-left transition-all
                              ${isSelected 
                                ? 'bg-vert-emeraude text-white ring-2 ring-vert-emeraude' 
                                : isDisabled
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-white hover:bg-bleu-marine/10 hover:ring-1 hover:ring-bleu-marine'
                              }
                            `}
                            data-testid={`tag-${tag.value}`}
                          >
                            <span className="mr-1">{tag.icon}</span>
                            {tag.value}
                          </button>
                        );
                      })}
                    </div>
                    
                    {filteredTags().length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        Aucune compétence trouvée
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Cliquez sur une compétence pour l'ajouter (max 5)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Téléphone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+229 XX XX XX XX"
                      data-testid="phone-input"
                    />
                  </div>
                  <div>
                    <Label>WhatsApp *</Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="+229 XX XX XX XX"
                      data-testid="whatsapp-input"
                    />
                  </div>
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="exemple@email.com"
                    data-testid="email-input"
                  />
                </div>

                <div>
                  <Label>Site web (optionnel)</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://www.monsite.com"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-bleu-marine text-center mb-6">
                  Prévisualisation de votre profil
                </h2>

                <Card
                  className={`border-2 ${
                    isPublished
                      ? 'border-jaune-soleil'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          isPublished
                            ? 'bg-vert-emeraude/10 text-vert-emeraude'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isPublished ? 'Statut : En ligne' : 'Statut : Désactivé'}
                      </span>
                    </div>

                    <div className="flex justify-center mb-4">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-jaune-soleil flex items-center justify-center text-4xl font-bold text-bleu-marine">
                          {formData.firstName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-bleu-marine">
                        {formData.companyName || `${formData.firstName} ${formData.lastName}`}
                      </h3>
                      {formData.activityName && (
                        <p className="text-gray-600 mb-2">{formData.activityName}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {formData.city}, {COUNTRIES[formData.location]?.name}
                      </p>
                    </div>

                    <p className="text-gray-700 mb-4 text-center">
                      {formData.description}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <p className="text-sm text-gray-600 text-center">
                        <strong>Type:</strong> {PROFILE_TYPES.find(pt => pt.value === formData.profileType)?.label}
                      </p>
                      <p className="text-sm text-gray-600 text-center">
                        <strong>Contacts masqués:</strong> Visibles après clic
                      </p>
                      {!isPublished && (
                        <p className="text-sm text-red-500 text-center font-semibold">
                          Ce profil est hors ligne et n'apparaît pas dans l'annuaire.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Les informations de contact (téléphone, email) seront protégées et visibles uniquement lorsqu'un utilisateur cliquera sur les boutons de contact.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 justify-between mt-8 pt-6 border-t">
              <div>
                {currentStep > 1 && (
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="border-bleu-marine text-bleu-marine"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Précédent
                  </Button>
                )}
              </div>

              <div className="flex gap-3 ml-auto">
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  disabled={saving}
                  className="border-jaune-soleil text-bleu-marine"
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    className="bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={isPublished ? handleUnpublish : handlePublish}
                    disabled={processing || (isPublished && !profileId)}
                    className={
                      isPublished
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-vert-emeraude text-white hover:bg-vert-emeraude/90'
                    }
                    data-testid="publish-profile-btn"
                  >
                    {processing
                      ? (isPublished ? 'Dépublication...' : 'Publication...')
                      : (isPublished ? 'Dépublier mon profil' : 'Publier mon profil')}
                    {isPublished ? (
                      <EyeOff className="w-4 h-4 ml-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {lastSavedAt && (
              <p className="text-xs text-gray-500 mt-3 text-right">
                Dernière sauvegarde : {formatLastSavedLabel(lastSavedAt)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
