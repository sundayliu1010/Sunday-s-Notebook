from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    """用户模型"""

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # 番茄钟设置
    pomodoro_work_duration = db.Column(db.Integer, default=25)  # 工作时长（分钟）
    pomodoro_short_break_duration = db.Column(db.Integer, default=5)  # 短休息时长（分钟）
    pomodoro_long_break_duration = db.Column(db.Integer, default=15)  # 长休息时长（分钟）

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    notes = db.relationship('Note', backref='author', lazy=True, cascade='all, delete-orphan')
    todos = db.relationship('Todo', backref='user', lazy=True, cascade='all, delete-orphan')
    chat_messages = db.relationship('ChatMessage', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        """设置密码（加密存储）"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'pomodoro_work_duration': self.pomodoro_work_duration,
            'pomodoro_short_break_duration': self.pomodoro_short_break_duration,
            'pomodoro_long_break_duration': self.pomodoro_long_break_duration,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @staticmethod
    def from_dict(data):
        """从字典创建用户对象"""
        user = User()
        user.username = data.get('username')
        user.email = data.get('email')
        user.set_password(data.get('password'))
        return user