import { brands, games, products, techTerms } from './data';

export function normalize(text) {
  return String(text || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[·•]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i += 1) {
    const curr = [i];
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[n];
}

export function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  return 1 - levenshtein(a, b) / maxLen;
}

function isSubsequence(query, keyword) {
  let index = 0;
  for (const char of keyword) {
    if (char === query[index]) index += 1;
    if (index === query.length) return true;
  }
  return index === query.length;
}

function scorePair(query, keyword) {
  if (keyword.includes(query)) return 95 + (query.length / keyword.length) * 5;
  if (query.includes(keyword) && keyword.length >= 2) return 88;
  if (isSubsequence(query, keyword) && query.length >= 3) return 72 + (query.length / keyword.length) * 8;
  const direct = similarity(query, keyword);
  if (direct >= 0.62) return direct * 80;
  let tokenBest = 0;
  for (const queryToken of query.split(' ')) {
    for (const keywordToken of keyword.split(' ')) {
      if (!queryToken || !keywordToken) continue;
      const tokenScore = similarity(queryToken, keywordToken);
      if (tokenScore > tokenBest) tokenBest = tokenScore;
    }
  }
  return tokenBest >= 0.7 ? tokenBest * 76 : 0;
}

function buildIndex() {
  const entries = [];
  for (const product of products) {
    entries.push({
      type: 'product',
      id: product.id,
      title: product.title,
      name: product.name,
      route: `/keyboards/${product.id}`,
      keywords: [
        product.title,
        product.name,
        product.brand,
        `${product.brand} ${product.name}`,
        product.meta.category,
        product.meta.layoutGroup,
        ...product.meta.technologies,
        ...product.meta.switchTags,
        ...product.meta.tags,
      ],
    });
  }
  for (const brand of brands) {
    entries.push({
      type: 'brand',
      id: brand.id,
      title: brand.name,
      name: brand.name,
      route: `/brands/${brand.id}`,
      keywords: [brand.title, brand.name, brand.chinese, brand.group],
    });
  }
  for (const term of techTerms) {
    entries.push({
      type: 'tech',
      id: term.id,
      title: term.name,
      name: term.name,
      route: `/tech/${term.id}`,
      keywords: [term.name, term.category, term.name.replace(/[（(].*?[)）]/g, '')],
    });
  }
  for (const game of games) {
    entries.push({
      type: 'game',
      id: game.id,
      title: game.name,
      name: game.name,
      route: `/games/${game.id}`,
      keywords: [game.name, game.category],
    });
  }
  return entries;
}

const INDEX = buildIndex();
const TYPE_PRIORITY = { brand: 0, tech: 1, game: 2, product: 3 };

export function scoreQuery(query, entry) {
  const normalized = normalize(query);
  if (!normalized) return 0;
  let best = 0;
  let primaryScore = 0;
  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) continue;
    const score = scorePair(normalized, normalizedKeyword);
    if (score > best) best = score;
    if (normalizedKeyword === normalize(entry.title) || normalizedKeyword === normalize(entry.name)) {
      primaryScore = Math.max(primaryScore, score);
    }
  }
  if (primaryScore >= 55) best += 3;
  return best;
}

export function quickSuggest(query, limit = 6) {
  const normalized = normalize(query);
  if (normalized.length < 2) return { exact: [], fuzzy: [] };
  const scored = INDEX.map((entry) => ({ entry, score: scoreQuery(normalized, entry) }))
    .sort((a, b) => b.score - a.score || TYPE_PRIORITY[a.entry.type] - TYPE_PRIORITY[b.entry.type] || a.entry.title.localeCompare(b.entry.title, 'zh'));
  const exact = [];
  const fuzzy = [];
  for (const item of scored.sort((a, b) => b.score - a.score)) {
    const isExact = item.entry.keywords.some((keyword) => normalize(keyword) === normalized);
    if (isExact || item.score >= 92) {
      if (!exact.some((entry) => entry.entry.id === item.entry.id && entry.entry.type === item.entry.type)) {
        exact.push(item);
      }
    } else if (item.score >= 58) {
      if (!fuzzy.some((entry) => entry.entry.id === item.entry.id && entry.entry.type === item.entry.type)) {
        fuzzy.push(item);
      }
    }
    if (exact.length >= limit && fuzzy.length >= limit) break;
  }
  return {
    exact: exact.slice(0, limit),
    fuzzy: fuzzy.slice(0, limit),
  };
}

export function guessSuggestions(query, limit = 6) {
  const normalized = normalize(query);
  if (normalized.length < 2) return [];
  const scored = INDEX.map((entry) => ({ entry, score: scoreQuery(normalized, entry) }))
    .filter((item) => {
      if (item.score < 58) return false;
      return !item.entry.keywords.some((keyword) => normalize(keyword) === normalized);
    })
    .sort((a, b) => b.score - a.score || TYPE_PRIORITY[a.entry.type] - TYPE_PRIORITY[b.entry.type] || a.entry.title.localeCompare(b.entry.title, 'zh'));
  const seen = new Set();
  const result = [];
  for (const item of scored) {
    const key = `${item.entry.type}:${item.entry.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ ...item, kindLabel: kindLabel(item.entry.type) });
    if (result.length >= limit) break;
  }
  return result;
}

export function kindLabel(type) {
  const labels = {
    product: '产品',
    brand: '品牌',
    tech: '技术词条',
    game: '游戏',
  };
  return labels[type] || '条目';
}
