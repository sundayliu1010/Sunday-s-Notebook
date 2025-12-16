from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from config import config

# 初始化扩展
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_name='default'):
    """应用工厂函数"""

    # 创建Flask应用实例
    app = Flask(__name__)

    # 加载配置
    app.config.from_object(config[config_name])

    # 初始化扩展
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # 配置CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # 注册蓝图
    from app.routes import auth, notes, todos, chat, ai
    app.register_blueprint(auth.bp)
    app.register_blueprint(notes.bp, url_prefix='/api')
    app.register_blueprint(todos.bp, url_prefix='/api')
    app.register_blueprint(chat.bp, url_prefix='/api')
    app.register_blueprint(ai.bp, url_prefix='/api')

    # 注册错误处理器
    register_error_handlers(app)

    # 创建数据库表（仅在开发环境）
    if app.config['DEBUG']:
        with app.app_context():
            db.create_all()

    return app

def register_error_handlers(app):
    """注册错误处理器"""

    @app.errorhandler(400)
    def bad_request(error):
        return {'message': '请求参数错误'}, 400

    @app.errorhandler(401)
    def unauthorized(error):
        return {'message': '未授权访问'}, 401

    @app.errorhandler(403)
    def forbidden(error):
        return {'message': '禁止访问'}, 403

    @app.errorhandler(404)
    def not_found(error):
        return {'message': '资源未找到'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'message': '服务器内部错误'}, 500