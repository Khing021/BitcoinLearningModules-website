import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import * as releaseLib from '../src/lib/release';
import * as composerLib from '../src/lib/composer';

vi.mock('../src/lib/release', () => ({
  loadRelease: vi.fn()
}));

vi.mock('../src/lib/composer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/composer')>();
  return {
    ...actual,
    composeDeck: vi.fn().mockResolvedValue({
      html: '<html><body>Mock Deck</body></html>',
      units: [],
      slides: ['<div>Slide 1</div>'],
      headHtml: '<html><body>',
      tailHtml: '</body></html>'
    })
  };
});

const mockReleaseData = {
  info: { releaseId: 'v1', schemaVersion: 1, locale: 'th', licenseStatus: 'ok', catalogHash: 'hash' },
  units: [
    { unitId: 'u01', sequence: 1, title: 'Unit 1', durationMinutes: 10, classPath: '', guidePath: '' }
  ],
  tracks: [
    { trackId: 't1', name: 'Track 1', unitIds: ['u01'] }
  ]
};

describe('App UI', () => {
  it('renders Home page', async () => {
    vi.mocked(releaseLib.loadRelease).mockResolvedValue(mockReleaseData);
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    const heroTitle = await screen.findByRole('heading', { level: 1 });
    expect(heroTitle.textContent).toContain('สื่อการสอนบิตคอยน์');
  });

  it('renders Builder page with unit checkboxes', async () => {
    vi.mocked(releaseLib.loadRelease).mockResolvedValue(mockReleaseData);
    render(
      <MemoryRouter initialEntries={['/builder']}>
        <App />
      </MemoryRouter>
    );
    const element = await screen.findByText('Unit 1');
    expect(element).toBeTruthy();
    // Assuming there's a checkbox for it
    const checkbox = await screen.findByRole('checkbox', { name: /Unit 1/i });
    expect(checkbox).toBeTruthy();
  });

  it('renders Player page with an iframe', async () => {
    vi.mocked(releaseLib.loadRelease).mockResolvedValue(mockReleaseData);
    render(
      <MemoryRouter initialEntries={['/class?release=v1&units=u01']}>
        <App />
      </MemoryRouter>
    );
    // Player should have an active slide iframe
    const iframe = await screen.findByTitle('Slide 1');
    expect(iframe).toBeTruthy();
  });

  it('redirects legacy /tracks/:trackId to /builder with matching units', async () => {
    vi.mocked(releaseLib.loadRelease).mockResolvedValue(mockReleaseData);
    render(
      <MemoryRouter initialEntries={['/tracks/t1']}>
        <App />
      </MemoryRouter>
    );
    // Should render Builder with Unit 1 selected
    const checkbox = (await screen.findByRole('checkbox', { name: /Unit 1/i })) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
});
