from app.task.views import task
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, static_folder='static')
db = SQLAlchemy(app)

@app.route('/')
def root():
    return app.send_static_file('index.html')

app.register_blueprint(task)
