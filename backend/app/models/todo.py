from app import db
from datetime import datetime, date

class Todo(db.Model):
    """待办事项模型"""

    __tablename__ = 'todos'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    text = db.Column(db.String(500), nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    created_date = db.Column(db.Date, default=date.today, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Todo {self.text}>'

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'text': self.text,
            'is_completed': self.is_completed,
            'created_date': self.created_date.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @staticmethod
    def from_dict(data):
        """从字典创建待办事项对象"""
        todo = Todo()
        todo.text = data.get('text', '')
        todo.is_completed = data.get('is_completed', False)
        return todo