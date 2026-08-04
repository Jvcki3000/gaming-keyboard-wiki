import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Trash2, X } from 'lucide-react';
import KeyboardVisual from '../components/KeyboardVisual';
import { EmptyState, StarRating, TagChip } from '../components/Ui';
import { formatHz, productById, products } from '../lib/data';
import { useCompare } from '../lib/CompareContext';

export default function ComparePage() {
  const { ids, toggle, clear } = useCompare();
  const [query, setQuery] = useState('');
  const selected = ids.map((id) => productById.get(id)).filter(Boolean);
  const candidates = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return products.filter((product) => {
      if (!keyword) return true;
      return `${product.title} ${product.brand} ${product.meta.category}`.toLowerCase().includes(keyword);
    });
  }, [query]);

  const rows = [
    { label: '品牌', get: (p) => p.brand },
    { label: '类别', get: (p) => p.meta.category },
    { label: '配列', get: (p) => p.meta.layout },
    { label: '轴体', get: (p) => p.meta.switchText },
    { label: '回报率', get: (p) => formatHz(p.meta.pollingHz) },
    { label: '连接方式', get: (p) => p.meta.connection },
    { label: '建议零售价', get: (p) => p.meta.price },
    { label: '发布日期', get: (p) => p.meta.release },
    { label: '综合评分', get: (p) => (p.meta.overall ? p.meta.overall.toFixed(1) : '—') },
    { label: '技术标签', get: (p) => p.meta.technologies.join(' · ') },
  ];

  return (
    <div className="page container">
      <Link className="back-link" to="/keyboards"><ArrowLeft size={15} /> 键盘数据库</Link>
      <div className="compare-head">
        <div>
          <div className="eyebrow">对比工具</div>
          <h1>产品横向对比</h1>
          <p>从候选列表选择最多 4 款产品，参数将并排展示。</p>
        </div>
        {selected.length > 0 ? (
          <button type="button" className="btn btn-ghost" onClick={clear}>
            <Trash2 size={15} /> 清空对比
          </button>
        ) : null}
      </div>

      <div className="compare-layout">
        <aside className="compare-picker">
          <div className="compare-picker-head">
            <span className="compare-picker-count">{selected.length} / 4</span>
            <Scale size={16} />
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="筛选产品…"
            className="compare-search"
          />
          <div className="compare-picker-list">
            {candidates.map((product) => {
              const active = ids.includes(product.id);
              const disabled = !active && ids.length >= 4;
              return (
                <button
                  type="button"
                  key={product.id}
                  className={`compare-picker-item${active ? ' is-active' : ''}`}
                  disabled={disabled}
                  onClick={() => toggle(product.id)}
                >
                  <span className="compare-check">{active ? '✓' : ''}</span>
                  <span className="compare-picker-name">{product.title}</span>
                  <span className="compare-picker-meta">{product.meta.category} · {product.meta.layoutGroup}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="compare-table-wrap">
          {selected.length > 0 ? (
            <div className="table-scroll">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="compare-label-col">参数</th>
                    {selected.map((product) => (
                      <th key={product.id}>
                        <div className="compare-th">
                          <Link to={`/keyboards/${product.id}`}>{product.title}</Link>
                          <button
                            type="button"
                            onClick={() => toggle(product.id)}
                            aria-label={`移除 ${product.title}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="compare-label-col">配列示意</th>
                    {selected.map((product) => (
                      <td key={product.id}>
                        <KeyboardVisual layout={product.meta.layoutGroup} />
                      </td>
                    ))}
                  </tr>
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <th className="compare-label-col">{row.label}</th>
                      {selected.map((product) => (
                        <td key={product.id}>{row.get(product) || '—'}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th className="compare-label-col">评分</th>
                    {selected.map((product) => (
                      <td key={product.id}><StarRating score={product.meta.overall} /></td>
                    ))}
                  </tr>
                  <tr>
                    <th className="compare-label-col">标签</th>
                    {selected.map((product) => (
                      <td key={product.id}>
                        <div className="compare-tags">
                          {product.meta.technologies.slice(0, 4).map((tech) => <TagChip key={tech}>{tech}</TagChip>)}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="尚未选择产品" description="在左侧列表中勾选最多 4 款产品开始对比。" />
          )}
        </div>
      </div>
    </div>
  );
}
