import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PageHeader, EmptyState } from '../components/Ui';
import { brands, products } from '../lib/data';

const CATEGORIES = ['磁轴', '光轴', '机械', '混合'];
const LAYOUTS = ['60%', '65%', '75%', 'TKL', '98%', '全尺寸'];

export default function KeyboardsIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const category = searchParams.get('category') || '';
  const layout = searchParams.get('layout') || '';
  const brand = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || 'default';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const list = products.filter((product) => {
      if (category && product.meta.category !== category) return false;
      if (layout && product.meta.layoutGroup !== layout) return false;
      if (brand && product.brand !== brand) return false;
      if (keyword) {
        const haystack = `${product.title} ${product.brand} ${product.excerpt} ${product.meta.technologies.join(' ')} ${product.meta.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
    const sorted = [...list];
    if (sort === 'rating') sorted.sort((a, b) => b.meta.overall - a.meta.overall);
    if (sort === 'polling') sorted.sort((a, b) => b.meta.pollingHz - a.meta.pollingHz);
    if (sort === 'name') sorted.sort((a, b) => a.title.localeCompare(b.title, 'zh'));
    return sorted;
  }, [query, category, layout, brand, sort]);

  const activeFilters = [
    category && { key: 'category', label: category },
    layout && { key: 'layout', label: layout },
    brand && { key: 'brand', label: brand },
  ].filter(Boolean);

  return (
    <div className="page container">
      <PageHeader
        eyebrow="键盘数据库"
        title="游戏键盘型号库"
        description="按轴体类型、配列和品牌筛选游戏键盘，快速定位磁轴、光轴与机械轴产品。"
      />

      <div className="filter-panel">
        <div className="filter-panel-head">
          <div className="filter-title"><SlidersHorizontal size={16} /> 筛选器</div>
          <button type="button" className="text-link" onClick={() => { setQuery(''); setSearchParams({}, { replace: true }); }}>
            重置全部
          </button>
        </div>
        <div className="filter-grid">
          <label className="filter-field">
            <span>关键词</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入型号或技术关键词"
            />
          </label>
          <label className="filter-field">
            <span>轴体类型</span>
            <select value={category} onChange={(event) => updateParam('category', event.target.value)}>
              <option value="">全部</option>
              {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>配列</span>
            <select value={layout} onChange={(event) => updateParam('layout', event.target.value)}>
              <option value="">全部</option>
              {LAYOUTS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>品牌</span>
            <select value={brand} onChange={(event) => updateParam('brand', event.target.value)}>
              <option value="">全部</option>
              {brands.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>排序</span>
            <select value={sort} onChange={(event) => updateParam('sort', event.target.value)}>
              <option value="default">默认顺序</option>
              <option value="rating">综合评分</option>
              <option value="polling">回报率</option>
              <option value="name">名称</option>
            </select>
          </label>
        </div>
        {activeFilters.length > 0 ? (
          <div className="active-filters">
            {activeFilters.map((filter) => (
              <button type="button" key={filter.key} onClick={() => updateParam(filter.key, '')}>
                {filter.label} <X size={13} />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="result-bar">
        <span>共 {filtered.length} 个产品 / 系列</span>
        {query ? <span>关键词“{query}”</span> : null}
      </div>

      {filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <EmptyState title="没有匹配的产品" description="尝试放宽筛选条件或更换关键词。" />
      )}
    </div>
  );
}
