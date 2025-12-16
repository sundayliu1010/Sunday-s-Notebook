# CLAUDE.md

这个文件为 Claude Code在这个代码库中工作时提供指导。

## 沟通语言要求
- **始终使用中文与用户沟通**，所有解释、注释和回复都使用简体中文
- **教育导向**：用户是编程初学者，刚开始使用 Claude Code，需要在编程过程中提供基础教育，让用户边用边学

## 项目概述

这是一个**AI智能生产力工作台**项目，产品需求文档在 `AI记事本产品需求` 文件中。这是一个全栈Web应用，集成了笔记记录、AI辅助、任务管理和时间管理功能。

### 核心功能模块
1. **用户认证系统** - 注册登录功能
2. **笔记管理系统** - 创建、编辑、删除笔记
3. **AI增强功能** - 文本润色、续写、智能洞察
4. **独立AI对话** - 可随时唤出的聊天窗口
5. **待办事项管理** - 全局任务列表
6. **番茄钟工具** - 时间管理和专注力工具

## 推荐技术栈

### 前端
- **Vue.js 3** + **Vite** - 现代前端框架和构建工具
- **Vue Router** - 页面路由管理
- **Pinia** - 状态管理
- **vue-draggable-resizable** - 拖拽组件库（用于番茄钟等小组件）

### 后端
- **Python** + **Flask** - 轻量级后端框架
- **Flask-RESTful** - RESTful API开发
- **Flask-SQLAlchemy** - ORM数据库操作
- **Flask-JWT-Extended** - JWT认证

### 数据库
- **SQLite** - 开发阶段
- **PostgreSQL** - 生产环境

### 第三方服务
- **OpenAI API** - 所有AI功能的提供方

## 项目结构建议

```
notebook2.0/
├── frontend/                 # Vue.js 前端项目
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── services/       # API 调用服务
│   │   └── utils/          # 工具函数
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Flask 后端项目
│   ├── app/
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── requirements.txt
│   └── config.py
├── AI记事本产品需求        # 产品需求文档
└── CLAUDE.md              # 本文件
```

## 开发命令

### 前端（待创建）
```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 运行测试
npm run test
```

### 后端（待创建）
```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 运行开发服务器
flask run

# 运行测试
python -m pytest
```

## API架构概览

### RESTful API 端点
- **认证**: `/auth/register`, `/auth/login`
- **笔记**: `/api/notes` (CRUD操作)
- **AI辅助**: `/api/ai/polish`, `/api/ai/continue`, `/api/ai/insight`
- **AI对话**: `/api/chat`, `/api/chat/history`
- **待办事项**: `/api/todos`
- **用户设置**: `/api/user/settings`

### 数据模型
- **users** - 用户信息和设置
- **notes** - 笔记内容
- **todos** - 待办事项
- **chat_messages** - AI对话历史

## 开发规范与最佳实践

### 文档驱动开发（DDD）
- **开发前**：先写设计文档或技术方案
- **开发中**：为每个模块添加清晰的注释和文档字符串
- **开发后**：更新README和相关文档

### 代码组织原则
- 前端组件按功能分类（页面组件、业务组件、基础组件）
- 后端按业务模块组织（models, routes, services分离）
- API设计遵循RESTful规范
- 数据库设计遵循第三范式

### 安全要求
- 所有密码必须哈希加盐存储
- API接口（除登录注册外）都需要JWT认证
- 用户输入必须进行数据清洗，防止XSS和SQL注入

## 开发路线图

### 阶段一：基础功能（v1.0）
1. 环境搭建和项目初始化
2. 用户认证系统
3. 笔记CRUD功能

### 阶段二：AI增强（v1.5）
1. 集成OpenAI API
2. 实现AI润色、续写、洞察功能

### 阶段三：生产力工具（v2.0）
1. 待办事项管理
2. 番茄钟功能
3. AI对话功能
4. 整体优化和测试