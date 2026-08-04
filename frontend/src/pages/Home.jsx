import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Cpu,
  Gamepad2,
  Keyboard,
  PencilLine,
  Scale,
  Search,
  Tags,
  Trophy,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FloatingTagBubbles from '../components/FloatingTagBubbles';
import ScrollRevealHero from '../components/ScrollRevealHero';
import SpecularButton from '../components/SpecularButton';
import { featuredProducts, meta, products } from '../lib/data';

const CATEGORIES = [
  { to: '/brands', label: '品牌数据库', desc: '国际与国产品牌档案', icon: Tags, count: meta.stats.brands },
  { to: '/keyboards', label: '键盘数据库', desc: '磁轴 / 光轴 / 机械轴', icon: Keyboard, count: meta.stats.products },
  { to: '/tech', label: '技术百科', desc: 'Rapid Trigger 等词条', icon: Cpu, count: meta.stats.techTerms },
  { to: '/games', label: '游戏适配', desc: 'Valorant / CS2 等', icon: Gamepad2, count: meta.stats.games },
  { to: '/esports', label: '电竞数据库', desc: '战队与选手装备', icon: Trophy, count: 11 },
  { to: '/rankings', label: '排行榜', desc: '评分与性价比排行', icon: BarChart3, count: 3 },
  { to: '/compare', label: '对比工具', desc: '最多 4 款产品横向对比', icon: Scale, count: 4 },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const featured = featuredProducts();
  const newest = [...products].sort((a, b) => b.title.localeCompare(a.title, 'zh')).slice(0, 6);

  return (
    <ScrollRevealHero
      hero={
        <section className="home-hero">
        <div className="container">
          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <div className="eyebrow">Gaming Keyboard Wiki</div>
              <h1>游戏键盘百科</h1>
              <p>
                系统化收录游戏键盘品牌、产品规格、核心技术、游戏适配与职业选手装备数据，
                为玩家、硬件爱好者和选购者提供可追溯的中立信息。
              </p>
              <form
                className="hero-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  const trimmed = query.trim();
                  if (!trimmed) return;
                  navigate(`/search?q=${encodeURIComponent(trimmed)}`);
                }}
              >
                <Search size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索品牌、型号、技术词条…"
                  aria-label="全站搜索"
                />
                <SpecularButton
                  type="submit"
                  size="md"
                  radius={12}
                  tint="#D95A2F"
                  tintOpacity={1}
                  blur={0}
                  textColor="#FFF4E6"
                  lineColor="#FFD9B8"
                  baseColor="#8F3A1F"
                  intensity={1.15}
                  shineSize={10}
                  shineFade={40}
                  thickness={1.2}
                  speed={0.35}
                  followMouse
                  proximity={250}
                  autoAnimate
                  className="hero-search-btn"
                >
                  搜索
                </SpecularButton>
              </form>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>{meta.stats.brands}</strong>
                <span>品牌档案</span>
              </div>
              <div className="hero-stat">
                <strong>{meta.stats.products}</strong>
                <span>产品 / 系列</span>
              </div>
              <div className="hero-stat">
                <strong>{meta.stats.techTerms}</strong>
                <span>技术词条</span>
              </div>
              <div className="hero-stat">
                <strong>{meta.stats.pages}</strong>
                <span>知识页面</span>
              </div>
              <p className="hero-stats-note">
                覆盖 {meta.stats.brands} 个品牌、{meta.stats.products} 个产品页，
                数据最后更新于 {meta.lastUpdated}。
              </p>
            </div>
          </div>
        </div>
      </section>
      }
    >
        <section className="section section-categories">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">知识库结构</div>
              <h2>按分类浏览</h2>
            </div>
            <Link className="text-link" to="/brands">查看品牌索引 <ArrowRight size={14} /></Link>
          </div>
          <div className="category-grid">
            {CATEGORIES.map((category) => (
              <Link className="category-card" key={category.to} to={category.to}>
                <span className="category-card-icon"><category.icon size={20} /></span>
                <div>
                  <div className="category-card-title">{category.label}</div>
                  <div className="category-card-desc">{category.desc}</div>
                </div>
                <span className="category-card-count">{category.count}</span>
              </Link>
            ))}
          </div>
        </div>
        </section>

        <section className="section section-featured">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">热门条目</div>
              <h2>热门键盘</h2>
            </div>
            <Link className="text-link" to="/keyboards">全部产品 <ArrowRight size={14} /></Link>
          </div>
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        </section>

        <section className="section section-updates">
        <div className="container two-col">
          <div>
            <div className="section-eyebrow">热门标签</div>
            <h2>热门标签云</h2>
            <FloatingTagBubbles tags={meta.hotTags} />
          </div>
          <div>
            <div className="section-eyebrow">最新收录</div>
            <h2>最新收录产品</h2>
            <div className="newest-panel">
              <div className="newest-heading">
                <BookOpen size={16} />
                最近新增条目
              </div>
              <div className="newest-list">
                {newest.map((product) => (
                  <Link key={product.id} to={`/keyboards/${product.id}`}>
                    <span>{product.title}</span>
                    <ArrowRight size={13} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        </section>

        <section className="section section-contribute">
        <div className="container contribute-band">
          <div className="contribute-copy">
            <span className="contribute-icon"><PencilLine size={22} /></span>
            <div>
              <h2>参与内容维护</h2>
              <p>所有条目遵循「信息可靠、验证严格、更新及时、立场中立、来源可溯」的规则，欢迎补充官方渠道与权威来源的资料。</p>
            </div>
          </div>
          <div className="contribute-meta">
            <span>来源文件：brand.md · product.md · 工作报告.md</span>
            <div className="contribute-btns">
              <Link className="btn btn-outline" to="/contribute">参与编辑</Link>
              <Link className="btn btn-primary" to="/tech">浏览技术词条 <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
        </section>

        <section className="section section-milestones">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">项目进度</div>
              <h2>工作进度里程碑</h2>
            </div>
            <span className="result-count">数据最后更新 {meta.lastUpdated}</span>
          </div>
          <div className="milestone-list">
            {meta.milestones.map((milestone, index) => (
              <div className="milestone-item" key={index}>
                <span className="milestone-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="milestone-date">{milestone.date}</span>
                <span className="milestone-text">{milestone.text}</span>
              </div>
            ))}
          </div>
        </div>
        </section>
    </ScrollRevealHero>
  );
}
