from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, ChatMessage

# 创建蓝图
bp = Blueprint('chat', __name__)

@bp.route('/chat', methods=['POST'])
@jwt_required()
def send_message():
    """发送聊天消息"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or 'message' not in data:
            return jsonify({'message': '消息内容是必需的'}), 400

        # 保存用户消息
        user_message = ChatMessage()
        user_message.user_id = user_id
        user_message.role = 'user'
        user_message.content = data['message']
        db.session.add(user_message)

        # TODO: 调用OpenAI API获取AI回复
        # 现在先返回一个模拟回复
        ai_response = "这是一个模拟的AI回复，稍后会接入真实的OpenAI API。"

        # 保存AI回复
        ai_message = ChatMessage()
        ai_message.user_id = user_id
        ai_message.role = 'assistant'
        ai_message.content = ai_response
        db.session.add(ai_message)

        db.session.commit()

        return jsonify({
            'user_message': user_message.to_dict(),
            'ai_response': {
                'role': 'assistant',
                'content': ai_response
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'发送聊天消息失败: {str(e)}')
        return jsonify({'message': '发送消息失败'}), 500

@bp.route('/chat/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    """获取聊天历史"""
    try:
        user_id = get_jwt_identity()
        messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.created_at.asc()).limit(50).all()

        return jsonify({
            'messages': [msg.to_dict() for msg in messages]
        }), 200

    except Exception as e:
        current_app.logger.error(f'获取聊天历史失败: {str(e)}')
        return jsonify({'message': '获取聊天历史失败'}), 500

@bp.route('/chat/history', methods=['DELETE'])
@jwt_required()
def clear_chat_history():
    """清空聊天历史"""
    try:
        user_id = get_jwt_identity()
        ChatMessage.query.filter_by(user_id=user_id).delete()
        db.session.commit()

        return jsonify({'message': '聊天历史已清空'}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'清空聊天历史失败: {str(e)}')
        return jsonify({'message': '清空聊天历史失败'}), 500