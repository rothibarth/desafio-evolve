$(document).ready(function () {
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

    //validacao dos formularios
    $('form').submit(function (e) {
        e.preventDefault();

        //limpeza das validações anteriores
        $(this).find('.is-invalid').removeClass('is-invalid');

        let isValid = true;
        const form = $(this);

        // Validação básica dos campos
        form.find('[required]').each(function () {
            if (!$(this).val()) {
                $(this).addClass('is-invalid');
                isValid = false;
            }
        });

        // Validação  para o formulário de cadastro
        if (form.attr('id') === 'cadastroForm') {
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
        }

        if (isValid) {
            alert('Formulário válido! Em uma aplicação real, seria enviado para o servidor.');
        }
    })




})