$(function () {
    // Verificação de login
    if (!JSON.parse(sessionStorage.getItem('usuarioLogado'))) {
        window.location.href = 'login-cadastro.html';
        return;
    }

    // Elementos e estado
    const $elements = {
        container: $('#columnsContainer'),
        modal: new bootstrap.Modal('#taskModal'),
        form: $('#taskForm'),
        title: $('#modalTitle'),
        taskTitle: $('#taskTitle'),
        taskDesc: $('#taskDescription'),
        taskId: $('#taskId'),
        saveBtn: $('#saveTaskBtn')
    };
    let state = { colId: null, isEditing: false, taskId: null, draggedTask: null };

    // Inicialização
    const minagementData = JSON.parse(localStorage.getItem('minagementData')) || {
        columns: ['Backlog', 'Em Execução', 'Concluído'].map((title, i) => ({
            id: `col${i + 1}`, title, tasks: []
        }))
    };
    localStorage.setItem('minagementData', JSON.stringify(minagementData));

    // Eventos principais
    $('#addColumnBtn').click(() => addColumn('Nova Coluna'));
    $('#logoutBtn').click(() => {
        sessionStorage.removeItem('usuarioLogado');
        window.location.href = 'login-cadastro.html';
    });
    $elements.saveBtn.click(saveTask);

    // Renderização inicial
    renderColumns();
    setupDragAndDrop();

    // Funções principais
    function renderColumns() {
        $elements.container.empty().append(minagementData.columns.map((col, i) => `
            <div class="minagement-column" data-column-id="${col.id}">
                <div class="column-header">
                    <div class="column-title" contenteditable>${col.title}</div>
                    <div class="column-actions">
                        ${i > 0 ? '<button class="move-btn move-left"><i class="fas fa-arrow-left"></i></button>' : ''}
                        ${i < minagementData.columns.length - 1 ? '<button class="move-btn move-right"><i class="fas fa-arrow-right"></i></button>' : ''}
                        <button class="move-btn delete-column"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="tasks-list" data-column-id="${col.id}">
                    ${col.tasks.map(task => `
                        <div class="minagement_task" data-task-id="${task.id}" draggable="true">
                            <div class="task-header">
                                <div class="task-title">${task.title}</div>
                                <div class="task-actions">
                                    <button class="edit-task" data-task-id="${task.id}"><i class="fas fa-edit"></i></button>
                                    <button class="delete-task" data-task-id="${task.id}"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            <div class="task-description">${task.description || ''}</div>
                        </div>
                    `).join('')}
                </div>
                <button class="add-task-btn" data-column-id="${col.id}">
                    <i class="fas fa-plus"></i> Adicionar Tarefa
                </button>
            </div>
        `));

        // Delegation de eventos
        $('.column-title').on('blur', updateTitle);
        $('.move-left, .move-right, .delete-column').click(handleColumnAction);
        $('.add-task-btn, .edit-task, .delete-task').click(handleTaskAction);
    }

    function handleColumnAction(e) {
        const $btn = $(e.currentTarget);
        const colId = $btn.closest('.minagement-column').data('column-id');
        const colIndex = minagementData.columns.findIndex(c => c.id === colId);

        if ($btn.hasClass('delete-column')) {
            if (confirm('Excluir esta coluna e todas as tarefas?')) {
                minagementData.columns.splice(colIndex, 1);
            }
        } else if ($btn.hasClass('move-left') && colIndex > 0) {
            [minagementData.columns[colIndex], minagementData.columns[colIndex - 1]] =
                [minagementData.columns[colIndex - 1], minagementData.columns[colIndex]];
        } else if ($btn.hasClass('move-right') && colIndex < minagementData.columns.length - 1) {
            [minagementData.columns[colIndex], minagementData.columns[colIndex + 1]] =
                [minagementData.columns[colIndex + 1], minagementData.columns[colIndex]];
        }

        saveAndRender();
    }

    function handleTaskAction(e) {
        const $btn = $(e.currentTarget);
        const taskId = $btn.data('task-id');
        state.colId = $btn.closest('.minagement-column, .add-task-btn').data('column-id');

        if ($btn.hasClass('delete-task')) {
            if (confirm('Excluir esta tarefa?')) {
                const col = minagementData.columns.find(c => c.id === state.colId);
                col.tasks = col.tasks.filter(t => t.id !== taskId);
                saveAndRender();
            }
        } else if ($btn.hasClass('add-task-btn')) {
            state.isEditing = false;
            $elements.form.trigger('reset');
            $elements.title.text('Nova Tarefa');
            $elements.saveBtn.text('Adicionar');
            $elements.modal.show();
        } else if ($btn.hasClass('edit-task')) {
            const task = minagementData.columns.flatMap(c => c.tasks).find(t => t.id === taskId);
            if (task) {
                state.isEditing = true;
                state.taskId = taskId;
                $elements.taskTitle.val(task.title);
                $elements.taskDesc.val(task.description || '');
                $elements.title.text('Editar Tarefa');
                $elements.saveBtn.text('Salvar');
                $elements.modal.show();
            }
        }
    }

    function saveTask() {
        if (!$elements.taskTitle.val()) return alert('Título obrigatório!');

        const col = minagementData.columns.find(c => c.id === state.colId);
        if (state.isEditing) {
            const task = col.tasks.find(t => t.id === state.taskId);
            if (task) {
                task.title = $elements.taskTitle.val();
                task.description = $elements.taskDesc.val();
            }
        } else {
            col.tasks.push({
                id: 'task' + Date.now(),
                title: $elements.taskTitle.val(),
                description: $elements.taskDesc.val()
            });
        }

        $elements.modal.hide();
        saveAndRender();
    }

    function addColumn(title) {
        minagementData.columns.push({
            id: 'col' + Date.now(),
            title,
            tasks: []
        });
        saveAndRender();
    }

    function updateTitle() {
        const colId = $(this).closest('.minagement-column').data('column-id');
        const col = minagementData.columns.find(c => c.id === colId);
        if (col) col.title = $(this).text();
        localStorage.setItem('minagementData', JSON.stringify(minagementData));
    }

    function setupDragAndDrop() {
        $(document)
            .on('dragstart', '.minagement_task', function (e) {
                state.draggedTask = $(this);
                e.originalEvent.dataTransfer.setData('text/plain', $(this).data('task-id'));
                $(this).addClass('drag_drop');
            })
            .on('dragend', '.minagement_task', function () {
                $(this).removeClass('drag_drop');
                $('.tasks-list').removeClass('drag-over');
            })
            .on('dragover drop', '.tasks-list', function (e) {
                e.preventDefault();
                e.type === 'dragover'
                    ? $(this).addClass('drag-over')
                    : moveTask(
                        e.originalEvent.dataTransfer.getData('text/plain'),
                        $(this).data('column-id')
                    );
            })
            .on('dragleave', '.tasks-list', function () {
                $(this).removeClass('drag-over');
            });
    }

    function moveTask(taskId, newColId) {
        const oldCol = minagementData.columns.find(c => c.tasks.some(t => t.id === taskId));
        const task = oldCol?.tasks.find(t => t.id === taskId);
        if (task) {
            oldCol.tasks = oldCol.tasks.filter(t => t.id !== taskId);
            minagementData.columns.find(c => c.id === newColId)?.tasks.push(task);
            saveAndRender();
        }
    }

    function saveAndRender() {
        localStorage.setItem('minagementData', JSON.stringify(minagementData));
        renderColumns();
    }
});