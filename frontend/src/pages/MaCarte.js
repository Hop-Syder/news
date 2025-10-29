// Section : Importations nécessaires
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Crown,
  Edit,
  Eye,
  EyeOff,
  MapPin,
  Save,
  Star,
  Upload,
  X
} from 'lucide-react';
import { COUNTRIES, getCountryCities } from '@/data/countries';
import { PROFILE_TYPES } from '@/data/profileTypes';
import { AVAILABLE_TAGS } from '@/data/tags';
import { apiClient } from '@/lib/httpClient';

// Section : Logique métier et structure du module
const MaCarte = () => {
  const { user, getAccessToken, sessionInfo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSavedSnapshotRef = useRef('');

  const serializeFormData = useCallback((data) => JSON.stringify({
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    company_name: data.company_name || '',
    email: data.email || '',
    phone: data.phone || '',
    profile_type: data.profile_type || '',
    activity_name: data.activity_name || '',
    description: data.description || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    whatsapp: data.whatsapp || '',
    website: data.website || '',
    country_code: data.country_code || '',
    city: data.city || '',
    logo_url: data.logo_url || ''
  }), []);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    email: user?.email || '',
    phone: '',
    profile_type: '',
    activity_name: '',
    description: '',
    tags: [],
    whatsapp: '',
    website: '',
    country_code: '',
    city: '',
    logo_url: ''
  });

  const profileStatus = profile?.status ?? 'draft';
  const isNewProfile = !profile;
  const isDraft = profileStatus === 'draft';
  const isPublished = profileStatus === 'published';
  const isDeactivated = profileStatus === 'deactivated';
  const isLocked = Boolean(profile?.first_saved_at);

  const loggerError = useCallback((label, err) => {
    console.error(`❌ [MaCarte] ${label}:`, err.response?.data || err.message || err);
  }, []);

  useEffect(() => {
    if (!sessionInfo?.session_id) {
      return;
    }
    const params = new URLSearchParams(location.search);
    if (params.get('id') === sessionInfo.session_id) {
      return;
    }
    params.set('id', sessionInfo.session_id);
    const searchString = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: searchString ? `?${searchString}` : '',
      },
      { replace: true }
    );
  }, [sessionInfo?.session_id, location.pathname, location.search, navigate]);

  const ensureAuthToken = useCallback(() => {
    const token = getAccessToken?.();
    if (!token) {
      throw new Error('AUTH_MISSING');
    }
    return token;
  }, [getAccessToken]);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      ensureAuthToken();
      const { data } = await apiClient.get('/entrepreneurs/me');

      const normalizedData = {
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        company_name: data.company_name || '',
        email: data.email || user?.email || '',
        phone: data.phone || '',
        profile_type: data.profile_type || '',
        activity_name: data.activity_name || '',
        description: data.description || '',
        tags: data.tags || [],
        whatsapp: data.whatsapp || '',
        website: data.website || '',
        country_code: data.country_code || '',
        city: data.city || '',
        logo_url: data.logo_url || ''
      };

      setProfile(data);
      setFormData(normalizedData);
      setLogoPreview(normalizedData.logo_url || '');
      lastSavedSnapshotRef.current = serializeFormData(normalizedData);
      setHasUnsavedChanges(false);
      setIsEditing(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(null);
        setIsEditing(true);
        setLogoPreview('');
        const emptyState = {
          first_name: '',
          last_name: '',
          company_name: '',
          email: user?.email || '',
          phone: '',
          profile_type: '',
          activity_name: '',
          description: '',
          tags: [],
          whatsapp: '',
          website: '',
          country_code: '',
          city: '',
          logo_url: ''
        };
        setFormData(emptyState);
        lastSavedSnapshotRef.current = serializeFormData(emptyState);
        setHasUnsavedChanges(false);
      } else if (err.message === 'AUTH_MISSING') {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        setError('Impossible de charger votre profil pour le moment.');
        loggerError('fetchProfile', err);
      }
    } finally {
      setLoading(false);
    }
  }, [ensureAuthToken, loggerError, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    const snapshot = serializeFormData(formData);
    if (lastSavedSnapshotRef.current === '') {
      lastSavedSnapshotRef.current = snapshot;
      if (hasUnsavedChanges) {
        setHasUnsavedChanges(false);
      }
      return;
    }

    if (snapshot !== lastSavedSnapshotRef.current) {
      if (!hasUnsavedChanges) {
        setHasUnsavedChanges(true);
      }
    } else if (hasUnsavedChanges) {
      setHasUnsavedChanges(false);
    }
  }, [formData, serializeFormData, hasUnsavedChanges]);

  const addTag = (tag) => {
    if (formData.tags.includes(tag)) {
      return;
    }
    if (formData.tags.length >= 5) {
      setError('Maximum 5 compétences autorisées.');
      return;
    }
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag)
    }));
  };

  const isFormValid = useCallback((options = { showErrors: true }) => {
    const { showErrors = true } = options;

    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.profile_type || !formData.country_code || !formData.city) {
      if (showErrors) {
        setError('Merci de remplir tous les champs obligatoires.');
      }
      return false;
    }

    if (!formData.description || formData.description.length > 200) {
      if (showErrors) {
        setError('La description doit contenir entre 1 et 200 caractères.');
      }
      return false;
    }

    if (formData.tags.length === 0) {
      if (showErrors) {
        setError('Ajoutez au moins une compétence.');
      }
      return false;
    }

    return true;
  }, [formData]);

  const performSave = useCallback(async ({ silent = false } = {}) => {
    if (!isFormValid({ showErrors: !silent })) {
      return false;
    }

    const creating = !profile;
    if (!silent) {
      setSaving(true);
      setError('');
      setSuccess('');
    }

    try {
      ensureAuthToken();
      const payload = { ...formData };
      let response;

      if (creating) {
        response = await apiClient.post('/entrepreneurs/me', payload);
        if (!silent) {
          setSuccess('✅ Carte créée avec succès ! Publiez-la pour la rendre visible.');
        }
      } else {
        response = await apiClient.put('/entrepreneurs/me', payload);
        if (!silent) {
          setSuccess('✅ Modifications sauvegardées avec succès.');
        }
      }

      if (response?.data) {
        const normalizedData = {
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          company_name: response.data.company_name || '',
          email: response.data.email || user?.email || '',
          phone: response.data.phone || '',
          profile_type: response.data.profile_type || '',
          activity_name: response.data.activity_name || '',
          description: response.data.description || '',
          tags: response.data.tags || [],
          whatsapp: response.data.whatsapp || '',
          website: response.data.website || '',
          country_code: response.data.country_code || '',
          city: response.data.city || '',
          logo_url: response.data.logo_url || ''
        };

        setProfile(response.data);
        setFormData(normalizedData);
        setLogoPreview(normalizedData.logo_url || '');
        lastSavedSnapshotRef.current = serializeFormData(normalizedData);
        setHasUnsavedChanges(false);
      }

      if (!silent) {
        setIsEditing(false);
      }

      return true;
    } catch (err) {
      if (err.message === 'AUTH_MISSING') {
        if (!silent) {
          setError('Votre session a expiré. Veuillez vous reconnecter.');
        }
      } else {
        loggerError('handleSave', err);
        if (!silent) {
          setError(err.response?.data?.detail || 'Erreur lors de la sauvegarde.');
        }
      }
      return false;
    } finally {
      if (!silent) {
        setSaving(false);
      }
    }
  }, [formData, ensureAuthToken, isFormValid, loggerError, profile, serializeFormData, user?.email]);

  const handleSave = async () => {
    await performSave({ silent: false });
  };

  const essentialFieldsFilled = Boolean(
    formData.first_name &&
    formData.last_name &&
    formData.phone &&
    formData.profile_type &&
    formData.country_code &&
    formData.city
  );

  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !essentialFieldsFilled) {
      return;
    }
    await performSave({ silent: true });
  }, [hasUnsavedChanges, essentialFieldsFilled, performSave]);

  useEffect(() => {
    if (!hasUnsavedChanges || !essentialFieldsFilled || logoUploading || saving) {
      return;
    }

    if (!isEditing && !isNewProfile) {
      return;
    }

    const timer = window.setTimeout(() => {
      autoSave();
    }, 30 * 1000);

    return () => window.clearTimeout(timer);
  }, [autoSave, essentialFieldsFilled, hasUnsavedChanges, isEditing, isNewProfile, logoUploading, saving]);

  const handlePublish = async () => {
    setError('');
    setSuccess('');

    try {
      ensureAuthToken();
      const response = await apiClient.patch('/entrepreneurs/me/status', { status: 'published' });
      setProfile((prev) => ({ ...prev, status: 'published' }));
      setSuccess(response.data?.message || 'Profil publié !');
    } catch (err) {
      if (err.message === 'AUTH_MISSING') {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        loggerError('handlePublish', err);
        setError(err.response?.data?.detail || "Impossible de publier le profil.");
      }
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver votre profil ?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      ensureAuthToken();
      const response = await apiClient.patch('/entrepreneurs/me/status', { status: 'deactivated' });
      setProfile((prev) => ({ ...prev, status: 'deactivated' }));
      setSuccess(response.data?.message || 'Profil désactivé.');
    } catch (err) {
      if (err.message === 'AUTH_MISSING') {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        loggerError('handleDeactivate', err);
        setError(err.response?.data?.detail || "Impossible de désactiver le profil.");
      }
    }
  };

  const handleDraft = async () => {
    setError('');
    setSuccess('');

    try {
      ensureAuthToken();
      const response = await apiClient.patch('/entrepreneurs/me/status', { status: 'draft' });
      setProfile((prev) => ({ ...prev, status: 'draft' }));
      setSuccess(response.data?.message || 'Profil enregistré en brouillon.');
    } catch (err) {
      if (err.message === 'AUTH_MISSING') {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        loggerError('handleDraft', err);
        setError(err.response?.data?.detail || "Impossible de repasser en brouillon.");
      }
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format invalide. Formats acceptés : PNG, JPG, JPEG, WEBP, SVG.');
      event.target.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Fichier trop volumineux (max 2 Mo).');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setLogoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    setLogoUploading(true);
    setError('');
    setSuccess('');

    try {
      ensureAuthToken();
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await apiClient.post('/storage/upload-logo', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });

      const url = response.data?.url;
      if (url) {
        handleChange('logo_url', url);
        setLogoPreview(url);
        setSuccess('Logo téléchargé avec succès.');
      } else {
        setError("Impossible de récupérer l'URL du logo.");
      }
    } catch (err) {
      if (err.message === 'AUTH_MISSING') {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        loggerError('handleLogoUpload', err);
        setError(err.response?.data?.detail || "Échec du téléversement du logo.");
      }
    } finally {
      setLogoUploading(false);
      event.target.value = '';
    }
  };

  const displayName = profile?.company_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  const countryName = profile?.country_code ? COUNTRIES[profile.country_code]?.name : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jaune-soleil" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bleu-marine">Ma Carte Entrepreneur</h1>
          <p className="text-gray-600 mt-2">
            {isNewProfile
              ? "Créez votre carte pour être visible dans l'annuaire."
              : "Gérez votre visibilité et vos informations publiques."}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-vert-emeraude/10 border-vert-emeraude text-vert-emeraude">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!isNewProfile && !isEditing && profile && (
          <Card className="mb-8 border-2 border-jaune-soleil shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <Badge
                  className={
                    isPublished
                      ? 'bg-vert-emeraude'
                      : isDeactivated
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                  }
                >
                  {isPublished
                    ? '✅ Publié'
                    : isDeactivated
                      ? '🔴 Désactivé'
                      : '📝 Brouillon'}
                </Badge>

                {profile.is_premium && (
                  <Badge className="bg-jaune-soleil text-bleu-marine">
                    <Crown className="w-3 h-3 mr-1" /> Premium
                  </Badge>
                )}
              </div>

              <div className="flex justify-center mb-6">
                {profile.logo_url ? (
                  <img
                    src={profile.logo_url}
                    alt="Logo"
                    loading="lazy"
                    decoding="async"
                    className="w-32 h-32 rounded-full object-cover border-4 border-jaune-soleil"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-jaune-soleil flex items-center justify-center text-4xl font-bold text-bleu-marine border-4 border-jaune-soleil">
                    {profile.first_name?.charAt(0) || displayName?.charAt(0) || 'N'}
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <h2 className="text-3xl font-bold text-bleu-marine">{`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Profil incomplet'}</h2>
                {profile.company_name && (
                  <p className="text-lg text-gray-600 mt-1">{profile.company_name}</p>
                )}
                {profile.activity_name && (
                  <p className="text-sm text-gray-500">{profile.activity_name}</p>
                )}
                {(profile.city || countryName) && (
                  <div className="flex items-center justify-center text-gray-600 mt-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{[profile.city, countryName].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-center max-w-2xl mx-auto mb-6">
                {profile.description}
              </p>

              {profile.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {profile.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {profile.rating > 0 && (
                <div className="flex items-center justify-center gap-2 text-bleu-marine">
                  <Star className="w-5 h-5 fill-jaune-soleil text-jaune-soleil" />
                  <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({profile.review_count} avis)</span>
                </div>
              )}
              <div className="text-center text-sm text-gray-600 mt-4">
                Type : {PROFILE_TYPES.find((type) => type.value === profile.profile_type)?.label || 'N/A'}
              </div>
            </CardContent>
          </Card>
        )}

        {!isNewProfile && !isEditing && profile && (
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Button onClick={() => setIsEditing(true)} className="bg-bleu-marine text-white hover:bg-bleu-marine/90">
              <Edit className="w-4 h-4 mr-2" /> Modifier
            </Button>
            {!isPublished && (
              <Button onClick={handlePublish} className="bg-vert-emeraude text-white hover:bg-vert-emeraude/90">
                <Eye className="w-4 h-4 mr-2" /> Publier
              </Button>
            )}
            {isPublished && (
              <Button onClick={handleDeactivate} variant="destructive">
                <EyeOff className="w-4 h-4 mr-2" /> Désactiver
              </Button>
            )}
            {!isDraft && (
              <Button onClick={handleDraft} variant="outline">
                Sauvegarder en brouillon
              </Button>
            )}
          </div>
        )}

        {(isEditing || isNewProfile) && (
          <Card>
            <CardHeader>
              <CardTitle>{isNewProfile ? 'Créer ma carte' : 'Modifier ma carte'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-red-700 font-semibold">
                    ⚠️ Ces champs ne pourront plus être modifiés après la première sauvegarde.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      disabled={isLocked}
                      className={isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                  </div>
                  <div>
                    <Label>Nom *</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      disabled={isLocked}
                      className={isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                  </div>
                  <div>
                    <Label>Nom de l'entreprise</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => handleChange('company_name', e.target.value)}
                      disabled={isLocked}
                      className={isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={isLocked}
                      className={isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}
                    />
                  </div>
                  <div>
                    <Label>Téléphone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={isLocked}
                      className={isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Type de profil *</Label>
                  <select
                    value={formData.profile_type}
                    onChange={(e) => handleChange('profile_type', e.target.value)}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Sélectionnez un type</option>
                    {PROFILE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Nom d'activité</Label>
                  <Input
                    value={formData.activity_name}
                    onChange={(e) => handleChange('activity_name', e.target.value)}
                    placeholder="Ex : Développeur web, Coach, etc."
                  />
                </div>

                <div>
                  <Label>Description * ({formData.description.length}/200)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    maxLength={200}
                    placeholder="Décrivez votre activité en quelques mots"
                  />
                </div>

                <div>
                  <Label>Compétences / Tags * ({formData.tags.length}/5)</Label>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-jaune-soleil/10 border border-jaune-soleil rounded-lg">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} className="bg-jaune-soleil text-bleu-marine">
                          {tag}
                          <button type="button" className="ml-2" onClick={() => removeTag(tag)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {AVAILABLE_TAGS.map((tag) => {
                        const selected = formData.tags.includes(tag.value);
                        const disabled = !selected && formData.tags.length >= 5;
                        return (
                          <button
                            key={tag.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => (selected ? removeTag(tag.value) : addTag(tag.value))}
                            className={`px-3 py-2 rounded-lg text-sm text-left transition ${
                              selected
                                ? 'bg-vert-emeraude text-white ring-2 ring-vert-emeraude'
                                : disabled
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-white hover:bg-bleu-marine/10'
                            }`}
                          >
                            <span className="mr-2">{tag.icon}</span>
                            {tag.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>WhatsApp *</Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <Label>Site web</Label>
                    <Input
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pays *</Label>
                    <select
                      value={formData.country_code}
                      onChange={(e) => handleChange('country_code', e.target.value)}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Sélectionnez</option>
                      {Object.values(COUNTRIES).map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Ville *</Label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      disabled={!formData.country_code}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="">Sélectionnez</option>
                      {formData.country_code &&
                        getCountryCities(formData.country_code).map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Logo / Photo (PNG, JPG, WEBP, SVG) - 2 Mo max</Label>
                  <div className="flex items-center gap-3">
                    <Input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" onChange={handleLogoUpload} disabled={logoUploading} />
                    {(formData.logo_url || logoPreview) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          handleChange('logo_url', '');
                          setSuccess('');
                          setLogoPreview('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <Upload className="w-3 h-3" />
                    {logoUploading ? 'Téléversement en cours...' : 'Sélectionnez un fichier (2 Mo max). Un lien public sera généré automatiquement.'}
                  </p>
                  {(logoPreview || formData.logo_url) && (
                    <div className="mt-3 flex items-center gap-4">
                      <img
                        src={logoPreview || formData.logo_url}
                        alt="Aperçu du logo"
                        loading="lazy"
                        decoding="async"
                        className="w-20 h-20 rounded-full object-cover border-2 border-jaune-soleil"
                      />
                      {formData.logo_url && (
                        <a
                          href={formData.logo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-bleu-marine underline"
                        >
                          Voir le logo publié
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-6 border-t">
                {!isNewProfile && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                  >
                    Annuler
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-jaune-soleil text-bleu-marine hover:bg-jaune-soleil/90"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bleu-marine mr-2" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isNewProfile ? 'Créer ma carte' : 'Sauvegarder'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isNewProfile && (
          <Card className="mt-8 bg-bleu-marine/5">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-bleu-marine">Comment ça marche ?</h3>
              <ol className="space-y-3 text-gray-700">
                <li>1. Remplissez vos informations obligatoires.</li>
                <li>2. Sauvegardez votre carte – elle sera en brouillon.</li>
                <li>3. Publiez-la pour la rendre visible dans l'annuaire.</li>
                <li>4. Vous pouvez la désactiver à tout moment sans la supprimer.</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MaCarte;

// ──────────────────────────────────
// Hop-Syder Développeur
// Full Stack & Data Scientist Nexus Partners
// 📧 daoudaabassichristian@gmail.com
// 📱 +229 0196701733
// 🌐 nexuspartners.xyz
// ──────────────────────────────────
