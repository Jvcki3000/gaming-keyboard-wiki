import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Cpu,
  Gamepad2,
  Home,
  Keyboard,
  Menu,
  Moon,
  Scale,
  Search,
  Sun,
  Tags,
  Trophy,
  X,
} from 'lucide-react';
import { meta, productById } from '../lib/data';
import { useTheme } from '../lib/theme';
import { useCompare } from '../lib/CompareContext';
import { kindLabel, quickSuggest } from '../lib/fuzzy';
import BackToTop from './BackToTop';

const NAV_ITEMS = [
  { to: '/', label: '首页', icon: Home },
  { to: '/brands', label: '品牌数据库', icon: Tags },
  { to: '/keyboards', label: '键盘数据库', icon: Keyboard },
  { to: '/tech', label: '技术百科', icon: Cpu },
  { to: '/games', label: '游戏适配', icon: Gamepad2 },
  { to: '/esports', label: '电竞数据库', icon: Trophy },
  { to: '/rankings', label: '排行榜', icon: BarChart3 },
  { to: '/compare', label: '对比工具', icon: Scale },
];

function HeaderSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const trimmed = query.trim();
  const { exact, fuzzy } = useMemo(() => quickSuggest(trimmed), [trimmed]);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const go = (route) => {
    navigate(route);
    setQuery('');
    setOpen(false);
  };

  const submit = () => {
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="search-suggest-wrap" ref={wrapRef}>
      <form
        className="header-search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
          }}
          placeholder="搜索品牌、型号、技术…"
          aria-label="搜索"
        />
      </form>

      {open && trimmed.length >= 1 && (exact.length > 0 || fuzzy.length > 0) ? (
        <div className="search-suggest">
          {exact.length > 0 ? (
            <div className="search-suggest-group">
              <div className="search-suggest-label">搜索结果</div>
              {exact.map(({ entry }) => (
                <button type="button" key={`${entry.type}-${entry.id}`} className="search-suggest-item" onClick={() => go(entry.route)}>
                  <span className="search-suggest-kind">{kindLabel(entry.type)}</span>
                  <span className="search-suggest-title">{entry.title}</span>
                </button>
              ))}
            </div>
          ) : null}
          {fuzzy.length > 0 ? (
            <div className="search-suggest-group">
              <div className="search-suggest-label is-guess">猜你所想</div>
              {fuzzy.map(({ entry }) => (
                <button type="button" key={`${entry.type}-${entry.id}`} className="search-suggest-item is-guess" onClick={() => go(entry.route)}>
                  <span className="search-suggest-kind">{kindLabel(entry.type)}</span>
                  <span className="search-suggest-title">{entry.title}</span>
                </button>
              ))}
            </div>
          ) : null}
          <button type="button" className="search-suggest-all" onClick={submit}>
            查看全部搜索结果
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CompareTray() {
  const { ids, clear } = useCompare();
  const location = useLocation();
  if (ids.length === 0 || location.pathname === '/compare') return null;
  return (
    <div className="compare-tray">
      <div className="compare-tray-copy">
        <span className="compare-tray-count">{ids.length} / 4</span>
        <span className="compare-tray-text">已加入对比：{ids.map((id) => productById.get(id)?.title).filter(Boolean).join('、')}</span>
      </div>
      <div className="compare-tray-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>清空</button>
        <Link className="btn btn-primary btn-sm" to="/compare">开始对比 <Scale size={15} /></Link>
      </div>
    </div>
  );
}

export default function Layout() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand-logo" to="/">
            <span className="brand-logo-mark">
              <Keyboard size={22} />
            </span>
            <span className="brand-logo-copy">
              <strong>Game Keyboard Wiki</strong>
              <small>{meta.siteSlogan}</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="主导航">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
              >
                <item.icon size={15} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-tools">
            <HeaderSearch />
            <button
              type="button"
              className="icon-btn"
              onClick={toggle}
              aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
              title={theme === 'light' ? '深色模式' : '浅色模式'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              type="button"
              className="icon-btn mobile-menu-btn"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="mobile-menu" ref={menuRef}>
            <div className="container">
              <HeaderSearch />
              <nav className="mobile-nav" aria-label="移动端导航">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `mobile-nav-link${isActive ? ' is-active' : ''}`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        ) : null}
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <BookOpen size={18} />
              <strong>Game Keyboard Wiki</strong>
            </div>
            <p>游戏键盘领域的电竞数据库、技术百科与品牌档案库，内容遵循「信息可靠、立场中立、来源可溯」的维护规则。</p>
          </div>
          <div className="footer-col">
            <div className="footer-heading">内容导航</div>
            <Link to="/brands">品牌数据库</Link>
            <Link to="/keyboards">键盘数据库</Link>
            <Link to="/tech">技术百科</Link>
            <Link to="/games">游戏适配</Link>
          </div>
          <div className="footer-col">
            <div className="footer-heading">数据与工具</div>
            <Link to="/esports">电竞数据库</Link>
            <Link to="/rankings">排行榜</Link>
            <Link to="/compare">对比工具</Link>
            <Link to="/search">站内搜索</Link>
          </div>
          <div className="footer-col">
            <div className="footer-heading">站点统计</div>
            <span>{meta.stats.brands} 个品牌</span>
            <span>{meta.stats.products} 个产品 / 系列</span>
            <span>{meta.stats.techTerms} 个技术词条</span>
            <span>最后更新 {meta.lastUpdated}</span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Game Keyboard Wiki</span>
          <span>数据来源：{meta.sourceFiles.join(' / ')}</span>
        </div>
      </footer>

      <CompareTray />
      <BackToTop />
    </div>
  );
}
