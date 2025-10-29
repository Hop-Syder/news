import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Annuaire from '@/pages/Annuaire';
import { apiClient } from '@/lib/httpClient';

jest.mock('@/lib/httpClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('Page Annuaire', () => {
  beforeEach(() => {
    apiClient.get.mockReset();
  });

  test('affiche les profils récupérés via l’API', async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === '/entrepreneurs') {
        return Promise.resolve({
          data: [
            {
              id: '1',
              profile_type: 'freelance',
              first_name: 'Alice',
              last_name: 'Dupont',
              company_name: 'Studio Alice',
              activity_name: 'Design graphique',
              description: 'Création d’identités visuelles modernes.',
              tags: ['design', 'branding'],
              rating: 4.8,
              review_count: 12,
              is_premium: true,
              status: 'published',
              country_code: 'BJ',
              city: 'Cotonou',
              logo_url: null,
            },
          ],
        });
      }
      return Promise.resolve({ data: { phone: '', email: '', whatsapp: '' } });
    });

    render(<Annuaire />);

    await waitFor(() =>
      expect(apiClient.get).toHaveBeenCalledWith(
        '/entrepreneurs',
        expect.objectContaining({
          params: expect.any(Object),
          skipErrorToast: true,
        })
      )
    );

    expect(await screen.findByText('Studio Alice')).toBeInTheDocument();
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
  });
});
