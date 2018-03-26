from app import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    completed = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    description = db.Column(db.Text, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)

    def __init__(self, description, due_date):
        self.description = description
        self.due_date = due_date

    @property
    def serialize(self):
        return {
            'id': self.id,
            'completed': self.completed,
            'created_at': self.created_at.strftime("%Y-%m-%dT%H:%M:%S"),
            'description': self.description,
            'due_date': self.due_date.strftime("%Y-%m-%dT%H:%M:%S")
        }

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
