import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'src', 'data');

function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}

function writeJson(name, data) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 1), 'utf8');
}

function slugify(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[（）()]/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTable(md) {
  const lines = md.split(/\r?\n/).filter((line) => line.trim().startsWith('|'));
  if (lines.length < 2) return [];
  const rows = lines.map((line) => {
    const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    return trimmed.split('|').map((cell) => cell.trim().replace(/\\\|/g, '|'));
  });
  return rows.filter((row) => !row.every((cell) => /^:?-{2,}:?$/.test(cell.replace(/\s/g, ''))));
}

function splitTitle(title) {
  const match = title.match(/^(.+?)\s*[（(](.+?)[)）]\s*$/);
  if (match) return { name: match[1].trim(), chinese: match[2].trim() };
  return { name: title.trim(), chinese: '' };
}

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*\|.*$/gm, ' ')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerptOf(text, max = 180) {
  const clean = stripMarkdown(text);
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

function starsToScore(value) {
  if (!value) return 0;
  const numeric = value.match(/([\d.]+)\s*\/\s*5/);
  if (numeric) return Number(numeric[1]);
  const stars = (value.match(/★/g) || []).length;
  if (stars > 0) return stars;
  const plain = value.match(/([\d.]+)/);
  return plain ? Number(plain[1]) : 0;
}

function extractLabeledList(content, labelPattern) {
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (labelPattern.test(lines[i])) {
      let joined = lines[i].replace(labelPattern, '').replace(/\*\*/g, '').trim();
      if (!joined && i + 1 < lines.length) joined = lines[i + 1].trim();
      return joined
        .split(/[|、]/)
        .map((item) => item.trim().replace(/^#+\s*/, ''))
        .filter(Boolean);
    }
  }
  return [];
}

function categoryLabel(raw) {
  const text = raw || '';
  if (/磁|Magnetic|Hall/i.test(text)) return '磁轴';
  if (/光|Optical/i.test(text)) return '光轴';
  if (/TMR|混合|Hybrid/i.test(text)) return '混合';
  if (/机械|Mechanical/i.test(text)) return '机械';
  return '其他';
}

function layoutGroup(raw) {
  const text = raw || '';
  if (/60%/.test(text)) return '60%';
  if (/65%|68%/.test(text)) return '65%';
  if (/75%/.test(text)) return '75%';
  if (/98%|96%/.test(text)) return '98%';
  if (/TKL/.test(text)) return 'TKL';
  if (/全尺寸|Full/.test(text)) return '全尺寸';
  return '其他';
}

function parseHz(raw) {
  const match = (raw || '').match(/([\d.]+)\s*([kK]?)Hz/);
  if (!match) return 0;
  const value = Number(match[1]);
  return match[2] ? value * 1000 : value;
}

function pickField(fields, patterns) {
  const field = fields.find((f) => patterns.some((pattern) => f.label.includes(pattern)));
  return field ? field.value : '';
}

function pickSwitchField(fields) {
  const field = fields.find((f) => {
    const label = f.label;
    return (
      /轴体|Switch/.test(label) &&
      !/类型|Type|寿命|Lifespan|Plate|定位板|Puller|拔轴|Lubrication|润滑|Materials|材质|Hot|热插拔|收纳|Mount/.test(label)
    );
  });
  return field ? field.value : '';
}

const SWITCH_KEYWORDS = [
  { name: 'Lekker Tikken', patterns: ['Lekker Tikken'], parent: 'Lekker 磁轴' },
  { name: 'Lekker V2 磁轴', patterns: ['Lekker V2', 'Lekker L45 V2', 'Lekker L60 V2'], parent: 'Lekker 磁轴' },
  { name: 'Lekker 磁轴', patterns: ['Lekker'] },
  { name: 'Gateron KS-20 TMR 磁轴', patterns: ['Gateron KS-20'] },
  { name: 'TMR 磁轴', patterns: ['TMR 磁轴', 'TMR（穿隧磁阻）磁轴'] },
  { name: 'GX 机械轴', patterns: ['GX Red', 'GX Brown', 'GX Blue', 'GX 轴体', 'GX Mechanical'] },
  { name: 'Romer-G 机械轴', patterns: ['Romer-G'] },
  { name: 'Razer 类比式光轴', patterns: ['类比式光轴', 'Analog Optical'] },
  { name: 'Razer 机械轴 Gen-3', patterns: ['Razer 机械轴 Gen-3', 'Razer™ 机械轴 Gen-3'], parent: 'Razer 机械轴' },
  { name: 'Razer 机械轴', patterns: ['Razer 机械轴', 'Razer™ 机械轴', 'Razer Mechanical'] },
  { name: 'Razer 光学矮轴', patterns: ['光学矮轴', 'Low-Profile Optical'] },
  { name: 'OmniPoint 3.0 磁轴', patterns: ['OmniPoint 3.0'], parent: 'OmniPoint 磁轴' },
  { name: 'OmniPoint 磁轴', patterns: ['OmniPoint'] },
  { name: 'Hybrid Mechanical 混合机械轴', patterns: ['Hybrid Mechanical'] },
  { name: 'OptiPoint 光学开关', patterns: ['OptiPoint'] },
  { name: 'ROG HFX V2 磁轴', patterns: ['HFX V2', 'ROG HFX V2'], parent: 'ROG HFX 磁轴' },
  { name: 'ROG HFX 磁轴', patterns: ['ROG HFX', 'HFX 磁轴'] },
  { name: 'ROG NX 机械轴', patterns: ['ROG NX', 'NX 机械轴'] },
  { name: 'ROG RX 光轴', patterns: ['ROG RX', 'RX 光轴'] },
  { name: 'CORSAIR MGX 磁轴', patterns: ['MGX'] },
  { name: 'MLX Pulse 机械轴', patterns: ['MLX Pulse'] },
  { name: 'MLX Plasma 机械轴', patterns: ['MLX Plasma'] },
  { name: 'CORSAIR OPX 光轴', patterns: ['OPX'] },
  { name: 'CHERRY MX RGB 轴', patterns: ['CHERRY MX RGB'], parent: 'CHERRY MX 机械轴' },
  { name: 'CHERRY MX 机械轴', patterns: ['Cherry MX', 'CHERRY MX'] },
  { name: '火影磁轴', patterns: ['火影磁轴'] },
  { name: '狂暴磁轴', patterns: ['狂暴磁轴'] },
  { name: '宝马磁轴', patterns: ['宝马磁轴'] },
  { name: '冰玉磁轴', patterns: ['冰玉磁轴'] },
  { name: 'KTEK 磁轴', patterns: ['KTEK'] },
  { name: 'TTC 天王磁轴', patterns: ['天王磁轴'] },
  { name: '粉泰山磁轴 GT', patterns: ['粉泰山磁轴'], parent: '泰山磁轴 GT' },
  { name: '泰山磁轴 GT', patterns: ['泰山磁轴 GT', '泰山磁轴GT'] },
  { name: '北极星磁轴', patterns: ['北极星磁轴'] },
  { name: '磁悬浮轴', patterns: ['磁悬浮轴'] },
  { name: '混元轴', patterns: ['混元轴'] },
  { name: 'TTC 万磁王轴', patterns: ['TTC 万磁王轴'] },
  { name: '利维坦 Ultra 轴', patterns: ['利维坦'] },
  { name: '凯华×ATK 烈刃磁轴', patterns: ['烈刃磁轴'] },
  { name: '雪刃轴', patterns: ['雪刃轴'] },
  { name: '晶刃轴', patterns: ['晶刃轴'] },
  { name: '冰刃轴 PRO', patterns: ['冰刃轴'] },
  { name: '烈风 ULTRA 磁轴', patterns: ['烈风'] },
  { name: '凯华磁轴', patterns: ['凯华磁轴'] },
  { name: '星轨磁轴', patterns: ['星轨磁轴'] },
  { name: '磁玉轴 Pro', patterns: ['磁玉轴'] },
  { name: '神秘 X 轴 Ultra', patterns: ['神秘 X 轴', '神秘X轴'] },
  { name: '璞玉轴', patterns: ['璞玉轴'] },
  { name: 'Gateron Magnetic Jade', patterns: ['Magnetic Jade'] },
  { name: 'Gateron HE 磁轴', patterns: ['Gateron HE'] },
  { name: 'Keychron Apex 轴', patterns: ['Keychron Apex'] },
  { name: 'Keychron Silk POM 轴', patterns: ['Keychron Silk'] },
  { name: '极地狐轴', patterns: ['极地狐轴'] },
  { name: '冰川 Pro 轴', patterns: ['冰川Pro轴', '冰川 Pro'] },
  { name: '奶牛 Pro 轴', patterns: ['奶牛Pro轴'] },
  { name: '动力金 Pro 轴', patterns: ['动力金Pro轴'] },
  { name: '夜魔 Pro 轴', patterns: ['夜魔Pro轴'] },
  { name: '风信子 Pro 轴', patterns: ['风信子Pro轴'] },
  { name: '闪电金轴', patterns: ['闪电金轴'] },
  { name: '阿尼亚轴', patterns: ['阿尼亚轴'] },
  { name: '天霸磁轴', patterns: ['天霸磁轴', '天霸轴'] },
  { name: 'TTC 烈焰黄万磁王轴', patterns: ['烈焰黄万磁王轴'] },
  { name: '神启轴', patterns: ['神启轴'] },
  { name: '昆仑轴', patterns: ['昆仑轴'] },
  { name: '八宝库里南轴', patterns: ['八宝库里南'] },
  { name: '小青蛇万磁王轴', patterns: ['小青蛇万磁王'] },
  { name: '速冰轴', patterns: ['速冰轴'] },
];

function extractSwitchTags(product, switchText, specsContent, techContent) {
  const source = `${switchText}\n${specsContent}\n${techContent}`;
  const found = [];
  for (const item of SWITCH_KEYWORDS) {
    if (item.patterns.some((pattern) => source.includes(pattern))) found.push(item.name);
  }
  return [...new Set(found)];
}

function convertWikiLinks(content, products, brands) {
  const BRAND_ALIASES = {
    怒喵: 'Angry Miao',
    雷蛇: 'Razer',
    '罗技 G': 'Logitech G',
    赛睿: 'SteelSeries',
    海盗船: 'Corsair',
    艾泰克: 'ATK',
    渴创: 'Keychron',
    铝厂: 'IQUNIX',
    微技: 'VGN',
    极度未知: 'HyperX',
    '玩家国度': 'ASUS ROG',
  };
  const normalizeTerm = (term) => {
    for (const [alias, name] of Object.entries(BRAND_ALIASES)) {
      if (term.startsWith(alias)) return `${name}${term.slice(alias.length)}`.trim();
    }
    return term;
  };
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, target, label) => {
    const term = target.trim();
    const normalized = normalizeTerm(term);
    const foundBrand = brands.find((b) => b.name === term || b.title === term || b.name === normalized);
    if (foundBrand) return `[${label || term}](/brands/${foundBrand.id})`;
    const foundProduct = products.find((p) => {
      const title = `${p.brand} ${p.name}`.trim();
      return (
        title === normalized ||
        p.name === normalized ||
        (normalized.length > 4 && (title.includes(normalized) || normalized.includes(p.name)))
      );
    });
    if (foundProduct) return `[${label || term}](/keyboards/${foundProduct.id})`;
    return label || term;
  });
}

function parseProducts() {
  const lines = read('product.md').split(/\r?\n/);
  const brandMap = new Map();
  const products = [];
  let currentBrand = null;
  let currentProduct = null;
  let currentSection = null;
  let inProductTemplate = false;
  let productTemplateBuffer = [];

  const flushSection = () => {
    if (!currentProduct || !currentSection) return;
    const content = currentSection.content.trim();
    if (!content) return;
    currentProduct.sections.push({
      key: currentSection.key,
      title: currentSection.title,
      content,
    });
    currentSection = null;
  };

  const flushProduct = () => {
    flushSection();
    if (!currentProduct) return;
    currentProduct.title = currentProduct.name.startsWith(currentProduct.brand)
      ? currentProduct.name
      : `${currentProduct.brand} ${currentProduct.name}`.trim();
    currentProduct.id = `${slugify(currentProduct.brand)}--${slugify(currentProduct.name)}`;
    products.push(currentProduct);
    currentProduct = null;
  };

  for (const line of lines) {
    if (/^#\s+/.test(line)) {
      flushProduct();
      const name = line.replace(/^#\s+/, '').trim();
      if (name === '键盘型号参数库（Product Wiki）') {
        currentBrand = null;
        continue;
      }
      const id = slugify(name);
      if (!brandMap.has(id)) {
        brandMap.set(id, { id, name, products: [] });
      }
      currentBrand = brandMap.get(id);
    } else if (/^##\s+/.test(line)) {
      flushProduct();
      const name = line.replace(/^##\s+/, '').trim();
      if (name === '品牌索引（Index）' || name === 'Index' || !currentBrand) continue;
      currentProduct = { brand: currentBrand.name, brandId: currentBrand.id, name, sections: [] };
      inProductTemplate = false;
      productTemplateBuffer = [];
      currentBrand.products.push(currentProduct);
    } else if (/^\{\{Infobox/.test(line)) {
      flushSection();
      inProductTemplate = true;
      productTemplateBuffer = [];
    } else if (inProductTemplate && line.trim().startsWith('}}')) {
      inProductTemplate = false;
      if (currentProduct && productTemplateBuffer.length > 0) {
        currentProduct.sections.unshift({
          key: 'infobox',
          title: 'Infobox',
          content: productTemplateBuffer.join('\n'),
        });
      }
    } else if (inProductTemplate) {
      productTemplateBuffer.push(line);
    } else if (/^###\s+/.test(line)) {
      flushSection();
      if (!currentProduct) continue;
      const title = line.replace(/^###\s+/, '').trim();
      const key = /^infobox/i.test(title)
        ? 'infobox'
        : (title.match(/^(\d+)/) || [])[1] || slugify(title);
      currentSection = { key, title, content: '' };
    } else if (/^\d+\.\s+/.test(line) && currentProduct && currentProduct.plainHeadings) {
      flushSection();
      const title = line.trim();
      const key = (title.match(/^(\d+)/) || [])[1] || slugify(title);
      currentSection = { key, title, content: '' };
    } else if (/^\d+\.\s+/.test(line) && currentProduct && currentProduct.sections.every((s) => s.key === 'infobox')) {
      flushSection();
      currentProduct.plainHeadings = true;
      const title = line.trim();
      const key = (title.match(/^(\d+)/) || [])[1] || slugify(title);
      currentSection = { key, title, content: '' };
    } else if (currentSection) {
      currentSection.content += `${line}\n`;
    }
  }
  flushProduct();

  return products.map((product) => {
    const infobox = product.sections.find((s) => s.key === 'infobox');
    const infoboxRows = infobox ? parseTable(infobox.content) : [];
    const fields = infoboxRows
      .map((row) => {
        if (row.length === 1 && row[0].includes('=')) {
          const index = row[0].indexOf('=');
          return { label: row[0].slice(0, index).trim(), value: row[0].slice(index + 1).trim() };
        }
        return { label: row[0], value: row[1] };
      })
      .filter((field) => field.label && field.value);
    const categoryRaw = pickField(fields, ['类别', 'Category']);
    const layoutRaw = pickField(fields, ['配列', 'Layout']);
    const pollingRaw = pickField(fields, ['回报率', 'Polling Rate']);
    const gamesSection = product.sections.find((s) => /适配游戏|Compatible Games/.test(s.title));
    const ratingSection = product.sections.find((s) => /用户评分|User Rating/.test(s.title));
    const navSection = product.sections.find((s) => /页面导航|Navigation/.test(s.title));
    const overviewSection = product.sections.find((s) => /简介|Overview/.test(s.title));
    const specsSection = product.sections.find((s) => /规格参数|Specifications/.test(s.title));
    const techSection = product.sections.find((s) => /技术解析|Technology/.test(s.title));
    const games = gamesSection
      ? parseTable(gamesSection.content)
          .map((row) => ({
            name: row[1] ? row[1].replace(/\*/g, '').trim() : '',
            rating: starsToScore(row[0]),
            note: row[2] || '',
          }))
          .filter((g) => g.name && !/游戏|评级/.test(g.name))
      : [];
    const ratings = ratingSection
      ? parseTable(ratingSection.content)
          .map((row) => ({
            label: row[0] || '',
            score: starsToScore(row[1]),
            raw: row[1] || '',
            samples: row[2] || '',
          }))
          .filter((r) => r.label && r.score > 0)
      : [];
    const overall =
      ratings.length > 0
        ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 100) / 100
        : 0;
    const technologies = navSection ? extractLabeledList(navSection.content, /Technologies\s*[:：]/) : [];
    const tags = navSection ? extractLabeledList(navSection.content, /Tags\s*[:：]/) : [];
    const categories = navSection ? extractLabeledList(navSection.content, /Categories\s*[:：]/) : [];
    const switchText = pickSwitchField(fields);
    const switchTags = extractSwitchTags(product, switchText, specsSection ? specsSection.content : '', techSection ? techSection.content : '');
    const allContent = product.sections.map((s) => s.content).join('\n');

    return {
      ...product,
      sections: product.sections,
      infobox: fields,
      excerpt: overviewSection ? excerptOf(overviewSection.content) : '',
      meta: {
        category: categoryLabel(categoryRaw),
        categoryRaw,
        layout: layoutRaw,
        layoutGroup: layoutGroup(layoutRaw),
        switchText,
        switchTags,
        pollingHz: parseHz(pollingRaw) || parseHz(specsSection ? specsSection.content : ''),
        pollingText: pollingRaw || '',
        release: pickField(fields, ['发布日期', 'Release Date']),
        connection: pickField(fields, ['连接方式', 'Connection']),
        price: pickField(fields, ['建议零售价', 'MSRP']),
        discontinued: pickField(fields, ['是否停产', 'Discontinued']),
        software: pickField(fields, ['配置软件', 'Software']),
        games,
        ratings,
        overall,
        technologies,
        tags,
        categories,
      },
      searchText: `${product.brand} ${product.name} ${product.excerpt} ${technologies.join(' ')} ${tags.join(' ')} ${switchTags.join(' ')}`.toLowerCase(),
      containsText: allContent,
    };
  });
}

function parseBrands() {
  const lines = read('brand.md').split(/\r?\n/);
  const brands = [];
  let currentBrand = null;
  let currentSection = null;
  let inYaml = false;
  let inTemplate = false;
  let yamlBuffer = [];

  const flushSection = () => {
    if (!currentBrand || !currentSection) return;
    const content = currentSection.content.trim();
    if (!content) return;
    currentBrand.sections.push({ key: currentSection.key, title: currentSection.title, content });
    currentSection = null;
  };

  const flushBrand = () => {
    flushSection();
    if (!currentBrand) return;
    currentBrand.yamlLines = [...yamlBuffer];
    brands.push(currentBrand);
    currentBrand = null;
  };

  for (const line of lines) {
    if (/^```yaml/.test(line)) {
      inYaml = true;
      inTemplate = false;
      yamlBuffer = [];
      continue;
    }
    if (inYaml && /^```/.test(line)) {
      inYaml = false;
      continue;
    }
    if (/^\{\{Infobox/.test(line)) {
      inTemplate = true;
      inYaml = false;
      yamlBuffer = [];
      continue;
    }
    if (inTemplate && /^\}\}/.test(line)) {
      inTemplate = false;
      continue;
    }
    if (inYaml || inTemplate) {
      yamlBuffer.push(line);
      continue;
    }
    if (/^#\s+/.test(line)) {
      flushBrand();
      yamlBuffer = [];
      inYaml = false;
      inTemplate = false;
      const title = line.replace(/^#\s+/, '').trim();
      if (title === '键盘品牌百科 (Brand Wiki)' || /^目录/.test(title)) {
        currentBrand = null;
        continue;
      }
      const parsed = splitTitle(title);
      currentBrand = {
        id: slugify(parsed.name),
        title,
        name: parsed.name,
        chinese: parsed.chinese,
        infobox: [],
        sections: [],
      };
    } else if (/^##\s+/.test(line)) {
      flushSection();
      if (!currentBrand) continue;
      const title = line.replace(/^##\s+/, '').trim();
      currentSection = { key: (title.match(/^(\d+)/) || [])[1] || slugify(title), title, content: '' };
    } else if (currentSection) {
      currentSection.content += `${line}\n`;
    }
  }
  flushBrand();

  const yamlOf = (brand) => {
    if (!brand || brand.yamlLines.length === 0) return {};
    const info = {};
    for (const rawLine of brand.yamlLines) {
      const line = rawLine.trim().replace(/^\|/, '').trim();
      const sepIndex = line.indexOf('=') >= 0 ? line.indexOf('=') : line.indexOf(':');
      if (sepIndex <= 0) continue;
      const key = line.slice(0, sepIndex).trim();
      let value = line.slice(sepIndex + 1).trim();
      value = value.replace(/^["']/, '').replace(/["']$/, '');
      if (key && value) info[key] = value;
    }
    return info;
  };

  return brands.map((brand) => {
    const info = yamlOf(brand);
    const overview = brand.sections.find((s) => /品牌概述|Overview/.test(s.title));
    const techSection = brand.sections.find((s) => /核心技术|Key Technologies/.test(s.title));
    const esportsSection = brand.sections.find((s) => /赛事影响力|Esports Presence/.test(s.title));
    const coreTech = [];
    if (techSection) {
      for (const line of techSection.content.split(/\r?\n/)) {
        const match = line.match(/^###\s+(.+)$/);
        if (match) coreTech.push(match[1].trim());
      }
    }
    const esportsTables = esportsSection ? parseTable(esportsSection.content) : [];
    return {
      ...brand,
      info: {
        founded: info.Founded || '',
        country: info.Country || '',
        category: info.Category || '',
        website: info.Website || '',
        slogan: info.Slogan || '',
        parent: info.Parent || '',
      },
      excerpt: overview ? excerptOf(overview.content) : '',
      coreTech,
      esportsRows: esportsTables,
      sections: brand.sections,
      searchText: `${brand.title} ${brand.chinese} ${brand.excerpt} ${coreTech.join(' ')}`.toLowerCase(),
    };
  });
}

function buildTechTerms(products) {
  const seeds = [
    { id: 'rapid-trigger', name: 'Rapid Trigger', category: '输入技术', priority: 'P0', description: '将按键触发与重置绑定到动态行程，手指开始抬起即完成重置，实现极速连续触发，是磁轴键盘的核心竞技功能。', keywords: ['Rapid Trigger', '快速触发', 'RT'] },
    { id: 'hall-effect', name: 'Hall Effect（霍尔效应）', category: '轴体技术', priority: 'P0', description: '通过磁铁与霍尔传感器实现非接触触发，可感知完整按键行程并输出模拟信号，是磁轴键盘的技术基础。', keywords: ['Hall Effect', '霍尔效应', '磁轴', 'Magnetic', 'Lekker', 'OmniPoint', 'HFX', 'MGX'] },
    { id: 'socd', name: 'SOCD', category: '输入技术', priority: 'P0', description: '处理相反方向按键同时输入时的冲突，支持 Last Input Wins 等策略，帮助 FPS 玩家实现更稳定的急停操作。', keywords: ['SOCD', 'Snap Tap', 'Rapid Tap', 'FlashTap'] },
    { id: 'snap-tap', name: 'Snap Tap', category: '输入技术', priority: 'P1', description: 'Razer 的相反按键冲突处理方案，自动优先最近一次按下的方向输入，减少急停失误。', keywords: ['Snap Tap', 'Rapid Tap', 'Razer'] },
    { id: 'omni-point', name: 'OmniPoint', category: '轴体技术', priority: 'P1', description: 'SteelSeries 的可调磁轴方案，支持逐键调节触发点与双重触发功能。', keywords: ['OmniPoint', 'Apex Pro'] },
    { id: 'lightspeed', name: 'LIGHTSPEED', category: '无线技术', priority: 'P1', description: 'Logitech G 的低延迟 2.4GHz 无线传输技术，主打接近有线的稳定性与响应速度。', keywords: ['LIGHTSPEED', 'Logitech G'] },
    { id: 'gasket-mount', name: 'Gasket Mount', category: '结构设计', priority: 'P1', description: '通过硅胶/泡棉垫片悬浮固定定位板，让敲击手感更柔和、声音更均匀，是量产客制化键盘的主流结构。', keywords: ['Gasket', '结构'] },
    { id: 'hot-swap', name: 'Hot Swap（热插拔）', category: '结构设计', priority: 'P2', description: '无需焊接即可更换轴体，降低客制化门槛并延长键盘寿命。', keywords: ['Hot Swap', '热插拔'] },
    { id: 'analog-input', name: '模拟输入', category: '输入技术', priority: 'P2', description: '依据按键行程输出连续模拟信号，可实现赛车油门、动态键程等传统数字开关无法实现的操作。', keywords: ['模拟输入', 'Analog Input', 'DKS'] },
    { id: 'nkro', name: 'NKRO 全键无冲', category: '性能参数', priority: 'P2', description: '任意数量按键同时按下均可被正确识别，避免组合键冲突。', keywords: ['NKRO', '全键无冲'] },
    { id: 'high-polling', name: '高回报率（8KHz+）', category: '性能参数', priority: 'P2', description: '回报率越高，键盘向电脑报告输入的频率越高，理论输入延迟越低；8KHz 已逐渐成为电竞键盘高端配置。', keywords: ['8KHz', '8000Hz', '16KHz', '8K Hz', '回报率'] },
  ];
  return seeds.map((term) => {
    const related = products
      .filter((p) => term.keywords.some((kw) => p.containsText.includes(kw)))
      .map((p) => ({ id: p.id, title: p.title, brand: p.brand, category: p.meta.category, overall: p.meta.overall }));
    return { ...term, related };
  });
}

function buildGames(products) {
  const seeds = [
    { id: 'valorant', name: 'Valorant', category: 'FPS', priority: 'P0', description: 'FPS 代表作，职业选手设备数据丰富；Rapid Trigger 与急停优化在该游戏中的收益最直观。' },
    { id: 'cs2', name: 'Counter-Strike 2', category: 'FPS', priority: 'P0', description: 'FPS 代表作，急停、连射与身法操作高度依赖键盘重置速度，磁轴键盘在职业赛场渗透率持续上升。' },
    { id: 'apex-legends', name: 'Apex Legends', category: 'FPS', priority: 'P1', description: '快速移动与连射对键盘响应有一定要求，但对键盘专用功能的依赖低于 Valorant / CS2。' },
    { id: 'league-of-legends', name: 'League of Legends', category: 'MOBA', priority: 'P1', description: 'MOBA 代表作，技能输入与宏指令更受关注，配列和快捷键布局比极限响应速度更重要。' },
    { id: 'fortnite', name: 'Fortnite', category: '竞技游戏', priority: 'P2', description: '快速建造与切换结构需要高频按键，部分玩家使用 SOCD 类功能辅助操作。' },
    { id: 'overwatch-2', name: 'Overwatch 2', category: 'FPS', priority: 'P2', description: '英雄切换与技能响应受益于低延迟键盘，但操作组合相对有限。' },
    { id: 'dota-2', name: 'Dota 2', category: 'MOBA', priority: 'P2', description: '大量快捷键与编队操作对配列完整度要求较高。' },
    { id: 'osu', name: 'Osu!', category: '音游', priority: 'P2', description: '极低延迟与快速连击能力是核心诉求，全键无冲和稳定触发同样重要。' },
    { id: 'world-of-warcraft', name: 'World of Warcraft', category: 'MMO', priority: 'P2', description: '宏键、数字键区与功能键对 MMO 体验影响明显。' },
    { id: 'starcraft-ii', name: 'StarCraft II', category: 'RTS', priority: 'P2', description: '高频编队与快捷键操作对配列完整度和按键寿命要求较高。' },
  ];
  return seeds.map((game) => {
    const matches = products.flatMap((p) =>
      p.meta.games
        .filter((g) => g.name.toLowerCase().includes(game.name.toLowerCase()))
        .map((g) => ({ productId: p.id, title: p.title, brand: p.brand, rating: g.rating, note: g.note, category: p.meta.category })),
    );
    const related =
      matches.length > 0
        ? matches
        : products
            .filter((p) => p.containsText.toLowerCase().includes(game.name.toLowerCase()))
            .map((p) => ({ productId: p.id, title: p.title, brand: p.brand, rating: p.meta.overall, note: '内容关联', category: p.meta.category }));
    const avg = related.length
      ? Math.round((related.reduce((sum, r) => sum + r.rating, 0) / related.length) * 100) / 100
      : 0;
    return { ...game, related, avg };
  });
}

function buildRankings(products) {
  const pick = (matchLabels) =>
    products
      .map((p) => {
        const found = p.meta.ratings.find((r) => matchLabels.some((label) => r.label.includes(label)));
        const score = found ? found.score : p.meta.overall;
        return { id: p.id, title: p.title, brand: p.brand, score, label: found ? found.label : '综合' };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  return {
    fps: pick(['FPS', 'Competitive']),
    moba: pick(['MOBA']),
    value: pick(['Value', '性价比']),
    updated: '2026-08-02',
    note: '排名基于产品页「用户评分」表格中的公开评分汇总，仅作参考。',
  };
}

function buildEsports(brands) {
  return brands
    .map((brand) => ({
      id: brand.id,
      title: brand.title,
      name: brand.name,
      chinese: brand.chinese,
      rows: brand.esportsRows,
      hasData: brand.esportsRows.length > 0,
    }))
    .filter((b) => b.hasData);
}

const products = parseProducts();
const brands = parseBrands();
const techTerms = buildTechTerms(products);
const games = buildGames(products);
const rankings = buildRankings(products);
const esports = buildEsports(brands);

const curatedBrands = [
  {
    id: 'razer',
    name: 'Razer',
    chinese: '雷蛇',
    title: 'Razer（雷蛇）',
    group: '国际品牌',
    info: { founded: '2005 年', country: '新加坡 / 美国', category: '游戏外设 / 电竞装备', website: 'https://www.razer.com', slogan: 'For Gamers. By Gamers.', parent: '' },
    excerpt: '雷蛇是全球知名游戏外设品牌，在键盘领域布局光轴与磁轴技术，旗下 Huntsman 系列采用类比式光轴，并推出 Snap Tap 等竞技输入功能。',
    coreTech: ['类比式光轴（Analog Optical）', 'Snap Tap', 'Rapid Trigger', 'Chroma RGB 生态', 'Synapse 软件'],
    esportsRows: [],
    sections: [],
    searchText: 'razer 雷蛇 光轴 snap tap chroma rgb 游戏外设',
    sourceNote: '资料整理中，详细品牌档案待补充。',
  },
  {
    id: 'logitech-g',
    name: 'Logitech G',
    chinese: '罗技 G',
    title: 'Logitech G（罗技 G）',
    group: '国际品牌',
    info: { founded: '2013 年', country: '瑞士 / 美国', category: '游戏外设 / 电竞装备', website: 'https://www.logitechg.com', slogan: 'Game. Set. Life.', parent: 'Logitech 罗技' },
    excerpt: 'Logitech G 是罗技旗下的游戏装备品牌，以 LIGHTSPEED 低延迟无线技术闻名，键盘产品覆盖无线机械轴与 TMR 混合轴路线。',
    coreTech: ['LIGHTSPEED 无线技术', 'TMR 混合轴', 'G HUB 软件'],
    esportsRows: [],
    sections: [],
    searchText: 'logitech g 罗技 g lightspeed 无线 机械键盘',
    sourceNote: '资料整理中，详细品牌档案待补充。',
  },
  {
    id: 'dry-studio',
    name: 'DRY STUDIO',
    chinese: '',
    title: 'DRY STUDIO',
    group: '国产品牌',
    info: { founded: '', country: '中国', category: '怒喵子品牌 / 高端客制化键盘', website: '', slogan: '', parent: 'Angry Miao 怒喵' },
    excerpt: 'DRY STUDIO 是怒喵（Angry Miao）旗下子品牌，主打超跑设计语言的客制化键盘，代表作包括 Black Diamond 75 V2。',
    coreTech: ['超跑设计语言', '三模无线', '客制化结构'],
    esportsRows: [],
    sections: [],
    searchText: 'dry studio 怒喵子品牌 black diamond 客制化',
    sourceNote: '资料整理中，详细品牌档案待补充。',
  },
];

const brandList = brands.map((b) => ({
  ...b,
  group: ['Wooting', 'Razer', 'Logitech G', 'SteelSeries', 'Corsair', 'HyperX', 'ASUS ROG'].includes(b.name) ? '国际品牌' : '国产品牌',
}));

const fullBrands = [
  ...brandList.map((b) => {
    const curated = curatedBrands.find((c) => c.id === b.id);
    return curated ? { ...b, ...curated, coreTech: b.coreTech.length ? b.coreTech : curated.coreTech } : b;
  }),
  ...curatedBrands.filter((c) => !brandList.some((b) => b.id === c.id)),
];

const findProduct = (term) => {
  for (const p of products) {
    const title = `${p.brand} ${p.name}`.trim();
    if (title === term || p.name === term) return p;
  }
  for (const p of products) {
    const title = `${p.brand} ${p.name}`.trim();
    if (term.length > 4 && (title.includes(term) || term.includes(p.name))) return p;
  }
  return null;
};

const findBrand = (term) =>
  fullBrands.find((b) => b.title === term || b.name === term || (term.length > 3 && term.includes(b.name)));

for (const p of products) {
  p.sections = p.sections.map((s) => ({
    ...s,
    content: convertWikiLinks(s.content, products, fullBrands),
  }));
  p.containsText = p.sections.map((s) => s.content).join('\n');
}

for (const b of fullBrands) {
  b.sections = b.sections.map((s) => ({
    ...s,
    content: convertWikiLinks(s.content, products, fullBrands),
  }));
  delete b.yamlLines;
}

for (const brand of fullBrands) {
  brand.productCount = products.filter((p) => p.brandId === brand.id).length;
  brand.products = products.filter((p) => p.brandId === brand.id).map((p) => ({
    id: p.id,
    title: p.title,
    name: p.name,
    category: p.meta.category,
    layoutGroup: p.meta.layoutGroup,
    overall: p.meta.overall,
    pollingHz: p.meta.pollingHz,
  }));
}

const dryStudio = fullBrands.find((b) => b.id === 'dry-studio');
if (dryStudio) {
  dryStudio.products = products
    .filter((p) => p.title.toLowerCase().includes('dry studio'))
    .map((p) => ({
      id: p.id,
      title: p.title,
      name: p.name,
      category: p.meta.category,
      layoutGroup: p.meta.layoutGroup,
      overall: p.meta.overall,
      pollingHz: p.meta.pollingHz,
    }));
  dryStudio.productCount = dryStudio.products.length;
}

for (const p of products) {
  delete p.plainHeadings;
  delete p.containsText;
}

const meta = {
  siteName: 'Game Keyboard Wiki',
  siteSlogan: '游戏键盘百科数据库',
  lastUpdated: '2026-08-02',
  stats: {
    brands: fullBrands.length,
    products: products.length,
    techTerms: techTerms.length,
    games: games.length,
    pages: fullBrands.length + products.length + techTerms.length + games.length + 8,
  },
  recentUpdates: [
    { date: '2026-08-02', text: '站点架构设计与 4 种页面模板完成' },
    { date: '2026-08-02', text: `完成 ${fullBrands.length} 个品牌档案页面` },
    { date: '2026-08-02', text: `完成 ${products.length} 个产品 / 系列页面` },
    { date: '2026-08-02', text: '首页搭建完成，总页面数突破 55 个' },
  ],
  milestones: [
    { date: '2026-08-02', text: '站点架构设计完成' },
    { date: '2026-08-02', text: '4 种页面模板设计完成' },
    { date: '2026-08-02', text: '首页搭建完成' },
    { date: '2026-08-02', text: '14 个品牌页面完成' },
    { date: '2026-08-02', text: '41 个产品 / 系列页面完成' },
    { date: '2026-08-02', text: '总页面数突破 55 个' },
  ],
  hotTags: ['Rapid Trigger', 'Hall Effect', 'SOCD', '磁轴', '8KHz', 'Gasket', '热插拔', '无线', '60%', 'TKL', '客制化', 'FPS'],
  sourceFiles: ['brand.md', 'product.md', '工作报告.md'],
};

writeJson('brands.json', fullBrands);
writeJson('products.json', products);
writeJson('tech.json', techTerms);
writeJson('games.json', games);
writeJson('rankings.json', rankings);
writeJson('esports.json', esports);
writeJson('meta.json', meta);

console.log(
  `brands=${fullBrands.length} products=${products.length} tech=${techTerms.length} games=${games.length} esports=${esports.length}`,
);
