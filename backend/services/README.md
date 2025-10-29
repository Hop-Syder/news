# Services backend

Ce répertoire regroupe les intégrations externes utilisées par l'API.  
Chaque service encapsule une dépendance tierce afin de :

- centraliser la configuration et les clés d'accès ;
- contrôler les erreurs remontées à l'application FastAPI ;
- exposer une interface cohérente pour le reste du backend.

## `supabase_client.py`

| Fonction | Rôle | Notes |
| --- | --- | --- |
| `get_supabase_admin()` | Fournit un client Supabase authentifié avec la clé `service_role`. Utilisé pour toutes les opérations backend nécessitant de contourner les politiques RLS. | Le client est mis en cache via `lru_cache` pour éviter des ré-initialisations coûteuses. |
| `get_supabase_client(access_token=None)` | Crée un client Supabase "public". Si un jeton utilisateur est fourni, les requêtes respectent les politiques RLS de Supabase. | Permet d'agir au nom d'un utilisateur (upload, lecture sécurisée, etc.). |

### Bonnes pratiques

- Ajouter un service par intégration externe (paiement, e-mailing, etc.).
- Documenter les prérequis (variables d'environnement, rôles) directement ici.
- Préférer retourner des exceptions explicites afin que les routeurs puissent les convertir en `HTTPException`.

Mise à jour : cette documentation doit évoluer dès qu'un nouveau service ou une nouvelle méthode est ajoutée.
