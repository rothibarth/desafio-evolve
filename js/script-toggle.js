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

})