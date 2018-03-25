from flask import Blueprint, jsonify

task = Blueprint('task', __name__)

@task.route('/task/', methods=['GET'])
def get_list():
    return jsonify({'tasks': []})

@task.route('/task/', methods=['POST'])
def add_task():
    return jsonify({'result': True})
