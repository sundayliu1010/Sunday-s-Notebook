from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Note

# 创建蓝图
bp = Blueprint('notes', __name__)

@bp.route('/notes', methods=['GET'])
@jwt_required()
def get_all_notes():
    """获取用户的所有笔记"""

    try:
        user_id = get_jwt_identity()
        notes = Note.query.filter_by(user_id=user_id).order_by(Note.updated_at.desc()).all()

        return jsonify({
            'notes': [note.to_dict() for note in notes]
        }), 200

    except Exception as e:
        current_app.logger.error(f'获取笔记列表失败: {str(e)}')
        return jsonify({'message': '获取笔记列表失败'}), 500

@bp.route('/notes/<int:note_id>', methods=['GET'])
@jwt_required()
def get_note(note_id):
    """获取单篇笔记"""

    try:
        user_id = get_jwt_identity()
        note = Note.query.filter_by(id=note_id, user_id=user_id).first()

        if not note:
            return jsonify({'message': '笔记不存在'}), 404

        return jsonify({'note': note.to_dict()}), 200

    except Exception as e:
        current_app.logger.error(f'获取笔记失败: {str(e)}')
        return jsonify({'message': '获取笔记失败'}), 500

@bp.route('/notes', methods=['POST'])
@jwt_required()
def create_note():
    """创建新笔记"""

    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or 'title' not in data or 'content' not in data:
            return jsonify({'message': '标题和内容都是必需的'}), 400

        # 创建笔记
        note = Note.from_dict(data)
        note.user_id = user_id

        db.session.add(note)
        db.session.commit()

        current_app.logger.info(f'用户 {user_id} 创建了笔记: {note.title}')

        return jsonify({'note': note.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'创建笔记失败: {str(e)}')
        return jsonify({'message': '创建笔记失败'}), 500

@bp.route('/notes/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    """更新笔记"""

    try:
        user_id = get_jwt_identity()
        note = Note.query.filter_by(id=note_id, user_id=user_id).first()

        if not note:
            return jsonify({'message': '笔记不存在'}), 404

        data = request.get_json()

        if not data:
            return jsonify({'message': '请提供更新数据'}), 400

        # 更新字段
        if 'title' in data:
            note.title = data['title']
        if 'content' in data:
            note.content = data['content']

        db.session.commit()

        current_app.logger.info(f'用户 {user_id} 更新了笔记: {note.title}')

        return jsonify({'note': note.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'更新笔记失败: {str(e)}')
        return jsonify({'message': '更新笔记失败'}), 500

@bp.route('/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    """删除笔记"""

    try:
        user_id = get_jwt_identity()
        note = Note.query.filter_by(id=note_id, user_id=user_id).first()

        if not note:
            return jsonify({'message': '笔记不存在'}), 404

        db.session.delete(note)
        db.session.commit()

        current_app.logger.info(f'用户 {user_id} 删除了笔记: {note.title}')

        return jsonify({'message': '笔记已删除'}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'删除笔记失败: {str(e)}')
        return jsonify({'message': '删除笔记失败'}), 500