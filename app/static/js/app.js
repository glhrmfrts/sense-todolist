angular.module('app', [])
    .service('TaskService', function($http) {
        var config = {
            headers: {
                "Content-Type": "application/json"
            }
        };

        return {
            getList: function(order, completed) {
                var params = {order: order};
                if (completed !== null) {
                    params.completed = completed;
                }
                return $http.get('/task/', {params: params});
            },

            create: function(data) {
                return $http.post('/task/', data, config);
            },

            get: function(id) {
                return $http.get('/task'/ + id);
            },

            patch: function(id, data) {
                return $http.patch('/task/' + id, data, config);
            },

            delete: function(id) {
                return $http.delete('/task/' + id);
            }
        };
    })
    .service('EventService', function() {
        var listeners = {};

        function getListeners(e) {
            if (!listeners.hasOwnProperty(e)) {
                listeners[e] = [];
            }

            return listeners[e];
        }

        return {
            emit: function() {
                var evt = arguments[0];
                var args = Array.prototype.slice.call(arguments, 1);

                var listeners = getListeners(evt);
                listeners.forEach(function(l) {
                    l.apply(null, args);
                });
            },

            listen: function(evt, l) {
                var listeners = getListeners(evt);
                listeners.push(l);
            }
        };
    })
    .filter('dateToISO', function() {
        return function(date) {
            var spl = date.split('/');
            return new Date(spl.reverse().join('-')).toISOString();
        };
    })
    .filter('dateFromISO', function() {
        return function(date) {
            var spl = date.split('T').shift().split('-');
            return spl.reverse().join('/');
        };
    })
    .filter('taskDate', function() {
        var months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Set', 'Oct', 'Nov', 'Dec'
        ];
        function isToday(now, date) {
            return (
                now.getDate() == date.getDate() &&
                now.getMonth() == date.getMonth() &&
                now.getFullYear() == date.getFullYear()
            );
        }

        function isYesterday(now, date) {
            return (
                (now.getDate() - date.getDate() == 1) &&
                now.getMonth() == date.getMonth() &&
                now.getFullYear() == date.getFullYear()
            );
        }

        function isTomorrow(now, date) {
            return (
                (now.getDate() - date.getDate() == -1) &&
                now.getMonth() == date.getMonth() &&
                now.getFullYear() == date.getFullYear()
            );
        }

        return function(isoDate) {
            var date = new Date(isoDate);
            var dateNow = new Date();
            if (isToday(dateNow, date)) {
                return 'Today';
            }
            if (isYesterday(dateNow, date)) {
                return 'Yesterday';
            }
            if (isTomorrow(dateNow, date)) {
                return 'Tomorrow';
            }

            var result = [
                months[date.getMonth()],
                date.getDate().toString(),
                date.getFullYear().toString()
            ].join(' ');
            return result;
        }
    })
    .controller('TaskListController', function($scope, TaskService, EventService) {
        $scope.order = 'completed:asc,due_date:asc';
        $scope.tasks = [];
        $scope.toggleTask = toggleTask;
        $scope.editTask = editTask;

        function init() {
            getTasks();

            $('#viewTaskState').on('changed.bs.select', function() {
                getTasks();
            });
        }

        function getTasks() {
            var viewStates = $('#viewTaskState').selectpicker('val');
            var completed = null;
            if (viewStates.length == 1) {
                if (viewStates[0] == 'complete') {
                    completed = true;
                } else if (viewStates[0] == 'incomplete') {
                    completed = false;
                }
            }

            TaskService.getList($scope.order, completed)
                .then(function(result) {
                    $scope.tasks = result.data.items;
                });
        }

        function toggleTask(task) {
            var data = {
                completed: !task.completed
            };
            TaskService.patch(task.id, data)
                .then(function(result) {
                    if (result.status != 200) {
                        return console.error(result);
                    }

                    getTasks();
                });
        }

        function editTask(task) {
            EventService.emit('task_edit', task);
        }

        init();

        EventService.listen('get_tasks', getTasks);
    })
    .controller('AddTaskController', function($scope, $filter, TaskService, EventService) {
        $scope.task = {};
        $scope.submit = submit;

        function submit() {
            var errored = false;
            if (!$scope.task.description) {
                toastr.error('Missing task description!');
                errored = true;
            }
            if (!$scope.task.due_date) {
                toastr.error('Missing task due date!');
                errored = true;
            }

            if (errored) return;

            var data = {
                description: $scope.task.description,
                due_date: $filter('dateToISO')($scope.task.due_date)
            };

            TaskService.create(data)
                .then(function(result) {
                    if (result.status != 200) {
                        return console.error(result);
                    }

                    $('#addTaskModal').modal('hide');
                    $scope.task = {};
                    EventService.emit('get_tasks');
                });
        }
    })
    .controller('EditTaskController', function($scope, $filter, TaskService, EventService) {
        var $modal = $('#editTaskModal');

        $scope.task = {};
        $scope.deleteTask = deleteTask;
        $scope.submit = submit;

        function taskEdit(task) {
            $scope.task = {
                id: task.id,
                description: task.description,
                due_date: $filter('dateFromISO')(task.due_date)
            };
            $modal.modal('show');
        }

        function deleteTask() {
            TaskService.delete($scope.task.id)
                .then(function(result) {
                    $scope.task = {};
                    $modal.modal('hide');
                    EventService.emit('get_tasks');
                });
        }

        function submit() {
            var errored = false;
            if (!$scope.task.description) {
                toastr.error('Missing task description!');
                errored = true;
            }
            if (!$scope.task.due_date) {
                toastr.error('Missing task due date!');
                errored = true;
            }

            if (errored) return;

            var data = {
                description: $scope.task.description,
                due_date: $filter('dateToISO')($scope.task.due_date)
            };

            TaskService.patch($scope.task.id, data)
                .then(function(result) {
                    if (result.status != 200) {
                        return console.error(result);
                    }

                    $modal.modal('hide');
                    $scope.task = {};
                    EventService.emit('get_tasks');
                });
        }

        EventService.listen('task_edit', taskEdit);
    });
