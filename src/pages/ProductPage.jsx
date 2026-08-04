import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Scale, Share2 } from 'lucide-react';
import Markdown from '../components/Markdown';
import KeyboardVisual from '../components/KeyboardVisual';
import { StarRating, TagChip } from '../components/Ui';
import { brandById, categoryColor, formatHz, productById, slugify } from '../lib/data';
import { useCompare } from '../lib/CompareContext';

export default function ProductPage() {
  const { productId } = useParams();
  const product = productById.get(productId);
  const { ids, toggle } = useCompare();

  if (!product) {
    return (
      <div className="page container">
        <div className="empty-state">
          <div className="empty-title">未找到该产品</div>
          <Link to="/keyboards">返回键盘数据库</Link>
        </div>
      </div>
    );
  }

  const brand = brandById.get(product.brandId);
  const contentSections = product.sections.filter((section) => section.key !== 'infobox');
  const infobox = product.infobox;
  const brandProducts = (brand?.products || []).map((item) => productById.get(item.id)).filter(Boolean);
  const index = brandProducts.findIndex((item) => item.id === product.id);
  const prev = index > 0 ? brandProducts[index - 1] : null;
  const next = index >= 0 && index < brandProducts.length - 1 ? brandProducts[index + 1] : null;
  const related = [
    ...brandProducts.filter((item) => item.id !== product.id).slice(0, 3),
    ...productsByCategory(product).slice(0, 2),
  ].filter((item, position, self) => item && self.findIndex((entry) => entry.id === item.id) === position).slice(0, 4);

  const quickFacts = [
    ['配列', product.meta.layout],
    ['轴体', product.meta.switchText],
    ['回报率', formatHz(product.meta.pollingHz)],
    ['连接方式', product.meta.connection],
    ['建议零售价', product.meta.price],
    ['发布日期', product.meta.release],
  ].filter(([, value]) => value);

  return (
    <div className="page container">
      <Link className="back-link" to="/keyboards">
        <ArrowLeft size={15} /> 键盘数据库
      </Link>

      <header className="product-hero">
        <div className="product-hero-main">
          <div className="product-hero-badges">
            <TagChip tone={categoryColor(product.meta.category) === 'orange' ? 'orange' : 'neutral'}>{product.meta.category}</TagChip>
            {product.meta.layoutGroup ? <TagChip>{product.meta.layoutGroup}</TagChip> : null}
            {product.meta.discontinued ? <TagChip>{product.meta.discontinued}</TagChip> : null}
          </div>
          <h1>{product.title}</h1>
          {brand ? (
            <Link className="product-hero-brand" to={`/brands/${brand.id}`}>
              {brand.name}{brand.chinese ? `（${brand.chinese}）` : ''} <ArrowUpRight size={13} />
            </Link>
          ) : null}
          {product.excerpt ? <p className="product-hero-excerpt">{product.excerpt}</p> : null}
          <div className="product-hero-actions">
            <button
              type="button"
              className={`btn ${ids.includes(product.id) ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => toggle(product.id)}
            >
              <Scale size={15} />
              {ids.includes(product.id) ? '已加入对比' : '加入对比'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
              }}
            >
              <Share2 size={15} /> 复制链接
            </button>
          </div>
        </div>
        <div className="product-hero-visual">
          <KeyboardVisual layout={product.meta.layoutGroup} />
          <div className="product-hero-score">
            <span>综合评分</span>
            <strong>{product.meta.overall ? product.meta.overall.toFixed(1) : '—'}</strong>
            <StarRating score={product.meta.overall} size={13} />
          </div>
        </div>
      </header>

      <div className="wiki-layout">
        <aside className="wiki-toc">
          <div className="wiki-toc-title">章节</div>
          {contentSections.map((section) => (
            <button
              type="button"
              key={section.key}
              className="wiki-toc-link"
              onClick={() => document.getElementById(slugify(section.title))?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              {section.title}
            </button>
          ))}
        </aside>

        <article className="wiki-content">
          {contentSections.map((section) => (
            <section
              className={`wiki-section${/型号变体|Variants/.test(section.title) ? ' is-variants' : ''}`}
              key={section.key}
            >
              <h2>{section.title}</h2>
              <Markdown>{section.content}</Markdown>
            </section>
          ))}
        </article>

        <aside className="wiki-side">
          <div className="side-card infobox">
            <div className="side-card-title">产品信息 Infobox</div>
            {infobox.length > 0 ? (
              <dl className="info-list">
                {infobox.map((field) => (
                  <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>
                ))}
              </dl>
            ) : (
              <p className="muted">暂无 Infobox 数据。</p>
            )}
          </div>

          <div className="side-card">
            <div className="side-card-title">快速参数</div>
            <dl className="info-list">
              {quickFacts.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          </div>

          {product.meta.technologies.length > 0 ? (
            <div className="side-card">
              <div className="side-card-title">技术标签</div>
              <div className="tech-chip-list">
                {product.meta.technologies.map((tech) => (
                  <TagChip key={tech} to={`/tech`} tone="orange">{tech}</TagChip>
                ))}
              </div>
            </div>
          ) : null}

          {related.length > 0 ? (
            <div className="side-card">
              <div className="side-card-title">相关产品</div>
              <div className="side-product-list">
                {related.map((item) => (
                  <div className="side-product" key={item.id}>
                    <Link className="side-product-title" to={`/keyboards/${item.id}`}>
                      {item.title} <ArrowUpRight size={13} />
                    </Link>
                    <div className="side-product-meta">
                      <span>{item.meta.layoutGroup}</span>
                      <StarRating score={item.meta.overall} size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <nav className="prev-next" aria-label="产品导航">
        {prev ? (
          <Link className="prev-next-card" to={`/keyboards/${prev.id}`}>
            <ArrowLeft size={15} />
            <span><small>上一个</small>{prev.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link className="prev-next-card is-next" to={`/keyboards/${next.id}`}>
            <span><small>下一个</small>{next.title}</span>
            <ArrowRight size={15} />
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}

function productsByCategory(product) {
  return [...productById.values()]
    .filter((item) => item.id !== product.id && item.meta.category === product.meta.category)
    .slice(0, 2);
}
