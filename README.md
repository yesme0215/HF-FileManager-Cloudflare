# HF-FileManager-Cloudflare
基于 Cloudflare Pages + Hugging Face API 的文件/图床管理面板，个人学习使用，不对使用产生的任何问题负责。不建议fork，如你有需求请保留创作者信息。

## 一、功能速览

| 功能 / 需求 |	解决方案 |
| ----- | ----- |
| 实现登录验证	| Cloudflare Functions 中间件 + Cookie 会话验证 |
| 多仓库自由切换 | Model 仓库	支持切换 Models/Datasets/Spaces 三种类型 |
| 错误处理 |	全链路 try-catch + 用户友好错误提示 |
| 加载状态 |	操作时显示 Loading / 进度条 |
| 面包屑导航 |	路径面包屑，点击快速返回上级 |
| 图片预览	| 图片文件自动显示缩略图 |
| 环境变量泄露风险 |	Token 仅存后端，前端零接触 |
| 移动文件	| 新增文件移动功能 |
| 大文件上传	| 自动检测文件大小，提示大文件方案 |

## 二、项目结构

```
hf-file-manager/
├── functions/
│   ├── _middleware.js       # 登录验证中间件（核心安全）
│   ├── config.js             # 前端配置接口
│   └── api/
│       ├── list.js           # 列出文件
│       ├── upload.js         # 上传文件
│       ├── delete.js         # 删除文件
│       ├── rename.js         # 重命名文件
│       ├── move.js           # 移动文件
│       └── mkdir.js          # 创建文件夹
├── index.html                # 主管理面板
├── login.html                # 登录页面
├── style.css                 # 统一样式
├── script.js                 # 主面板逻辑
├── login.js                  # 登录逻辑
└── README.md                 # 详细部署文档
```

## 三、部署配置（必须正确设置）

| 变量名	| 说明	| 示例 |
| ----- | ----- | ----- |
| AUTH_PASSWORD	| 访问密码（自己设，强密码）	| MySuperSecretPass123! |
| HF_TOKEN	| Hugging Face Access Token（需 write 权限）	| hf_xxxxxxxxxxxxxxxxxxxx |
| HF_REPO_TYPE	| 仓库类型	| models / datasets / spaces |
| HF_REPO_ID	| 仓库 ID	| username/repo-name |
| HF_MIRROR	(可选) | HF 镜像站	| https://hf-mirror.com |

## 四、项目亮点

>1. 企业级安全：登录验证 + Token 零前端接触
>2. 全类型支持：Models/Datasets/Spaces 通吃
>3. 极致体验：面包屑、预览、Loading、错误提示一应俱全
>4. 生产可用：完善的错误处理和边界情况
>5. 零成本：完全使用 Cloudflare 和 Hugging Face 免费额度

## 五、部署操作

```
1. Fork 本项目
2. Cloudflare Pages → 连接 GitHub
3. 构建设置：
   构建命令：exit 0
   输出目录：.
4. 环境变量：参考部署配置
5. 部署完成
```

## 六、创作者

博客：[jin-di.top](https://jin-di.top)
邮箱：yesme0215@live.com
