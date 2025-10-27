import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Key,
  Mail,
  Shield,
  Trash2,
  User
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '';

const MonProfil = () => {
  const { user, getAccessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfileId = async () => {
      if (!API) return;
      try {
        const token = getAccessToken?.();
        if (!token) return;
        const response = await axios.get(`${API}/entrepreneurs/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileId(response.data?.id || null);
      } catch (err) {
        // Pas de profil, rien de grave
        setProfileId(null);
      }
    };

    fetchProfileId();
  }, [getAccessToken, API]);

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      setSuccess('✅ Mot de passe mis à jour avec succès.');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('❌ [MonProfil] update password:', err);
      setError(err.message || 'Impossible de changer le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setSuccess('');

    if (deleteConfirm !== 'SUPPRIMER') {
      setError('Veuillez taper SUPPRIMER pour confirmer.');
      return;
    }

    if (!window.confirm('⚠️ Cette action est définitive. Confirmez la suppression de votre compte ?')) {
      return;
    }

    setLoading(true);

    try {
      const token = getAccessToken?.();
      if (token && profileId) {
        await axios.delete(`${API}/entrepreneurs/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      await logout();
      navigate('/');
    } catch (err) {
      console.error('❌ [MonProfil] delete account:', err);
      setError(err.response?.data?.detail || 'Suppression impossible pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bleu-marine">Mon Profil</h1>
          <p className="text-gray-600 mt-2">Gérez vos informations personnelles et la sécurité de votre compte.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-vert-emeraude/10 border-vert-emeraude text-vert-emeraude">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Membre depuis</p>
                  <p className="font-medium">{formatDate(user?.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Statut du compte</p>
                <p className="font-medium text-vert-emeraude">✅ Actif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Changer de mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label>Nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Minimum 6 caractères"
                  required
                />
              </div>
              <div>
                <Label>Confirmer le mot de passe</Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Retapez le mot de passe"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-bleu-marine text-white hover:bg-bleu-marine/90">
                {loading ? 'Changement...' : 'Changer le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Zone dangereuse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Cette action supprimera définitivement votre profil entrepreneur et déconnectera votre compte.
              </AlertDescription>
            </Alert>
            <div>
              <Label>Pour confirmer, tapez "SUPPRIMER" :</Label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="SUPPRIMER"
                className="border-red-300 focus:border-red-500"
              />
            </div>
            <Button
              variant="destructive"
              disabled={loading || deleteConfirm !== 'SUPPRIMER'}
              onClick={handleDeleteAccount}
              className="w-full"
            >
              {loading ? 'Suppression...' : 'Supprimer définitivement mon compte'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonProfil;
