$(document).ready(function () {
    // Carrega dados do usuário
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === usuarioLogado.email);

    if (!usuario) {
        alert('Usuário não encontrado!');
        window.location.href = 'login-cadastro.html';
        return;
    }

    // Preenche formulário com dados do usuário
    $('#profileName').val(usuario.nome);
    $('#profileEmail').val(usuario.email);

    // Toggle para mostrar/esconder senha
    $('.toggle-password').click(function () {
        const input = $(this).prev('input');
        const type = input.attr('type') === 'password' ? 'text' : 'password';
        input.attr('type', type);
        $(this).toggleClass('fa-eye fa-eye-slash');
    });

    // Validação do formulário
    $('#profileForm').submit(function (e) {
        e.preventDefault();

        // Atualiza dados básicos
        usuario.nome = $('#profileName').val();
        usuario.email = $('#profileEmail').val();

        // Verifica se está alterando a senha
        if ($('#collapsePassword').hasClass('show')) {
            const atualPassword = $('#atualPassword').val();
            const newPassword = $('#newPassword').val();
            const confirmPassword = $('#confirmPassword').val();

            // Validações
            if (atualPassword !== usuario.senha) {
                alert('Senha atual incorreta!');
                return;
            }

            if (newPassword.length < 6) {
                alert('A nova senha deve ter no mínimo 6 caracteres!');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('As senhas não coincidem!');
                return;
            }

            // Atualiza senha
            usuario.senha = newPassword;
        }

        // Atualiza localStorage
        const usuarioIndex = usuarios.findIndex(u => u.email === usuarioLogado.email);
        usuarios[usuarioIndex] = usuario;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Atualiza sessionStorage
        sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));

        alert('Perfil atualizado com sucesso!');
    });

    // Logout
    $('#logoutBtn').click(function () {
        if (confirm('Tem certeza que deseja sair?')) {
            sessionStorage.removeItem('usuarioLogado');
            window.location.href = 'login-cadastro.html';
        }
    });
});