from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Todo

# 创建蓝图
bp = Blueprint('todos', __name__)

@bp.route('/todos', methods=['GET'])
@jwt_required()
def get_todos():
    """获取用户的待办事项列表"""
    try:
        user_id = get_jwt_identity()
        # 获取所有未完成的待办事项，以及最近7天内完成的
        from datetime import date, timedelta
        seven_days_ago = date.today() - timedelta(days=7)

        todos = Todo.query.filter(
            Todo.user_id == user_id,
            db.or_(
                Todo.is_completed == False,
                db.and_(
                    Todo.is_completed == True,
                    Todo.created_date >= seven_days_ago
                )
            )
        ).order_by(Todo.is_completed, Todo.created_at.desc()).all()

        return jsonify({
            'todos': [todo.to_dict() for todo in todos]
        }), 200

    except Exception as e:
        current_app.logger.error(f'获取待办事项失败: {str(e)}')
        return jsonify({'message': '获取待办事项失败'}), 500

@bp.route('/todos', methods=['POST'])
@jwt_required()
def create_todo():
    """创建新的待办事项"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or 'text' not in data:
            return jsonify({'message': '待办事项内容是必需的'}), 400

        todo = Todo.from_dict(data)
        todo.user_id = user_id

        db.session.add(todo)
        db.session.commit()

        return jsonify({'todo': todo.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'创建待办事项失败: {str(e)}')
        return jsonify({'message': '创建待办事项失败'}), 500

@bp.route('/todos/<int:todo_id>', methods=['PUT'])
@jwt_required()
def update_todo(todo_id):
    """更新待办事项状态"""
    try:
        user_id = get_jwt_identity()
        todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()

        if not todo:
            return jsonify({'message': '待办事项不存在'}), 404

        data = request.get_json()
        if 'is_completed' in data:
            todo.is_completed = data['is_completed']

        db.session.commit()
        return jsonify({'todo': todo.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'更新待办事项失败: {str(e)}')
        return jsonify({'message': '更新待办事项失败'}), 500