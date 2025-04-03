$(document).ready(function(){
    //toggle entre login e cadastro
    $('#loginToggle').click(function(){
        $(this).addClass('active');
        $('#cadastroToggle').removeClass('active');
        $('#loginForm').addClass('active');
        $('#cadastroForm').removeClass('active');
    });


    $('#cadastroToggle').click(function(){
        $(this).addClass('active');
        $('#loginToggle').removeClass('active');
        $('#cadastroForm').addClass('active');
        $('#loginForm').removeClass('active');
    });

    
})