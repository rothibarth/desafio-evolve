$(document).ready(function () {

    //função para salvar o usuario no localStorage
    function salvarUsuario(usuario) {
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        usuarios.push(usuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    //função para verificar login
    function verificarLogin(email, senha) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        return usuarios.find(user => user.email === email && user.senha === senha);
    }


    //toggle entre login e cadastro
    $('#loginToggle').click(function () {
        $(this).addClass('active');
        $('#cadastroToggle').removeClass('active');
        $('#loginForm').addClass('active');
        $('#cadastroForm').removeClass('active');
    });


    $('#cadastroToggle').click(function () {
        $(this).addClass('active');
        $('#loginToggle').removeClass('active');
        $('#cadastroForm').addClass('active');
        $('#loginForm').removeClass('active');
    });

    // Toggle para mostrar/esconder senha
    function setupPasswordToggle(toggleId, inputId) {
        $(toggleId).click(function () {
            const input = $(inputId);
            if (input.attr('type') === 'password') {
                input.attr('type', 'text');
                $(this).removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                input.attr('type', 'password');
                $(this).removeClass('fa-eye-slash').addClass('fa-eye');
            }
        });
    }

    setupPasswordToggle('#toggleLoginPassword', '#loginPassword');
    setupPasswordToggle('#toggleCadastroPassword', '#cadastroPassword');
    setupPasswordToggle('#toggleCadastroConfirmPassword', '#cadastroConfirmPassword');

    //validação confirmação de senha

    $('#cadastroPassword', '#cadastroConfirmPassword').on('input', function () {
        const password = $('#cadastroPassword').val();
        const confirmPassword = $('#cadastroConfirmPassword').val();

        if (password !== confirmPassword && confirmPassword !== '') {
            $('#cadastroConfirmPassword').addClass('is-invalid');
        } else {
            $('#cadastroConfirmPassword').removeClass('is-invalid');
        }
    });

    //validacao do formulario de cadastro
    $('#cadastroForm').submit(function (e) {
        e.preventDefault();

        //limpeza das validações anteriores
        $(this).find('.is-invalid').removeClass('is-invalid');
        let isValid = true;

        // Validação básica dos campos
        $(this).find('[required]').each(function () {
            if (!$(this).val()) {
                $(this).addClass('is-invalid');
                isValid = false;
            }
        });



        // Validação  especificas
        const password = $('#cadastroPassword').val();
        const confirmPassword = $('#cadastroConfirmPassword').val();


        if (password.length < 6) {
            $('#cadastroPassword').addClass('is-invalid');
            isValid = false;
        }

        if (password !== confirmPassword) {
            $('#cadastroConfirmPassword').addClass('is-invalid');
            isValid = false;
        }


        if (isValid) {

            const novoUsuario = {
                nome: $('#cadastroName').val(),
                email: $('#cadastroEmail').val(),
                senha: password
            };

            salvarUsuario(novoUsuario);
            alert('Cadastro realizado com sucesso!');
            $('#cadastroForm')[0].reset();
            $('#loginToggle').click(); // volta para o login

        }
    });

    //validação formulario de login
    $('#loginForm').submit(function(e){
        e.preventDefault();

        $(this).find('.is-invalid').removeClass('is-invalid');
        let isValid = true;

        // Validação básica
        $(this).find('[required]').each(function () {
            if (!$(this).val()) {
                $(this).addClass('is-invalid');
                isValid = false;
            }
        });

        if(isValid){
            const email = $('#loginEmail').val();
            const senha = $('#loginPassword').val();
            const usuario = verificarLogin(email, senha);

            if(usuario){
                //salva usuario logado na sessão
                sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));

                //redireciona para a pagina principal
                window.location.href = './principal.html';
            }else{
                alert('Email ou senha incorretos!');
                $('#loginPassword').addClass('is-invalid');
            }
        }
    });

});