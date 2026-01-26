import { buildApiUrl } from '@/utils/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  consent_to_public_share: boolean;
  email_verified?: boolean;
  avatar_url?: string;
  bio?: string;
  objective?: string;
  experience_level?: string;
  training_frequency?: number;
  equipment_available?: string;
  location?: string;
  height?: number;
  weight?: number;
  birth_date?: string;
  gender?: string;
  profile_completed?: boolean;
  accessToken?: string; // Pour stocker le token d'accès
}

export const login = async (payload: LoginRequest): Promise<TokenPair> => {
  const url = buildApiUrl('/auth/login');
  console.log('🔗 URL de connexion:', url);
  console.log('📤 Payload:', { username: payload.username, password: '***' });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.log('📥 Statut réponse:', response.status);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erreur de connexion' }));
    console.error('❌ Erreur login:', error);
    throw new Error(error.detail || 'Erreur de connexion');
  }

  const data = await response.json();
  console.log('✅ Login réussi, token reçu:', data.access_token.substring(0, 20) + '...');
  return data;
};

export const register = async (payload: RegisterRequest): Promise<TokenPair> => {
  const response = await fetch(buildApiUrl('/auth/register-v2'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erreur d\'inscription' }));
    throw new Error(error.detail || 'Erreur d\'inscription');
  }

  return response.json();
};

export const refreshToken = async (refreshToken: string): Promise<TokenPair> => {
  const response = await fetch(buildApiUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Token expiré');
  }

  return response.json();
};

export const getMe = async (accessToken: string): Promise<User> => {
  const url = buildApiUrl('/auth/me');
  console.log('🔗 URL getMe:', url);
  console.log('🔑 Token:', accessToken.substring(0, 20) + '...');
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log('📥 Statut getMe:', response.status);

  if (!response.ok) {
    console.error('❌ Erreur getMe, statut:', response.status);
    throw new Error('Erreur de récupération du profil');
  }

  const userData = await response.json();
  console.log('✅ Données utilisateur récupérées:', userData);
  return userData;
};

export const logout = async (refreshToken: string): Promise<void> => {
  await fetch(buildApiUrl('/auth/logout'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
};



