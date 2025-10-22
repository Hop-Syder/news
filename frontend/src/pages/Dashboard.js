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
import { ChevronLeft, ChevronRight, CheckCircle2, Upload, X, Search } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

  const [tagInput, setTagInput] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
    if (user) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user, authLoading, navigate]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'location' ? { city: '' } : {})
    }));
    setError('');
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
  };

  const removeLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const addTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
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

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API}/entrepreneurs`, formData);
      navigate('/annuaire');
    } catch (error) {
      setError(error.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
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
                  <Label>Compétences / Tags * (max 5)</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Ex: Design, Marketing, Développement..."
                      disabled={formData.tags.length >= 5}
                      data-testid="tag-input"
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      disabled={formData.tags.length >= 5 || !tagInput.trim()}
                      className="bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90"
                    >
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} className="bg-bleu-marine text-white">
                        {tag}
                        <button
                          onClick={() => removeTag(index)}
                          className="ml-2 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
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

                <Card className="border-2 border-jaune-soleil">
                  <CardContent className="p-6">
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
            <div className="flex justify-between mt-8 pt-6 border-t">
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

              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  className="ml-auto bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto bg-vert-emeraude text-white hover:bg-vert-emeraude/90"
                  data-testid="publish-profile-btn"
                >
                  {loading ? 'Publication...' : 'Publier mon profil'}
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
