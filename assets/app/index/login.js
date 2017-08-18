$(function () {
    $('.button-checkbox').each(function () {
        // Settings
        var $widget = $(this),
            $button = $widget.find('button'),
            $checkbox = $widget.find('input:checkbox'),
            color = $button.data('color'),
            settings = {
                on: {
                    icon: 'glyphicon glyphicon-check'
                },
                off: {
                    icon: 'glyphicon glyphicon-unchecked'
                }
            };

        // Event Handlers
        $button.on('click', function () {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
            $checkbox.triggerHandler('change');
            updateDisplay();
        });
        $checkbox.on('change', function () {
            updateDisplay();
        });
        // Actions
        function updateDisplay() {
            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $button.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $button.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$button.data('state')].icon);

            // Update the button's color
            if (isChecked) {
                $button
                    .removeClass('btn-default')
                    .addClass('btn-' + color + ' active');
            }
            else {
                $button
                    .removeClass('btn-' + color + ' active')
                    .addClass('btn-default');
            }
        }
        // Initialization
        function init() {
            updateDisplay();
            // Inject the icon if applicable
            if ($button.find('.state-icon').length == 0) {
                $button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i>');
            }
        }
        init();
    });

    $.fn.scrollingMenu = function () {
        var menu = $(this);
        var lastScrollTop = 0;

        // update menu on load
        updateMenu();

        // update menu on scroll
        $(window).scroll(function () {
            updateMenu();
        });

        function updateMenu() {
            var begin_ht = 35, mid_ht = 75, end_ht = 115, gap_ht = 10;
            var st = $(window).scrollTop();
            if (st > lastScrollTop) { // downscroll
                if (st >= begin_ht && st < begin_ht + gap_ht) {
                    menu.css({
                        "background-color": "rgba(43, 61, 82, 0.3)"
                    });
                } else if (st >= mid_ht && st < mid_ht + gap_ht) {
                    menu.css({
                        "background-color": "rgba(43, 61, 82, 0.5)"
                    });
                } else if (st >= end_ht) {
                    menu.css({
                        "background-color": "rgba(43, 61, 82, 1)"
                    });
                }
            } else { // upscroll
                if (st <= mid_ht + gap_ht && st > mid_ht) {
                    menu.css({
                        "background-color": "rgba(40, 46, 66, 0.7)"
                    });
                } else if (st <= begin_ht + gap_ht && st > begin_ht) {
                    menu.css({
                        "background-color": "rgba(40, 46, 66, 0.3)"
                    });
                } else if (st <= begin_ht) {
                    menu.css({
                        "background-color": "rgba(40, 46, 66, 0)"
                    });
                }
            }
            lastScrollTop = st;
        }
    };
    
    $('#navbar-login').scrollingMenu();

    $('.change-to-register').click(function () {
        $('.register-panel').removeClass('animated');
        $('.register-panel').removeClass('fadeInLeft');
        $('.register-panel').removeClass('fadeInRight');
        $('.login-panel').hide();
        $('.register-panel').show();
        $('.register-panel').addClass('animated');
        $('.register-panel').addClass('fadeInLeft');
        $('html, body').animate({
            scrollTop: $("#login-section").offset().top
        }, 2000);
    })
    $('.change-to-login').click(function () {
        $('.register-panel').removeClass('animated');
        $('.register-panel').removeClass('fadeInLeft');
        $('.register-panel').removeClass('fadeInRight');
        $('.register-panel').hide();
        $('.login-panel').show();
        $('.login-panel').addClass('animated');
        $('.login-panel').addClass('fadeInRight');
        $('html, body').animate({
            scrollTop: $("#login-section").offset().top
        }, 2000);
    })
});
$(document).ready(function () {
    if ($.url().param('register_message')) {
        $('.login-panel').hide();
        $('.register-panel').show();
        if ($.url().param('register_message') == 'emailexist') {
            $('#email').val($.url().param('email'));
            $('#displayName').val($.url().param('displayname'));
            utils.alert({
                title: 'Error',
                msg: 'Email is existed!'
            })
        }
    }
    if ($.url().param('login_message')) {
        $('.login-panel').show();
        $('.register-panel').hide();
        $('#login_email').val($.url().param('email'));
        $('#login_password').val('');
        if($.url().param('login_message') == 'email_not_found'){
            utils.alert({
                title:'Error',
                msg: 'Email not found!'
            })
        }
        if($.url().param('login_message') == 'not_admin'){
            utils.alert({
                title:'Error',
                msg: 'You do not have permission to access!'
            })
        }
        if($.url().param('login_message') == 'account_not_active'){
            utils.alert({
                title:'Error',
                msg: "Your email is not activated yet!"
            })
        }
        if($.url().param('login_message') == 'password_not_correct'){
            utils.alert({
                title:'Error',
                msg: 'Wrong password!'
            })
        }
    }

    jQuery.validator.addMethod("isEmail", function (value, element) {
        var x = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        console.log('sa')
        if (x.test(value)) {
            return true;  // FAIL validation when REGEX matches
        } else {
            return false;   // PASS validation otherwise
        };
    }, "");

    jQuery.validator.addMethod("twoSpace", function (value, element) {
        if (/\s\s+/.test(value)) {
            return false;  // FAIL validation when REGEX matches
        } else {
            return true;   // PASS validation otherwise
        };
    }, "");
    $("#signupForm").validate({
        rules: {
            email: {
                required: true,
                minlength: 5,
                maxlength: 45,
                isEmail: true
            },
            displayName: {
                required: true,
                minlength: 2,
                maxlength: 45,
                twoSpace: true
            },
            password: {
                required: true,
                minlength: 6,
                maxlength: 18,
                twoSpace: true
            },
            password_confirmation: {
                required: true,
                minlength: 6,
                maxlength: 18,
                equalTo: "#password"
            },
            agree: {
                required: true
            }
        },
        messages: {
            email: {
                required: "Please enter an email!",
                minlength: "Your email must contain at least 5 characters!",
                maxlength: "Your email is too long!",
                isEmail: "Invalid email!"
            },
            displayName: {
                required: "Please enter a display name!",
                minlength: "Your display name must contain at least 2 characters!",
                maxlength: "Your display name is too long!",
                twoSpace: "Invalid display name!"
            },
            password: {
                required: "Please enter a password!",
                minlength: "Your password must contain at least 6 characters!",
                maxlength: "Your password is too long!",
                twoSpace: "Invalid password!"
            },
            password_confirmation: {
                required: "Please enter a confirm password!",
                equalTo: "Your confirm password is not match with your password!"
            },
            agree: {
                required: "Please accept our Terms and Conditions!"
            }
        },
        errorElement: "em",
        errorPlacement: function (error, element) {
            // Add the `help-block` class to the error element
            error.addClass("help-block");

            if (element.prop("type") === "checkbox") {
                error.insertAfter(element.parent("label"));
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element, errorClass, validClass) {
            $(element).parents(".col-sm-5").addClass("has-error").removeClass("has-success");
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).parents(".col-sm-5").addClass("has-success").removeClass("has-error");
        }
    });
    $("#signinForm").validate({
        rules: {
            login_email: {
                required: true,
                isEmail: true
            },
            login_password: {
                required: true,
                twoSpace: true
            }
        },
        messages: {
            login_email: {
                required: "Please enter an email!",
                isEmail: "Invalid email!"
            },
            login_password: {
                required: "Please enter a password!",
                twoSpace: "Invalid password!"
            }
        },
        errorElement: "em",
        errorPlacement: function ( error, element ) {
            // Add the `help-block` class to the error element
            error.addClass( "help-block" );

            if ( element.prop( "type" ) === "checkbox" ) {
                error.insertAfter( element.parent( "label" ) );
            } else {
                error.insertAfter( element );
            }
        },
        highlight: function ( element, errorClass, validClass ) {
            $( element ).parents( ".col-sm-5" ).addClass( "has-error" ).removeClass( "has-success" );
        },
        unhighlight: function (element, errorClass, validClass) {
            $( element ).parents( ".col-sm-5" ).addClass( "has-success" ).removeClass( "has-error" );
        }
    });
    $("#active_send_btn").click(function () {
        var email = $('#active_email').val().trim();
        var password = $('#active_password').val().trim();
        $.post("/user/reverify", { email: email, password: password }, function (data, status) {
            //console.log(data)
            switch (data.message) {
                case 'email_not_found':
                    utils.alert({
                        title: 'Error',
                        msg: 'Email not found!'
                    })
                    break;
                case 'password_not_correct':
                    utils.alert({
                        title: 'Error',
                        msg: 'Wrong password!'
                    })
                    break;
                case 'email_actived':
                    utils.alert({
                        title: 'Error',
                        msg: 'Your email is activated!'
                    })
                    break;
                case 'have_error':
                    utils.alert({
                        title: 'Error',
                        msg: 'Something went wrong!'
                    })
                    break;
                case 'success':
                    utils.alert({
                        title: 'Notice',
                        msg: 'We sent a new activate link to your email!'
                    })
                    break;
            }
        });
    });
    $("#forgot_send_btn").click(function () {
        var email = $('#forgot_password_email').val().trim();
        $.post("/user/forgot", { email: email }, function (data, status) {
            switch (data.message) {
                case 'email_not_found':
                    utils.alert({
                        title: 'Error',
                        msg: 'Email not found!'
                    })
                    break;
                case 'have_error':
                    utils.alert({
                        title: 'Error',
                        msg: 'Something went wrong!'
                    })
                    break;
                case 'success':
                    utils.alert({
                        title: 'Notice',
                        msg: 'We sent a change password link to your email!'
                    })
                    break;
            }
        });
    });
});