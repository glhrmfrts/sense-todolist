from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__, static_folder='static')

app_settings = os.getenv(
    'APP_SETTINGS',
    'app.config.DevelopmentConfig'
)
app.config.from_object(app_settings)

db = SQLAlchemy(app)

@app.route('/')
def root():
    return app.send_static_file('index.html')

from app.task.views import task
app.register_blueprint(task, url_prefix='/task')
