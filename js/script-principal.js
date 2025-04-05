$(document).ready(function() {
    // Verifica se o usuário está logado
    const user = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    if (!user) {
        window.location.href = 'login-cadastro.html';
        return;
    }

    // Elementos principais
    const columnsContainer = $('#columnsContainer');
    const taskModal = new bootstrap.Modal('#taskModal');
    const taskForm = $('#taskForm');
    const modalTitle = $('#modalTitle');
    const taskTitle = $('#taskTitle');
    const taskDescription = $('#taskDescription');
    const taskId = $('#taskId');
    const saveTaskBtn = $('#saveTaskBtn');

    // Estado da aplicação
    let currentColumnId = null;
    let isEditing = false;
    let currentTaskId = null;

    // Inicializa o quadro Kanban
    initKanban();

    // Evento para adicionar nova coluna
    $('#addColumnBtn').click(addNewColumn);

    // Evento para logout
    $('#logoutBtn').click(function() {
        sessionStorage.removeItem('usuarioLogado');
        window.location.href = 'login-cadastro.html';
    });

    // Função para inicializar o quadro
    function initKanban() {
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData')) || {
            columns: [
                { id: 'col1', title: 'Backlog', tasks: [] },
                { id: 'col2', title: 'Em Execução', tasks: [] },
                { id: 'col3', title: 'Concluído', tasks: [] }
            ]
        };
        
        localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
        renderColumns(kanbanData.columns);
        setupDragAndDrop();
    }

    // Renderiza todas as colunas
    function renderColumns(columns) {
        columnsContainer.empty();
        
        columns.forEach((column, index) => {
            const columnElement = $(`
                <div class="minagement-column" data-column-id="${column.id}">
                    <div class="column-header">
                        <div class="column-title" contenteditable="true">${column.title}</div>
                        <div class="column-actions">
                            ${index > 0 ? '<button class="move-btn move-left"><i class="fas fa-arrow-left"></i></button>' : ''}
                            ${index < columns.length - 1 ? '<button class="move-btn move-right"><i class="fas fa-arrow-right"></i></button>' : ''}
                            <button class="move-btn delete-column"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="tasks-list" data-column-id="${column.id}">
                        ${renderTasks(column.tasks)}
                    </div>
                    <button class="add-task-btn " data-column-id="${column.id}">
                        <i class="fas fa-plus"></i> Adicionar Tarefa
                    </button>
                </div>
            `);
            
            columnsContainer.append(columnElement);
        });

        // Configura eventos para a coluna
        $('.column-title').on('blur', updateColumnTitle);
        $('.move-left').click(moveColumnLeft);
        $('.move-right').click(moveColumnRight);
        $('.delete-column').click(deleteColumn);
        $('.add-task-btn').click(openAddTaskModal);
        $('.edit-task').click(openEditTaskModal);
        $('.delete-task').click(deleteTask);
    }

    // Renderiza as tarefas de uma coluna
    function renderTasks(tasks) {
        return tasks.map(task => `
            <div class="minagement_task" data-task-id="${task.id}" draggable="true">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-actions">
                        <button class="edit-task" data-task-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-task" data-task-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-description">${task.description || ''}</div>
            </div>
        `).join('');
    }

    // Adiciona nova coluna
    function addNewColumn() {
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData'));
        const newColumn = {
            id: 'col' + Date.now(),
            title: 'Nova Coluna',
            tasks: []
        };
        
        kanbanData.columns.push(newColumn);
        localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
        renderColumns(kanbanData.columns);
    }

    // Atualiza título da coluna
    function updateColumnTitle() {
        const newTitle = $(this).text();
        const columnId = $(this).closest('.minagement-column').data('column-id');
        
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData'));
        const column = kanbanData.columns.find(col => col.id === columnId);
        
        if (column) {
            column.title = newTitle;
            localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
        }
    }

    // Move coluna para esquerda
    function moveColumnLeft() {
        const columnElement = $(this).closest('.minagement-column');
        const columnId = columnElement.data('column-id');
        
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData'));
        const columnIndex = kanbanData.columns.findIndex(col => col.id === columnId);
        
        if (columnIndex > 0) {
            // Troca a coluna com a anterior
            [kanbanData.columns[columnIndex], kanbanData.columns[columnIndex - 1]] = 
            [kanbanData.columns[columnIndex - 1], kanbanData.columns[columnIndex]];
            
            localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
            renderColumns(kanbanData.columns);
        }
    }

    // Move coluna para direita
    function moveColumnRight() {
        const columnElement = $(this).closest('.minagement-column');
        const columnId = columnElement.data('column-id');
        
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData'));
        const columnIndex = kanbanData.columns.findIndex(col => col.id === columnId);
        
        if (columnIndex < kanbanData.columns.length - 1) {
            // Troca a coluna com a próxima
            [kanbanData.columns[columnIndex], kanbanData.columns[columnIndex + 1]] = 
            [kanbanData.columns[columnIndex + 1], kanbanData.columns[columnIndex]];
            
            localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
            renderColumns(kanbanData.columns);
        }
    }

    // Deleta coluna
    function deleteColumn() {
        if (!confirm('Tem certeza que deseja excluir esta coluna e todas as suas tarefas?')) {
            return;
        }
        
        const columnElement = $(this).closest('.minagement-column');
        const columnId = columnElement.data('column-id');
        
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData'));
        kanbanData.columns = kanbanData.columns.filter(col => col.id !== columnId);
        
        localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
        renderColumns(kanbanData.columns);
    }

    // Abre modal para adicionar tarefa
    function openAddTaskModal() {
        currentColumnId = $(this).data('column-id');
        isEditing = false;
        currentTaskId = null;
        
        taskForm.trigger('reset');
        modalTitle.text('Nova Tarefa');
        saveTaskBtn.text('Adicionar');
        taskModal.show();
    }

    // Abre modal para editar tarefa
    function openEditTaskModal() {
        const taskId = $(this).data('task-id');
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData'));
        
        let task = null;
        for (const column of kanbanData.columns) {
            task = column.tasks.find(t => t.id === taskId);
            if (task) {
                currentColumnId = column.id;
                break;
            }
        }
        
        if (task) {
            isEditing = true;
            currentTaskId = taskId;
            
            taskTitle.val(task.title);
            taskDescription.val(task.description || '');
            modalTitle.text('Editar Tarefa');
            saveTaskBtn.text('Salvar');
            taskModal.show();
        }
    }

    // Salva tarefa (nova ou edição)
    saveTaskBtn.click(function() {
        if (!taskTitle.val()) {
            alert('O título da tarefa é obrigatório!');
            return;
        }
        
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData'));
        const column = kanbanData.columns.find(col => col.id === currentColumnId);
        
        if (isEditing) {
            // Atualiza tarefa existente
            const task = column.tasks.find(t => t.id === currentTaskId);
            if (task) {
                task.title = taskTitle.val();
                task.description = taskDescription.val();
            }
        } else {
            // Adiciona nova tarefa
            const newTask = {
                id: 'task' + Date.now(),
                title: taskTitle.val(),
                description: taskDescription.val()
            };
            column.tasks.push(newTask);
        }
        
        localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
        renderColumns(kanbanData.columns);
        taskModal.hide();
    });

    // Deleta tarefa
    function deleteTask() {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
            return;
        }
        
        const taskId = $(this).data('task-id');
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData'));
        
        for (const column of kanbanData.columns) {
            const taskIndex = column.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                column.tasks.splice(taskIndex, 1);
                break;
            }
        }
        
        localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
        renderColumns(kanbanData.columns);
    }

    // Configura drag and drop
    function setupDragAndDrop() {
        $('.tasks-list').on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('drag-over');
        });
        
        $('.tasks-list').on('dragleave', function() {
            $(this).removeClass('drag-over');
        });
        
        $('.tasks-list').on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('drag-over');
            
            const taskId = e.originalEvent.dataTransfer.getData('text/plain');
            const newColumnId = $(this).data('column-id');
            
            moveTaskToColumn(taskId, newColumnId);
        });
        
        $('.minagement_task').on('dragstart', function(e) {
            e.originalEvent.dataTransfer.setData('text/plain', $(this).data('task-id'));
            $(this).addClass('dragging');
        });
        
        $('.minagement_task').on('dragend', function() {
            $(this).removeClass('dragging');
        });
    }

    // Move tarefa entre colunas
    function moveTaskToColumn(taskId, newColumnId) {
        const kanbanData = JSON.parse(localStorage.getItem('kanbanData'));
        let task = null;
        let oldColumnIndex = -1;
        let taskIndex = -1;
        
        // Encontra a tarefa na coluna antiga
        for (let i = 0; i < kanbanData.columns.length; i++) {
            const column = kanbanData.columns[i];
            taskIndex = column.tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex !== -1) {
                task = column.tasks[taskIndex];
                oldColumnIndex = i;
                break;
            }
        }
        
        if (!task) return;
        
        // Remove da coluna antiga
        kanbanData.columns[oldColumnIndex].tasks.splice(taskIndex, 1);
        
        // Adiciona na nova coluna
        const newColumn = kanbanData.columns.find(col => col.id === newColumnId);
        if (newColumn) {
            newColumn.tasks.push(task);
        }
        
        localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
        renderColumns(kanbanData.columns);
    }
});