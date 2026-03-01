# PrettyDaily-React（桌面版）

`PrettyDaily-React` 是基于 **Electron + React + TypeScript** 的跨平台桌面应用，
目标是与 `PrettyDaily`（Android 版）在日程/待办核心能力上保持功能对等。

## 功能概览

- 今日视图（日程 + 待办）
- 月历视图（按天查看事件、快速新增）
- 待办管理（优先级、截止日期、完成状态）
- 统计页面（周/月完成情况）
- 设置中心（语言、主题、玻璃效果、数据管理、账号同步）
- 本地持久化（Electron IPC / localStorage 回退）

## 技术栈

- Electron 33
- React 18
- TypeScript 5
- Vite 5
- electron-builder 25

## 本地开发

### 1) 安装依赖

```bash
npm install
```

### 2) 启动开发模式

```bash
npm run dev:electron
```

## 打包命令

```bash
npm run dist:win
npm run dist:mac
npm run dist:linux
```

> 说明：打包命令已显式使用 `--publish never`，仅构建产物，不会在构建阶段尝试发布到 GitHub Release。

## CI/CD（GitHub Actions）

工作流文件：`.github/workflows/build.yml`

- Push 到 `master/main`：自动构建三平台产物并上传为 artifacts
- Push `v*` 标签：在构建成功后自动创建 GitHub Release 并上传产物

### 你需要在 GitHub 中准备什么？

#### 必需

- 通常 **不需要额外提供 PAT**。当前工作流使用 `secrets.GITHUB_TOKEN` 发布 Release。

#### 可选（代码签名相关）

如果你要做“可信签名”（避免 Windows/macOS 未签名警告），需要配置证书 Secrets：

- Windows 签名（可选）
  - `CSC_LINK`：Base64 或 URL 形式的 `.p12/.pfx` 证书
  - `CSC_KEY_PASSWORD`：证书密码

- macOS 签名与公证（可选）
  - `APPLE_ID`
  - `APPLE_APP_SPECIFIC_PASSWORD`
  - `APPLE_TEAM_ID`
  - 以及对应开发者证书（同样可通过 `CSC_LINK` / `CSC_KEY_PASSWORD`）

> 未配置签名证书时，`electron-builder` 会提示 “no signing info identified, signing is skipped”，这是正常现象，不会导致构建失败。

## 为什么之前会失败？

你的日志报错：

- `GitHub Personal Access Token is not set ... GH_TOKEN`

根因是 `electron-builder` 在 CI 某些场景（尤其 tag 构建）会尝试自动发布，从而要求 `GH_TOKEN`。

本仓库已修复为：

- 打包阶段仅构建（`--publish never`）
- 发布阶段交给独立 Release Job（使用 `GITHUB_TOKEN`）

## 目录结构（核心）

- `app/`：React 渲染进程
- `electron/`：Electron 主进程与预加载脚本
- `.github/workflows/build.yml`：CI/CD
- `release/`：本地产物输出目录

## 许可证

MIT
