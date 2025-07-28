# SRT字幕时间调整器

一个简洁优雅的在线工具，用于消除SRT字幕文件中相邻字幕之间的时间空隙。

## ✨ 功能特点

- 🎯 **核心功能**：将每条字幕的结束时间调整为下一条字幕的开始时间
- 📁 **文件上传**：支持拖拽上传和文件选择
- 👀 **实时预览**：左右对比显示原始和处理后的内容
- 📊 **统计信息**：实时显示字符数和行数
- 📥 **一键下载**：处理完成后直接下载结果文件
- 📋 **复制功能**：一键复制内容到剪贴板
- ⌨️ **快捷键**：支持键盘快捷操作
- 📱 **响应式**：完美适配手机、平板和桌面设备

## 🍎 设计理念

采用苹果风格的设计语言：
- **简洁至上**：去除不必要的装饰，专注核心功能
- **优雅交互**：微妙的动画和反馈效果
- **系统一致**：遵循苹果设计规范的色彩和布局
- **无障碍**：支持键盘导航和屏幕阅读器

## 🚀 在线使用

访问：[SRT字幕时间调整器](https://your-domain.pages.dev)

## 💻 本地运行

1. 克隆仓库：
```bash
git clone https://github.com/your-username/srt-time-adjuster.git
cd srt-time-adjuster
```

2. 使用任意HTTP服务器运行：
```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx serve .

# 或直接用浏览器打开 srt-time-adjuster.html
```

## 📁 项目结构

```
srt-time-adjuster/
├── srt-time-adjuster.html    # 主页面
├── styles.css                # 苹果风格样式
├── script.js                 # 核心逻辑
└── README.md                 # 项目说明
```

## 🔧 技术栈

- **HTML5**：语义化标签和现代Web API
- **CSS3**：Flexbox/Grid布局，CSS变量，响应式设计
- **JavaScript ES6+**：模块化类设计，异步处理
- **Web APIs**：File API，Clipboard API，Drag & Drop API

## 📝 使用方法

1. **上传文件**：拖拽SRT文件到上传区域或点击选择文件
2. **处理字幕**：点击"处理字幕"按钮或按 `Ctrl+Enter`
3. **预览结果**：在右侧编辑器查看处理后的内容
4. **下载文件**：点击"下载处理后的文件"或按 `Ctrl+S`

## ⌨️ 快捷键

- `Ctrl/Cmd + Enter`：处理字幕
- `Ctrl/Cmd + S`：下载文件
- `Shift + Delete`：清空内容

## 🌙 深色模式

自动跟随系统设置，支持浅色和深色两种主题。

## 📱 移动端支持

完美适配移动设备，支持触摸操作和手势交互。

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！
