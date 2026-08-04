import brandsData from '../data/brands.json';
import productsData from '../data/products.json';
import techData from '../data/tech.json';
import gamesData from '../data/games.json';
import rankingsData from '../data/rankings.json';
import esportsData from '../data/esports.json';
import metaData from '../data/meta.json';

export const brands = brandsData;
export const products = productsData;
export const techTerms = techData;
export const games = gamesData;
export const rankings = rankingsData;
export const esports = esportsData;
export const meta = metaData;

export const brandById = new Map(brands.map((brand) => [brand.id, brand]));
export const productById = new Map(products.map((product) => [product.id, product]));
export const techById = new Map(techTerms.map((term) => [term.id, term]));
export const gameById = new Map(games.map((game) => [game.id, game]));

export function formatHz(hz) {
  if (!hz) return '—';
  if (hz >= 1000) {
    const value = hz / 1000;
    return `${Number.isInteger(value) ? value : value.toFixed(1)}KHz`;
  }
  return `${hz}Hz`;
}

export function slugify(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[（）()]/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function categoryColor(category) {
  const map = {
    磁轴: 'orange',
    光轴: 'blue',
    机械: 'green',
    混合: 'purple',
    其他: 'gray',
  };
  return map[category] || 'gray';
}

export function featuredProducts() {
  const picks = [
    'wooting--wooting-60he',
    'asus-rog--rog-夜魔-extreme',
    'steelseries--steelseries-apex-pro-gen-3',
    'razer--razer-huntsman-v3-pro-tkl',
    'atk--atk-rs7-turbo',
    'mchose--mchose-ace-68-turbo',
  ];
  return picks.map((id) => productById.get(id)).filter(Boolean);
}
