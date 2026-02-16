# Authentification et base de données utilisateur – État des lieux

Synthèse de ce qui est déjà en place côté **API** et **app** pour l’auth et les utilisateurs.

---

## 1. Backend (API)

### 1.1 Modèle `User` (`api/src/api/models.py`)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | str (PK) | Identifiant unique (UUID par défaut ; à l’inscription on met parfois `username`) |
| `username` | str | Unique, indexé |
| `email` | str | Unique, indexé |
| `password_hash` | str | Hash PBKDF2 (salt + sha256) |
| `created_at` | datetime | Création du compte |
| `consent_to_public_share` | bool | Partage public des séances |
| `avatar_url`, `bio`, `objective` | optionnels | Profil |
| `experience_level`, `training_frequency`, `equipment_available` | optionnels | Objectifs fitness |
| `location`, `height`, `weight`, `birth_date`, `gender` | optionnels | Infos perso |
| `profile_completed` | bool | Profil “complet” ou non |
| `email_verified` | bool | Email vérifié |
| `email_verification_token`, `email_verification_expires` | optionnels | Vérification email |
| `reset_password_token`, `reset_password_expires` | optionnels | Reset mot de passe |
| `oauth_provider`, `oauth_id` | optionnels | OAuth (prévu) |
| `last_login`, `login_count` | optionnels | Stats de connexion |

### 1.2 Tables liées à l’auth

- **`RefreshToken`** : token de refresh JWT, `user_id`, `token`, `expires_at`, `revoked`.
- **`LoginAttempt`** : tentatives de login (username, ip_address, success, created_at) pour le rate limiting.

### 1.3 Routes auth (`api/src/api/routes/auth.py`)

| Méthode | Route | Description |
|---------|--------|-------------|
| POST | `/auth/register` | Inscription (validation username/email/password, vérif email envoyée) |
| POST | `/auth/register-v2` | Idem (utilisé par l’app) |
| POST | `/auth/login` | Connexion username + password, rate limiting, retourne access + refresh token |
| POST | `/auth/refresh` | Nouveau access token avec le refresh token (Bearer) |
| GET | `/auth/me` | Profil de l’utilisateur connecté (Bearer access token) |
| POST | `/auth/logout` | Invalidation du refresh token (Bearer refresh token) |
| POST | `/auth/verify-email` | Vérification email avec token |
| POST | `/auth/resend-verification` | Renvoyer l’email de vérification |
| POST | `/auth/reset-password` | Demande de reset (envoi email) |
| POST | `/auth/reset-password-confirm` | Confirmation reset avec token + nouveau mot de passe |

Règles métier :

- **Username** : 3+ caractères, `[a-zA-Z0-9_-]`, noms réservés interdits.
- **Email** : format valide, stocké en minuscules.
- **Mot de passe** : 8+ caractères, au moins 1 minuscule, 1 majuscule, 1 chiffre, pas de mots courants.
- **Rate limiting** : après N échecs (ex. 5) par username ou IP, cooldown (ex. 15 min).

### 1.4 Utilitaires auth (`api/src/api/utils/auth.py`)

- **Tokens** : JWT “maison” (base64 + HMAC-SHA256), pas de lib JWT.
- **Access token** : 30 min, `type: "access"`, `sub: user_id`.
- **Refresh token** : 14 jours, `type: "refresh"`, stocké en base.
- **Mots de passe** : `hash_password()` (PBKDF2-HMAC-SHA256, 100k itérations, salt 8 bytes), `verify_password()`.
- **Secret** : variable d’environnement `AUTH_SECRET` (32+ caractères, pas la valeur par défaut en prod).

### 1.5 Routes utilisateur / profil (`api/src/api/routes/users.py`)

- `GET /users/profile/{user_id}` : profil public (lecture).
- `PUT /users/profile/{user_id}` : mise à jour du **propre** profil (username, bio, avatar_url, objective).
- `GET /users/profile/status` : statut de complétion du profil (pour l’app).
- `POST /users/profile/setup/step1`, `step2`, etc. : configuration du profil par étapes.

Les autres routes (feed, programmes, sync, etc.) utilisent `_get_current_user` (Bearer access token) pour identifier l’utilisateur.

### 1.6 Base de données

- **SQLite** en dev (`api/gorillax.db`).
- **PostgreSQL** possible en prod via `DATABASE_URL`.
- Migrations Alembic dans `api/migrations/versions/` (baseline, login_attempts, email_fields, profile_fields).
- Compte **demo** : créé/mis à jour par `api/create_demo_user.py` (username: `demo`, password: `DemoPassword123`).

---

## 2. Frontend (App)

### 2.1 Hook `useAuth` (`app/src/hooks/useAuth.tsx`)

- **État** : `user`, `tokens` (access + refresh), `isLoading`, `isAuthenticated`.
- **Stockage** : AsyncStorage  
  - `@gorillax_access_token`, `@gorillax_refresh_token`, `@gorillax_user`.
- **Au démarrage** : chargement des tokens + user, puis appel `GET /auth/me` pour valider l’access token ; si échec, session effacée.
- **Méthodes** :
  - `login({ username, password })` → POST `/auth/login`, puis GET `/auth/me`, puis `saveAuth`.
  - `register({ username, email, password })` → POST `/auth/register-v2`, puis GET `/auth/me`, puis `saveAuth`.
  - `logout()` → POST `/auth/logout` (si refresh dispo), effacement des données locales (workouts, mutations, sync), puis `clearAuth`.
  - `refreshAuth()` → POST `/auth/refresh`, puis mise à jour des tokens et user.
  - `updateProfile()` → GET `/auth/me`, mise à jour de `user` et AsyncStorage.

### 2.2 Types côté app

- **User** : id, username, email, created_at, consent_to_public_share, profile_completed, email_verified, bio, objective, avatar_url.
- **AuthTokens** : access_token, refresh_token, token_type.

### 2.3 Écrans

- **Login** (`app/app/login.tsx`) : champs username/password, bouton “Connexion”, bouton “Connexion Demo” (demo / DemoPassword123), redirection vers `/(tabs)` en cas de succès.
- **Register** (`app/app/register.tsx`) : username, email, password, confirmation ; validation côté client alignée sur l’API ; après succès → `register()` puis redirection vers `/profile-setup-simple`.
- **Profile setup** : `profile-setup-simple.tsx` (et éventuellement `profile-setup.tsx`) pour compléter le profil après inscription.

### 2.4 Protection des routes

- **AuthGuard** / **SimpleAuthGuard** : redirection vers `/login` si non authentifié, ou vers `/(tabs)` si authentifié selon le cas.
- Les appels API authentifiés envoient `Authorization: Bearer <access_token>`.

### 2.5 Déconnexion et données locales

- Au logout, en plus de l’appel API et du clear auth, l’app efface les données locales (workouts, file de mutations, état de sync) pour ne pas garder de données d’un autre utilisateur.

---

## 3. Points d’attention / incohérences possibles

1. **`User.id`** : en inscription (`auth.py`) on fait `User(id=username, ...)` donc l’id peut être le **username**. En seed demo on utilise des ids du type `demo-user-1`, `demo`, etc. Le modèle autorise un `id` string (PK) ; c’est cohérent mais à garder en tête pour les jointures (workouts, programmes, etc.) qui utilisent `user_id`.
2. **Logout API** : le front envoie le **refresh** token dans `Authorization` pour `/auth/logout` ; la route attend bien le refresh token et supprime la ligne dans `RefreshToken`. C’est cohérent.
3. **Vérification email** : l’API envoie un email de vérification à l’inscription et expose verify/resend ; côté app, pas d’écran dédié “vérifie ton email” ni de blocage si `email_verified` est false (l’utilisateur peut déjà utiliser l’app).
4. **Reset password** : endpoints présents côté API ; pas d’UI “mot de passe oublié” visible dans les écrans login/register parcourus.

---

## 4. Résumé

| Domaine | Déjà en place |
|---------|----------------|
| **Inscription** | Oui (register-v2, validation, hash, tokens, profil de base) |
| **Connexion** | Oui (login, JWT access/refresh, rate limiting) |
| **Déconnexion** | Oui (logout API + nettoyage local) |
| **Profil utilisateur** | Oui (GET/PUT profile, profile status, setup par étapes) |
| **Refresh token** | Oui (côté API et stockage + refresh côté app) |
| **Sécurité** | Hash mot de passe, AUTH_SECRET, rate limiting, validation des entrées |
| **Email** | Vérification et reset prévus en API ; peu ou pas d’UI dédiée |
| **Base utilisateur** | User + RefreshToken + LoginAttempt, migrations, SQLite/PostgreSQL |

Tu peux t’appuyer sur ce doc pour décider des prochaines étapes (ex. écran “mot de passe oublié”, renforcement de la vérification email, ou évolutions métier sur le profil).
