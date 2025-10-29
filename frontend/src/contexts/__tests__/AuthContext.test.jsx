import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const mockUnsubscribe = jest.fn();

jest.mock('@/lib/supabase', () => {
  const listeners = [];

  const auth = {
    getSession: jest.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
            created_at: '2024-01-01T00:00:00Z',
          },
          access_token: 'token-123',
        },
      },
    }),
    onAuthStateChange: jest.fn((callback) => {
      listeners.push(callback);
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
  };

  const fromMock = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: { first_name: 'Test', last_name: 'User', has_profile: true },
      error: null,
    }),
  }));

  return {
    supabase: {
      auth,
      from: fromMock,
    },
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

const AuthStateConsumer = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <span data-testid="auth-state">loading</span>;
  }

  return <span data-testid="auth-state">{user?.email || 'no-user'}</span>;
};

const LogoutConsumer = () => {
  const { user, loading, logout } = useAuth();

  return (
    <div>
      <span data-testid="auth-ready">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="auth-user">{user ? 'signed-in' : 'signed-out'}</span>
      <button type="button" data-testid="logout-button" onClick={() => logout('manual')}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  test('fournit un utilisateur authentifié après chargement', async () => {
    render(
      <AuthProvider>
        <AuthStateConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth-state').textContent).toBe('user@example.com'));
  });

  test('permet la déconnexion et réinitialise le contexte', async () => {
    render(
      <AuthProvider>
        <LogoutConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth-ready').textContent).toBe('ready'));
    expect(screen.getByTestId('auth-user').textContent).toBe('signed-in');

    fireEvent.click(screen.getByTestId('logout-button'));

    await waitFor(() => expect(screen.getByTestId('auth-user').textContent).toBe('signed-out'));
  });
});
