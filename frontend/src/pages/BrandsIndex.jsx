import BrandCard from '../components/BrandCard';
import { PageHeader } from '../components/Ui';
import { brands } from '../lib/data';

const GROUPS = ['国际品牌', '国产品牌'];

export default function BrandsIndex() {
  return (
    <div className="page container">
      <PageHeader
        eyebrow="品牌数据库"
        title="游戏键盘品牌档案"
        description="收录全球游戏键盘品牌的发展历史、核心技术、产品线与赛事影响力，按国际与国产两个维度组织。"
      />
      {GROUPS.map((group) => {
        const groupBrands = brands.filter((brand) => brand.group === group);
        return (
          <section className="page-section" key={group}>
            <div className="section-head">
              <div>
                <div className="section-eyebrow">{group}</div>
                <h2>{group} · {groupBrands.length} 个品牌</h2>
              </div>
            </div>
            <div className="brand-grid">
              {groupBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
