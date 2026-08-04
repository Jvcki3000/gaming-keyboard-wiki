import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { PageHeader, StarRating, TagChip } from '../components/Ui';
import { productById, techById } from '../lib/data';

export default function TechPage() {
  const { termId } = useParams();
  const term = techById.get(termId);

  if (!term) {
    return (
      <div className="page container">
        <div className="empty-state">
          <div className="empty-title">未找到该词条</div>
          <Link to="/tech">返回技术百科</Link>
        </div>
      </div>
    );
  }

  const products = term.related.map((item) => productById.get(item.id)).filter(Boolean);
  return (
    <div className="page container">
      <Link className="back-link" to="/tech"><ArrowLeft size={15} /> 技术百科</Link>
      <PageHeader
        eyebrow={`${term.category} · ${term.priority}`}
        title={term.name}
        description={term.description}
        actions={<TagChip tone="orange">{term.category}</TagChip>}
      />
      <div className="page-section">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">关联产品</div>
            <h2>支持该技术的产品</h2>
          </div>
          <span className="result-count">{term.related.length} 个</span>
        </div>
        {products.length > 0 ? (
          <div className="related-table">
            {products.map((product) => (
              <Link className="related-row" to={`/keyboards/${product.id}`} key={product.id}>
                <span className="related-row-title">
                  {product.title} <ArrowUpRight size={14} />
                </span>
                <span>{product.brand}</span>
                <span>{product.meta.category}</span>
                <StarRating score={product.meta.overall} size={12} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">暂未关联到产品页面，词条资料完善中。</p>
        )}
      </div>
    </div>
  );
}
