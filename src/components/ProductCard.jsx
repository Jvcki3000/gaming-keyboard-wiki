import { Link } from 'react-router-dom';
import { ArrowUpRight, Scale } from 'lucide-react';
import KeyboardVisual from './KeyboardVisual';
import { StarRating, TagChip } from './Ui';
import { categoryColor, formatHz } from '../lib/data';
import { useCompare } from '../lib/CompareContext';

export default function ProductCard({ product }) {
  const { ids, toggle } = useCompare();
  const inCompare = ids.includes(product.id);
  return (
    <article className="product-card">
      <Link className="product-card-visual" to={`/keyboards/${product.id}`} aria-label={product.title}>
        <KeyboardVisual layout={product.meta.layoutGroup} />
        <span className={`category-badge cat-${categoryColor(product.meta.category)}`}>{product.meta.category}</span>
      </Link>
      <div className="product-card-body">
        <div className="product-card-top">
          <div>
            <Link className="product-card-title" to={`/keyboards/${product.id}`}>
              {product.title}
            </Link>
            <div className="product-card-brand">{product.brand}</div>
          </div>
          <button
            type="button"
            className={`compare-toggle${inCompare ? ' is-active' : ''}`}
            onClick={() => toggle(product.id)}
            aria-label={inCompare ? '移出对比' : '加入对比'}
            title={inCompare ? '移出对比' : '加入对比'}
          >
            <Scale size={15} />
          </button>
        </div>
        <div className="product-card-meta">
          <TagChip>{product.meta.layoutGroup}</TagChip>
          <TagChip tone="orange">{formatHz(product.meta.pollingHz)}</TagChip>
          {product.meta.switchText ? <span className="product-switch" title={product.meta.switchText}>{product.meta.switchText}</span> : null}
        </div>
        {product.excerpt ? <p className="product-card-excerpt">{product.excerpt}</p> : null}
        <div className="product-card-foot">
          <StarRating score={product.meta.overall} />
          <Link className="text-link" to={`/keyboards/${product.id}`}>
            查看详情 <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
