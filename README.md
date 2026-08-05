# Game Keyboard Wiki

基于 `brand.md` 与 `product.md` 构建的游戏键盘百科网站，设计风格参考 ccswitch.io（暖米色浅色 + 橙色强调，内置深色模式），使用 React + Vite。

## 功能

- 首页：全站搜索、分类导航、热门条目、最近更新、热门标签
- 品牌数据库：14 个品牌档案页，含 Infobox、核心技术、产品线、赛事影响力
- 键盘数据库：40 个产品 / 系列页，支持按轴体、配列、品牌筛选与排序
- 技术百科：Rapid Trigger、Hall Effect、SOCD 等 11 个词条及关联产品
- 游戏适配：Valorant、CS2 等 10 个游戏页及产品评分
- 电竞数据库、评分排行榜、最多 4 款产品横向对比、站内搜索

## 本地运行

需要 Node.js 18+ 或本机 Codex 内置运行时（v24）。

```bash
cd frontend
pnpm install
pnpm data   # 重新解析 brand.md / product.md 并生成 src/data/*.json
pnpm dev    # 启动开发服务器
```

也可以在项目根目录直接运行 `pnpm dev`、`pnpm data`、`pnpm build`（已配置转发到 `frontend/`）。

本机可使用内置 Node 直接运行 Vite：

```powershell
cd frontend
& "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules/vite/bin/vite.js
```

生产构建：

```bash
cd frontend
pnpm build
```

构建产物在 `dist/`，由于使用 HashRouter 与相对资源路径，可直接通过静态服务器或双击 `dist/index.html` 打开。

## 部署上线

项目使用 HashRouter 与相对资源路径，任意静态托管均可直接运行，部署根目录为 `frontend/`。

- Vercel：导入仓库时选择根目录 `frontend/`，已内置 `frontend/vercel.json`（Vite 框架、`pnpm build`、输出 `dist/`）
- Netlify / Cloudflare Pages：构建命令 `pnpm build`，输出目录 `dist/`
- GitHub Pages / 任意静态服务器：上传 `frontend/dist/` 即可

## 数据维护

- 品牌档案维护在 `backend/data/brand.md`
- 产品 / 系列参数维护在 `backend/data/product.md`
- 数据管线：`backend/scripts/build-data.mjs` 解析 Markdown 并生成 `frontend/src/data/*.json`
- 更新数据后，在 `frontend/` 运行 `pnpm data` 重新生成站点数据
- 内容遵循「信息来源可靠、验证严格、更新及时、立场中立、来源可溯」的维护规则

## 目录结构

```text
gkeyboardwiki/
├── frontend/          # 前端（React + Vite 站点）
│   ├── src/           # 页面、组件、样式、生成后的数据 JSON
│   ├── public/
│   └── dist/          # 构建产物
├── backend/           # 数据层
│   ├── data/          # brand.md / product.md 内容源
│   └── scripts/       # Markdown → JSON 解析脚本
├── 工作报告.md          # 项目进度报告
└── README.md
```
