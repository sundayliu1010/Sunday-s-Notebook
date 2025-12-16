from app import db
from datetime import datetime

class ChatMessage(db.Model):
    """聊天消息模型"""

    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user' 或 'assistant'
    content = db.Column(db.Text, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<ChatMessage {self.role}: {self.content[:50]}>'

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role': self.role,
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }

    @staticmethod
    def from_dict(data):
        """从字典创建聊天消息对象"""
        message = ChatMessage()
        message.role = data.get('role', 'user')
        message.content = data.get('content', '')
        return message