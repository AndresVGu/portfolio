import { beforeEach, describe, expect, it, vi } from 'vitest';
import { refreshGitHubContributions } from '../scripts/github-contributions';

function createCard(): HTMLElement {
  const card = document.createElement('div');
  card.dataset.githubContributions = '';
  card.dataset.locale = 'en';
  card.innerHTML = `
    <span data-github-total>304 contributions</span>
    <div data-github-months></div>
    <div class="gh-heatmap" data-github-heatmap><div class="gh-cell gh-level-1"></div></div>
  `;
  document.body.append(card);
  return card;
}

function createContributionsResponse() {
  const contributions = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(2026, 6, 25 + index);
    const formattedDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    return { date: formattedDate, count: index, level: index % 5 };
  });

  return { total: { lastYear: 321 }, contributions };
}

describe('GitHub contributions refresh', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it('updates the count, month labels, and heatmap with live data', async () => {
    const card = createCard();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => createContributionsResponse(),
    });
    vi.stubGlobal('fetch', fetchMock);

    await refreshGitHubContributions();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://github-contributions-api.jogruber.de/v4/AndresVGu?y=last',
      { cache: 'no-store' }
    );
    expect(card.querySelector('[data-github-total]')?.textContent).toBe('321 contributions');
    expect(Array.from(card.querySelectorAll('.gh-month-label'), (label) => label.textContent)).toEqual([
      'Jul',
      'Aug',
    ]);
    expect(card.querySelectorAll('.gh-heatmap .gh-cell')).toHaveLength(14);
    expect(card.querySelector('.gh-heatmap .gh-level-4')).not.toBeNull();
  });

  it('keeps the build-time content when the live request fails', async () => {
    const card = createCard();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 })
    );

    await expect(refreshGitHubContributions()).rejects.toThrow(
      'GitHub contributions request failed with status 503.'
    );

    expect(card.querySelector('[data-github-total]')?.textContent).toBe('304 contributions');
    expect(card.querySelectorAll('.gh-heatmap .gh-cell')).toHaveLength(1);
  });
});
