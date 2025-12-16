import os
from app import create_app

# 从环境变量获取配置，默认为开发环境
config_name = os.getenv('FLASK_ENV', 'development')

# 创建应用实例
app = create_app(config_name)

if __name__ == '__main__':
    # 开发环境下运行
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=True
    )