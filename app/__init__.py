from flask import Flask

app = Flask(__name__, static_folder='static')

@app.route('/')
def root():
    return app.send_static_file('index.html')
