# JPG to PDF Converter

纯前端、本地运行的 JPG 转 PDF 工具。  
图片不会上传到服务器，PDF 在浏览器内生成，历史记录保存在当前设备的 IndexedDB。

## Features

- 纯静态前端，无 Node.js 后端、无云端转换
- 支持拖放或选择多个 JPG/JPEG 文件
- 支持转换前预览、排序、移除单张图片
- 使用本地 `pdf-lib` 在浏览器中生成 PDF
- IndexedDB 历史记录
- 历史记录自动限制在 `50MB` 内，超出后自动删除最旧项目
- PWA 支持，可安装到本机
- 支持离线打开
- 支持多语言：English、中文、日本語、Bahasa Melayu

## Project Structure

- [index.html](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/index.html): 页面结构
- [styles.css](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/styles.css): UI / UX 样式
- [app.js](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/app.js): 前端逻辑、转换流程、IndexedDB、PWA
- [i18n.js](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/i18n.js): 多语言文案与格式化工具
- [service-worker.js](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/service-worker.js): PWA 缓存与更新逻辑
- [manifest.json](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/manifest.json): PWA manifest
- [icons/](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/icons): 本地图标资源
- [vendor/pdf-lib.min.js](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/vendor/pdf-lib.min.js): 本地 vendored PDF 库

## Run

这是纯静态项目，可以用以下任一方式打开：

1. 直接打开 [index.html](/mnt/c/Users/tno/Documents/GitHub/jpg_to_pdf/index.html)
2. 用任意静态服务器启动后访问，例如本地开发服务器、Live Server、或其他 static host

说明：

- `file://` 模式下基本功能可用
- 若要完整使用 PWA、Service Worker、安装到桌面、自动更新，建议通过 `http://localhost/...` 访问

## How It Works

1. 选择或拖入 JPG/JPEG 文件
2. 在页面中调整顺序
3. 点击 `Convert to PDF`
4. 浏览器本地生成 PDF
5. 下载结果，并写入本地历史记录

转换时会优先按 JPEG 原始数据嵌入；如果图片虽然扩展名是 `.jpg` 但内容不完全符合标准 JPEG，应用会尝试先由浏览器解码，再转成 PNG 后写入 PDF。

## History Storage

历史记录保存在 IndexedDB，记录内容包括：

- 输出文件名
- 生成时间
- 页数
- PDF 大小
- 来源文件名
- 部分失败时的跳过文件名
- PDF Blob

存储策略：

- 上限为 `50MB`
- 每次成功保存历史后都会自动检查容量
- 超过上限时，会从最旧记录开始删除
- 至少保留最新一条记录

## PWA Behavior

- 首次通过 `http/https` 打开后会注册 Service Worker
- App Shell 会缓存到本地，支持离线打开
- 页面会主动检查更新
- 检测到新版本后会自动切换到最新前端代码

如果你改了源码但浏览器还显示旧版本：

1. 强制刷新页面
2. 关闭旧标签页后重新打开
3. 必要时在浏览器 DevTools 中 unregister 旧的 Service Worker

## Browser Notes

- 推荐使用较新的 Chrome、Edge、Firefox
- 仅接受 JPG/JPEG 文件作为输入
- 超大图片或超大量文件在浏览器中会占用较多内存

## Development Notes

- 本项目当前不依赖打包工具
- 所有资源均为本地文件
- 不使用 CDN
- 不使用后端 API
- 不使用远程图片上传

## License

如需补充许可证，请在此仓库中添加正式 license 文件。
