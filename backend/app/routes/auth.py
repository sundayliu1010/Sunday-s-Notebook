from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User

# 创建蓝图
bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    """用户注册"""

    try:
        data = request.get_json()

        # 验证必需字段
        if not data or not all(k in data for k in ('username', 'email', 'password')):
            return jsonify({'message': '用户名、邮箱和密码都是必需的'}), 400

        # 检查用户名是否已存在
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': '用户名已存在'}), 400

        # 检查邮箱是否已存在
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': '邮箱已被注册'}), 400

        # 创建新用户
        user = User.from_dict(data)
        db.session.add(user)
        db.session.commit()

        current_app.logger.info(f'新用户注册成功: {user.username}')

        return jsonify({'message': '注册成功，请登录'}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'用户注册失败: {str(e)}')
        return jsonify({'message': '注册失败，请稍后重试'}), 500

@bp.route('/login', methods=['POST'])
def login():
    """用户登录"""

    try:
        data = request.get_json()

        # 验证必需字段
        if not data or not all(k in data for k in ('email', 'password')):
            return jsonify({'message': '邮箱和密码都是必需的'}), 400

        # 查找用户
        user = User.query.filter_by(email=data['email']).first()

        # 验证用户和密码
        if not user or not user.check_password(data['password']):
            return jsonify({'message': '邮箱或密码错误'}), 401

        # 创建访问令牌
        access_token = create_access_token(identity=user.id)

        current_app.logger.info(f'用户登录成功: {user.username}')

        return jsonify({
            'user': user.to_dict(),
            'token': access_token
        }), 200

    except Exception as e:
        current_app.logger.error(f'用户登录失败: {str(e)}')
        return jsonify({'message': '登录失败，请稍后重试'}), 500

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """获取当前用户信息"""

    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'message': '用户不存在'}), 404

        return jsonify({'user': user.to_dict()}), 200

    except Exception as e:
        current_app.logger.error(f'获取用户信息失败: {str(e)}')
        return jsonify({'message': '获取用户信息失败'}), 500