import { BookOpen, CheckCircle2, Database, GitBranch, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/Ui';

const RULES = [
  ['信息来源可靠', '所有信息必须来自官方渠道或权威机构'],
  ['信息验证严格', '所有信息必须经过仔细核实，确保准确无误'],
  ['更新及时', '定期更新内容，反映最新产品与技术'],
  ['立场中立', '以客观事实为基础，避免主观评价'],
  ['来源可溯', '数据需标注来源与更新时间'],
  ['尊重版权', '图片、文字与视频均需注明出处并合法使用'],
];

const STEPS = [
  {
    icon: Database,
    title: '编辑内容源',
    text: '在 backend/data/brand.md 维护品牌档案，在 backend/data/product.md 维护产品 / 系列参数，遵循统一章节模板。',
  },
  {
    icon: GitBranch,
    title: '重新生成数据',
    text: '在 frontend/ 运行 pnpm data，由解析脚本自动生成 frontend/src/data/*.json。',
  },
  {
    icon: ShieldCheck,
    title: '提交审核',
    text: '提交改动后由管理员按「信息准确、立场中立、版权合规」规则审核，通过后上线。',
  },
];

export default function ContributePage() {
  return (
    <div className="page container">
      <PageHeader
        eyebrow="社区协作"
        title="参与编辑"
        description="Game Keyboard Wiki 采用「社区编辑 + 管理员审核」的维护机制，欢迎按内容规范补充品牌、产品与技术资料。"
      />

      <section className="wiki-section">
        <h2>编辑流程</h2>
        <div className="contribute-steps">
          {STEPS.map((step, index) => (
            <div className="contribute-step" key={step.title}>
              <span className="contribute-step-num">{index + 1}</span>
              <span className="contribute-step-icon"><step.icon size={20} /></span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wiki-section">
        <h2>内容规范</h2>
        <div className="rule-grid">
          {RULES.map(([title, text]) => (
            <div className="rule-item" key={title}>
              <CheckCircle2 size={17} />
              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wiki-section">
        <h2>数据来源</h2>
        <p className="muted">
          当前内容源为 brand.md 与 product.md，资料主要来自官方产品页、权威评测、社区反馈与职业选手公开信息；
          收录时需保留参考来源与访问日期，确保可追溯。
        </p>
        <div className="source-note">
          <BookOpen size={16} />
          <span>内容源文件：backend/data/brand.md · backend/data/product.md</span>
        </div>
      </section>
    </div>
  );
}
