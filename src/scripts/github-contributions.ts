interface Contribution {
  date: string;
  count: number;
  level: number;
}

interface ContributionsResponse {
  total: { lastYear: number };
  contributions: Contribution[];
}

const API_URL = 'https://github-contributions-api.jogruber.de/v4/AndresVGu?y=last';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isContribution(value: unknown): value is Contribution {
  if (!isRecord(value)) return false;
  return (
    typeof value.date === 'string' &&
    typeof value.count === 'number' &&
    Number.isFinite(value.count) &&
    typeof value.level === 'number' &&
    Number.isInteger(value.level) &&
    value.level >= 0 &&
    value.level <= 4
  );
}

function isContributionsResponse(value: unknown): value is ContributionsResponse {
  if (!isRecord(value) || !isRecord(value.total)) return false;
  return (
    typeof value.total.lastYear === 'number' &&
    Number.isFinite(value.total.lastYear) &&
    Array.isArray(value.contributions) &&
    value.contributions.length > 0 &&
    value.contributions.every(isContribution)
  );
}

function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export async function refreshGitHubContributions(): Promise<void> {
  const card = document.querySelector<HTMLElement>('[data-github-contributions]');
  if (!card) return;

  const totalElement = card.querySelector<HTMLElement>('[data-github-total]');
  const monthsElement = card.querySelector<HTMLElement>('[data-github-months]');
  const heatmapElement = card.querySelector<HTMLElement>('[data-github-heatmap]');
  if (!totalElement || !monthsElement || !heatmapElement) {
    throw new Error('GitHub contributions card is missing required elements.');
  }

  const response = await fetch(API_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`GitHub contributions request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!isContributionsResponse(payload)) {
    throw new TypeError('GitHub contributions response has an invalid format.');
  }

  const contributions = payload.contributions.slice(-140);
  const columns = Math.ceil(contributions.length / 7);
  const locale = card.dataset.locale || 'en';
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short' });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const monthLabels = document.createDocumentFragment();
  let lastMonth = -1;

  for (let column = 0; column < columns; column++) {
    const date = parseLocalDate(contributions[column * 7].date);
    const month = date.getMonth();
    if (month === lastMonth) continue;

    const label = document.createElement('span');
    label.className = 'gh-month-label';
    label.style.gridColumn = `${column + 1}`;
    label.textContent = monthFormatter.format(date);
    monthLabels.append(label);
    lastMonth = month;
  }

  const cells = document.createDocumentFragment();
  for (const contribution of contributions) {
    const cell = document.createElement('div');
    cell.className = `gh-cell gh-level-${contribution.level}`;
    cell.title = `${dateFormatter.format(parseLocalDate(contribution.date))}: ${contribution.count}`;
    cells.append(cell);
  }

  totalElement.textContent = `${payload.total.lastYear} contributions`;
  monthsElement.style.gridTemplateColumns = `repeat(${columns}, minmax(8px, 1fr))`;
  monthsElement.replaceChildren(monthLabels);
  heatmapElement.replaceChildren(cells);
}
