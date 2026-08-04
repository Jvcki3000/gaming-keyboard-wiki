# Game Keyboard Wiki 部署上线流程

## 0. 前置检查（本地）

项目不需要后端，构建产物是纯静态站点，可部署到任意静态托管平台。

```powershell
cd frontend
pnpm install          # 安装依赖
pnpm data             # 重新生成 src/data/*.json（改过 brand.md / product.md 时才需要）
pnpm build            # 构建产物输出到 frontend/dist/
```

检查产物可移植性：

- 打开 `frontend/dist/index.html`，确认资源路径为相对路径（`./assets/...`）
- 本地双击 `dist/index.html` 可正常打开首页（HashRouter 不需要服务端重写）
- 路由形式为 `/#/brands`、`/#/keyboards/xxx`，任何静态服务器都能直接访问

部署根目录固定为 `frontend/`（`package.json`、`vercel.json` 都在这里）。

## 1. 方案 A：Vercel（推荐）

1. 打开 https://vercel.com 并登录（可用 GitHub 账号）
2. 点击 `Add New... → Project`
3. 导入本仓库（先在 GitHub 推送代码）
4. 配置：
   - Root Directory：`frontend`
   - Framework Preset：`Vite`
   - Build Command：`pnpm build`
   - Output Directory：`dist`
   - Install Command：`pnpm install`
5. 项目里已有 `frontend/vercel.json`，上述配置会自动生效，也可手动确认
6. 点击 `Deploy`，等待构建完成
7. 部署成功后访问 `https://<project>.vercel.app`
8. 自定义域名：`Project → Settings → Domains`，添加域名并按提示配置 DNS（CNAME 指向 `cname.vercel-dns.com`）

## 2. 方案 B：Netlify

1. 打开 https://app.netlify.com → `Add new site → Import an existing project`
2. 选择仓库并配置：
   - Base directory：`frontend`
   - Build command：`pnpm build`
   - Publish directory：`dist`
3. 部署完成后域名默认为 `https://<site>.netlify.app`
4. 自定义域名：`Site settings → Domain management → Add custom domain`，DNS 添加 CNAME 指向站点域名

## 3. 方案 C：Cloudflare Pages

1. 打开 https://dash.cloudflare.com → `Workers & Pages → Create → Pages → Connect to Git`
2. 选择仓库并配置：
   - Framework preset：`Vite`
   - Root directory：`frontend`
   - Build command：`pnpm build`
   - Output directory：`dist`
3. 首次构建后得到 `https://<project>.pages.dev`
4. 自定义域名：`Custom domains` 添加域名，DNS 由 Cloudflare 自动配置

## 4. 方案 D：GitHub Pages / 任意静态托管

最简单方式：把 `frontend/dist/` 里的文件上传到任意静态空间即可。

GitHub Pages：

1. 推送代码到 GitHub 仓库
2. `Settings → Pages → Source` 选择 `GitHub Actions` 或 `Deploy from a branch`
3. 若用 Actions，可参考以下最小工作流，放在 `.github/workflows/deploy.yml`：

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          cache-dependency-path: frontend/pnpm-lock.yaml
      - run: cd frontend && pnpm install && pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/dist
      - uses: actions/deploy-pages@v4
```

4. 在 `Settings → Pages` 开启 GitHub Actions 部署
5. 访问 `https://<user>.github.io/<repo>/`

## 5. 上线后检查清单

- 首页可打开，搜索框、幕布滚动正常
- `/#/brands`、`/#/keyboards`、`/#/tech`、`/#/games`、`/#/esports`、`/#/rankings`、`/#/compare`、`/#/contribute` 均可访问
- 深色模式切换正常
- 自定义域名 HTTPS 生效
- 更新 `工作报告.md` 记录上线日期与线上地址

## 6. 后续更新流程

1. 编辑 `backend/data/brand.md` 或 `backend/data/product.md`
2. 在 `frontend/` 运行 `pnpm data`
3. 运行 `pnpm build`
4. 推送代码，托管平台自动重新构建部署

若平台未开启自动部署，手动触发构建或重新上传 `frontend/dist/` 即可。
