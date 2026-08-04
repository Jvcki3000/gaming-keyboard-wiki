import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Lightbulb, Search } from 'lucide-react';
import { PageHeader, StarRating, TagChip } from '../components/Ui';
import { brands, games, products, techTerms } from '../lib/data';
import { guessSuggestions } from '../lib/fuzzy';

function Highlight({ text, query }) {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const keyword = query.toLowerCase();

  const result = useMemo(() => {
    if (!keyword) return { products: [], brands: [], tech: [], games: [] };
    return {
      products: products.filter((product) => product.searchText.includes(keyword)),
      brands: brands.filter((brand) => brand.searchText.includes(keyword)),
      tech: techTerms.filter((term) => `${term.name} ${term.category} ${term.description}`.toLowerCase().includes(keyword)),
      games: games.filter((game) => `${game.name} ${game.category} ${game.description}`.toLowerCase().includes(keyword)),
    };
  }, [keyword]);

  const total = result.products.length + result.brands.length + result.tech.length + result.games.length;
  const suggestions = total === 0 ? guessSuggestions(keyword) : [];

  return (
    <div className="page container">
      <PageHeader
        eyebrow="站内搜索"
        title={query ? `“${query}” 的搜索结果` : '搜索知识库'}
        description={query ? `找到 ${total} 条相关内容。` : '输入品牌、型号、技术词条或游戏名称进行检索。'}
      />

      {!query ? (
        <div className="search-empty">
          <Search size={28} />
          <p>试试搜索「Rapid Trigger」「磁轴」「Wooting」或「Valorant」。</p>
          <div className="tag-cloud">
            {['Rapid Trigger', '磁轴', 'Wooting', 'Valorant', '8KHz'].map((tag) => (
              <TagChip key={tag} to={`/search?q=${encodeURIComponent(tag)}`} tone="orange">{tag}</TagChip>
            ))}
          </div>
        </div>
      ) : (
        <div className="search-results">
          {suggestions.length > 0 ? (
            <section className="search-suggestion">
              <div className="search-suggestion-head">
                <Lightbulb size={17} />
                <strong>猜你所想</strong>
              </div>
              <p>没有找到「{query}」的完全匹配，你可能想找：</p>
              <div className="search-suggestion-list">
                {suggestions.map(({ entry, kindLabel: label }) => (
                  <Link className="search-suggestion-item" key={`${entry.type}-${entry.id}`} to={entry.route}>
                    <span className="search-suggestion-kind">{label}</span>
                    <span className="search-suggestion-title">{entry.title}</span>
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {result.products.length > 0 ? (
            <section className="search-group">
              <h2>产品 / 系列 <span>{result.products.length}</span></h2>
              <div className="search-list">
                {result.products.map((product) => (
                  <Link className="search-row" to={`/keyboards/${product.id}`} key={product.id}>
                    <div className="search-row-main">
                      <strong><Highlight text={product.title} query={query} /></strong>
                      <span><Highlight text={product.brand} query={query} /> · {product.meta.category} · {product.meta.layoutGroup}</span>
                    </div>
                    <StarRating score={product.meta.overall} size={12} />
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {result.brands.length > 0 ? (
            <section className="search-group">
              <h2>品牌 <span>{result.brands.length}</span></h2>
              <div className="search-list">
                {result.brands.map((brand) => (
                  <Link className="search-row" to={`/brands/${brand.id}`} key={brand.id}>
                    <div className="search-row-main">
                      <strong><Highlight text={brand.title} query={query} /></strong>
                      <span>{brand.group} · {brand.productCount} 个产品</span>
                    </div>
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {result.tech.length > 0 ? (
            <section className="search-group">
              <h2>技术词条 <span>{result.tech.length}</span></h2>
              <div className="search-list">
                {result.tech.map((term) => (
                  <Link className="search-row" to={`/tech/${term.id}`} key={term.id}>
                    <div className="search-row-main">
                      <strong><Highlight text={term.name} query={query} /></strong>
                      <span>{term.category} · {term.related.length} 个关联产品</span>
                    </div>
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {result.games.length > 0 ? (
            <section className="search-group">
              <h2>游戏适配 <span>{result.games.length}</span></h2>
              <div className="search-list">
                {result.games.map((game) => (
                  <Link className="search-row" to={`/games/${game.id}`} key={game.id}>
                    <div className="search-row-main">
                      <strong><Highlight text={game.name} query={query} /></strong>
                      <span>{game.category} · {game.related.length} 个适配产品</span>
                    </div>
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {total === 0 ? (
            <div className="empty-state">
              <div className="empty-title">没有找到相关内容</div>
              <p>尝试使用更短的关键词，或浏览品牌数据库与技术百科。</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
