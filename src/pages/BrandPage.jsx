import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ExternalLink, Globe, Scale } from 'lucide-react';
import Markdown from '../components/Markdown';
import KeyboardVisual from '../components/KeyboardVisual';
import { StarRating, TagChip } from '../components/Ui';
import { brandById, productById, slugify } from '../lib/data';
import { useCompare } from '../lib/CompareContext';

export default function BrandPage() {
  const { brandId } = useParams();
  const brand = brandById.get(brandId);
  const { ids, toggle } = useCompare();

  if (!brand) {
    return (
      <div className="page container">
        <div className="empty-state">
          <div className="empty-title">未找到该品牌</div>
          <Link to="/brands">返回品牌数据库</Link>
        </div>
      </div>
    );
  }

  const products = (brand.products || [])
    .map((item) => productById.get(item.id))
    .filter(Boolean);

  return (
    <div className="page container">
      <Link className="back-link" to="/brands">
        <ArrowLeft size={15} /> 品牌数据库
      </Link>

      <header className="brand-hero">
        <div className="brand-hero-mark">{brand.name.charAt(0).toUpperCase()}</div>
        <div className="brand-hero-copy">
          <div className="brand-hero-badges">
            <TagChip tone="orange">{brand.group}</TagChip>
            {brand.info.country ? <TagChip>{brand.info.country}</TagChip> : null}
            <TagChip>{brand.productCount} 个产品</TagChip>
          </div>
          <h1>{brand.name}</h1>
          {brand.chinese ? <div className="brand-hero-chinese">{brand.chinese}</div> : null}
          {brand.info.slogan ? <p className="brand-hero-slogan">{brand.info.slogan}</p> : null}
          <p className="brand-hero-excerpt">{brand.excerpt}</p>
        </div>
        <div className="brand-hero-info">
          {brand.info.founded ? (
            <div><span>创立时间</span><strong>{brand.info.founded}</strong></div>
          ) : null}
          {brand.info.parent ? (
            <div><span>所属集团</span><strong>{brand.info.parent}</strong></div>
          ) : null}
          {brand.info.website ? (
            <a href={brand.info.website} target="_blank" rel="noreferrer" className="brand-website">
              <Globe size={14} /> 官方网站 <ExternalLink size={12} />
            </a>
          ) : null}
        </div>
      </header>

      <div className="wiki-layout">
        <aside className="wiki-toc">
          <div className="wiki-toc-title">页面目录</div>
          {brand.sections.map((section) => (
            <button
              type="button"
              key={section.key}
              className="wiki-toc-link"
              onClick={() => document.getElementById(slugify(section.title))?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              {section.title}
            </button>
          ))}
          <Link className="wiki-toc-link" to={`/keyboards?brand=${encodeURIComponent(brand.name)}`}>
            查看产品页面
          </Link>
        </aside>

        <article className="wiki-content">
          {brand.sections.length > 0 ? (
            brand.sections.map((section) => (
              <section className="wiki-section" key={section.key}>
                <h2>{section.title}</h2>
                <Markdown>{section.content}</Markdown>
              </section>
            ))
          ) : (
            <section className="wiki-section">
              <h2>品牌档案</h2>
              <p>{brand.excerpt}</p>
              <p className="muted">{brand.sourceNote || '详细档案正在整理中。'}</p>
            </section>
          )}

          {brand.coreTech.length > 0 ? (
            <section className="wiki-section">
              <h2>核心技术</h2>
              <div className="tech-chip-list">
                {brand.coreTech.map((tech) => (
                  <TagChip key={tech} tone="orange">{tech.replace(/^\d+\.\d+\s*/, '')}</TagChip>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <aside className="wiki-side">
          <div className="side-card">
            <div className="side-card-title">品牌信息</div>
            <dl className="info-list">
              <div><dt>品牌</dt><dd>{brand.name}{brand.chinese ? `（${brand.chinese}）` : ''}</dd></div>
              <div><dt>国家 / 地区</dt><dd>{brand.info.country || '—'}</dd></div>
              <div><dt>创立时间</dt><dd>{brand.info.founded || '—'}</dd></div>
              <div><dt>产品数量</dt><dd>{brand.productCount}</dd></div>
              <div><dt>分类</dt><dd>{brand.info.category || brand.group}</dd></div>
            </dl>
          </div>

          <div className="side-card">
            <div className="side-card-title">收录产品</div>
            {products.length > 0 ? (
              <div className="side-product-list">
                {products.map((product) => (
                  <div className="side-product" key={product.id}>
                    <Link className="side-product-title" to={`/keyboards/${product.id}`}>
                      {product.title} <ArrowUpRight size={13} />
                    </Link>
                    <div className="side-product-meta">
                      <span>{product.meta.layoutGroup}</span>
                      <span>{product.meta.category}</span>
                      <StarRating score={product.meta.overall} size={12} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">产品页面待收录。</p>
            )}
          </div>
        </aside>
      </div>

      {products.length > 0 ? (
        <section className="page-section">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">产品线</div>
              <h2>{brand.name} 在售型号</h2>
            </div>
            <Link className="text-link" to={`/keyboards?brand=${encodeURIComponent(brand.name)}`}>
              全部产品 <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="product-strip">
            {products.map((product) => (
              <Link className="product-strip-card" key={product.id} to={`/keyboards/${product.id}`}>
                <KeyboardVisual layout={product.meta.layoutGroup} />
                <div className="product-strip-title">{product.title}</div>
                <div className="product-strip-meta">
                  <span>{product.meta.category}</span>
                  <span>{product.meta.layoutGroup}</span>
                </div>
                <div className="product-strip-foot">
                  <StarRating score={product.meta.overall} size={12} />
                  <button
                    type="button"
                    className={`compare-toggle${ids.includes(product.id) ? ' is-active' : ''}`}
                    onClick={() => toggle(product.id)}
                    aria-label="加入对比"
                  >
                    <Scale size={14} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
