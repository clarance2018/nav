# Navigation

一个简约的起始页，支持自定义搜索引擎，自定义快捷方式，自定义壁纸以及数据备份。

🌐 **在线访问**: [nav.v-li.com](https://nav.v-li.com/)

## 功能特性

- 🔍 自定义搜索引擎
- ⚡ 快捷方式管理
- 🖼️ 自定义壁纸
- 📝 便签功能
- ✅ 待办事项
- 💾 数据备份与恢复
- 📱 PWA 支持
- 🌙 暗色主题

## 技术栈

- Vue.js 3
- Vite
- Naive UI
- Pinia
- PWA (Workbox)

## 项目说明

⚠️ **这是部署仓库**，仅包含构建后的静态文件，用于 GitHub Pages 部署。

源码修改请在源码仓库中进行，修改后重新构建并部署到此仓库。

## 部署

部署通过 GitHub Actions 自动完成：

1. 推送到 `main` 分支触发部署
2. 使用 `actions/deploy-pages@v2` 部署到 GitHub Pages
3. 自动配置自定义域名 `nav.v-li.com`

## 最近更新

### 2026-06-12

- 🐛 修复便签/待办 UI 注入问题
  - 问题：Vue/Naive UI 的 Tab 点击事件不会冒泡到 document 层级
  - 解决：改用 MutationObserver 监听 Tab 面板内容变化
  - 效果：便签和待办功能现在可以正确检测 Tab 切换并注入 UI

## License

MIT
