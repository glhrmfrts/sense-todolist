from app.models import Task
from flask import Blueprint, jsonify, request

task = Blueprint('task', __name__)

@task.route('/', methods=['GET'])
def get_list():
    order = request.args.get('order')
    completed = request.args.get('completed')

    query = Task.query
    if order is not None:
        for order_field in order.split(','):
            name, sort = order_field.split(':')
            query = query.order_by(name + " " + sort)

    if completed in ('false', 'true'):
        query = query.filter_by(completed=(completed == 'true'))

    tasks = query.all()
    return jsonify({'items': [t.serialize for t in tasks]})

@task.route('/', methods=['POST'])
def create_task():
    if request.content_type == 'application/json':
        data = request.get_json()
        task = Task(
            description=data['description'],
            due_date=data['due_date']
        )
        task.save()
        return ('', 200)

    return (
        jsonify({'error': 'Content-Type must be application/json'}),
        400
    )

@task.route('/<task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get(task_id)
    if task is None:
        return ('', 404)
    return jsonify(task.serialize)

@task.route('/<task_id>', methods=['PATCH'])
def edit_task(task_id):
    task = Task.query.get(task_id)
    if task is None:
        return ('', 404)

    if request.content_type == 'application/json':
        data = request.get_json()
        if 'completed' in data:
            task.completed = data['completed']
        if 'description' in data:
            task.description = data['description']
        if 'due_date' in data:
            task.due_date = data['due_date']
        task.save()
        return jsonify(task.serialize)

    return (
        jsonify({'error': 'Content-Type must be application/json'}),
        400
    )

@task.route('/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if task is not None:
        task.delete()

    return ('', 200)
