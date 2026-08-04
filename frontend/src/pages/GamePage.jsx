import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { PageHeader, StarRating, TagChip } from '../components/Ui';
import Markdown from '../components/Markdown';
import { gameById, productById } from '../lib/data';

export default function GamePage() {
  const { gameId } = useParams();
  const game = gameById.get(gameId);
  const [sortBy, setSortBy] = useState('brand');

  if (!game) {
    return (
      <div className="page container">
        <div className="empty-state">
          <div className="empty-title">未找到该游戏</div>
          <Link to="/games">返回游戏适配数据库</Link>
        </div>
      </div>
    );
  }

  const rows = game.related
    .map((item) => ({
      product: productById.get(item.productId),
      rating: item.rating,
      note: item.note,
    }))
    .filter((row) => row.product);
  const sortedRows = [...rows].sort((a, b) =>
    sortBy === 'rating'
      ? b.rating - a.rating
      : a.product.brand.localeCompare(b.product.brand, 'zh') || a.product.title.localeCompare(b.product.title, 'zh'),
  );

  return (
    <div className="page container">
      <Link className="back-link" to="/games"><ArrowLeft size={15} /> 游戏适配数据库</Link>
      <PageHeader
        eyebrow={`${game.category} · ${game.priority}`}
        title={game.name}
        description={game.description}
        actions={[
          <TagChip key="cat" tone="orange">{game.category}</TagChip>,
          <TagChip key="count">{game.related.length} 个适配产品</TagChip>,
        ]}
      />
      {game.content ? (
        <section className="wiki-section">
          <Markdown>{game.content}</Markdown>
        </section>
      ) : null}
      <div className="page-section">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">适配产品</div>
            <h2>产品评分与说明</h2>
          </div>
          <div className="section-head-actions">
            <span className="result-count">平均 {game.avg ? game.avg.toFixed(1) : '—'} / 5</span>
            <div className="sort-seg" role="group" aria-label="排序方式">
              <button type="button" className={sortBy === 'brand' ? 'is-active' : ''} onClick={() => setSortBy('brand')}>
                按品牌
              </button>
              <button type="button" className={sortBy === 'rating' ? 'is-active' : ''} onClick={() => setSortBy('rating')}>
                按评分
              </button>
            </div>
          </div>
        </div>
        {sortedRows.length > 0 ? (
          <div className="related-table">
            <div className="related-row is-head">
              <span>产品</span>
              <span>品牌</span>
              <span>适配评分</span>
              <span>说明</span>
            </div>
            {sortedRows.map((row) => (
              <Link className="related-row" to={`/keyboards/${row.product.id}`} key={row.product.id}>
                <span className="related-row-title">
                  {row.product.title} <ArrowUpRight size={14} />
                </span>
                <span>{row.product.brand}</span>
                <StarRating score={row.rating} size={12} />
                <span className="related-note">{row.note || '—'}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">该游戏的产品数据正在收集中。</p>
        )}
      </div>
    </div>
  );
}
