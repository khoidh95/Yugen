(function () {
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#img-in-modal').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    function showhideAppend(showEles, hideEles, elevalue, appenInput) {
        for (var i = 0; i < showEles.length; i++) {
            $(showEles[i]).show();
        }
        for (var i = 0; i < hideEles.length; i++) {
            $(hideEles[i]).hide();
        }
        if (!elevalue || !appenInput) return;
        $(appenInput).val($(elevalue).html());
    }
    $('#displayName_btn_edit').click(function () {
        showhideAppend(['#displayName_edit'], ['#displayName_text', '#displayName_btn_edit'], '#displayName_text', '#displayName_input');
    });
    $('#displayName_btn_x').click(function () {
        showhideAppend(['#displayName_text', '#displayName_btn_edit'], ['#displayName_edit']);
    });
    $('#displayName_btn_v').click(function () {
        $.post("/user/editProfile", { displayName: $('#displayName_input').val().trim() }, function (data, status) {
            switch (data.message) {
                case 'have_error':
                    utils.alert({
                        title: 'Error',
                        msg: 'Something went wrong!'
                    });
                    break;
                case 'success':
                    utils.alert({
                        title: 'Notice',
                        msg: 'Your Display Name has changed!'
                    })
                    $('#displayName_text').html(data.displayName);
                    showhideAppend(['#displayName_text', '#displayName_btn_edit'], ['#displayName_edit']);
                    break;
            }
        });
    });
    $('#camera-upload').click(function () {
        $('#upload-img').click();
    });

    $("#upload-img").change(function () {
        var file = $("#upload-img")[0].files[0];
        var fileType = file["type"];
        var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
        if ($.inArray(fileType, ValidImageTypes) < 0) {
            //NOT A IMAGE
            $('#upload-img').val("");
            utils.alert({
                title: 'Error',
                msg: 'You must choose an image!'
            });
            return;
        }
        readURL(this);
        $('#review_upload_img').modal('show');
    });
    $('#review_upload_img').on('shown.bs.modal', function () {
        $('#img-in-modal').cropper({
            viewMode: 2,
            autoCropArea: 1,
            aspectRatio: 1 / 1
        });
    }).on('hidden.bs.modal', function () {
        $('#img-in-modal').cropper('destroy');
        $('#upload-img').val("");
    });

    $('#upload-btn').click(function () {
        var dataImg = $('#img-in-modal').cropper('getData');
        var c = document.getElementById("crop-canvas");
        var ctx = c.getContext("2d");
        var img = document.getElementById("img-in-modal");
        ctx.drawImage(img, dataImg.x, dataImg.y, dataImg.width, dataImg.height, 0, 0, 320, 320);
        var imageData = c.toDataURL('image/png', 1.0);
        var fileName = 'avatar.jpg';
        $.post("/user/editProfile",
            {
                fileName: fileName,
                imageData: imageData
            },
            function (data, status) {
                switch (data.message) {
                    case 'have_error':
                        setTimeout(function () {
                            utils.alert({
                                title: 'Error',
                                msg: 'Something went wrong!'
                            });
                        }, 500);
                        break;
                    case 'success':
                        setTimeout(function () {
                            utils.alert({
                                title: 'Notice',
                                msg: 'Your avatar has changed',
                                callback: function () {
                                    $('.avatar-image-root').attr("src", data.avatar + '?' + new Date().getTime());
                                }
                            })
                        }, 500);
                        break;
                }
                $('#upload-img').val("");
            });
    });

    // CHANGE PASSWORD
    $("#change_password_form").validate({
        rules: {
            old_password: {
                required: true,
                minlength: 6,
                maxlength: 18
            },
            new_password: {
                required: true,
                minlength: 6,
                maxlength: 18
            },
            new_confirm_password: {
                required: true,
                minlength: 6,
                maxlength: 18,
                equalTo: "#new_password"
            }
        },
        messages: {
            old_password: {
                required: "Please enter a password!",
                minlength: "Your password must contain at least 6 characters long!",
                maxlength: "Your password is too long!"

            },
            new_password: {
                required: "Please enter a new password!",
                minlength: "Your new password must contain at least 6 characters long!",
                maxlength: "Your new password is too long!"

            },
            new_confirm_password: {
                required: "Please enter a confirm password!",
                equalTo: "Your confirm password is not match with your password!"
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
    $("#changepass_btn").click(function () {
        if (!$("#change_password_form").valid()) return;
        var old_password = $('#old_password').val();
        var new_password = $('#new_password').val();
        var new_confirm_password = $('#new_confirm_password').val();
        $.post("/user/changepasswordwithsession", { old_password: old_password, new_password: new_password, new_confirm_password: new_confirm_password }, function (data, status) {
            $('#changepass_modal').modal('hide');
            switch (data.message) {
                case 'password_not_correct':
                    utils.alert({
                        title: 'Error',
                        msg: 'Wrong password!'
                    })
                    break;
                case 'have_error':
                    utils.alert({
                        title: 'Error',
                        msg: 'something went wrong!'
                    })
                    break;
                case 'success':
                    utils.alert({
                        title: 'Notice',
                        msg: 'Your password has changed!'
                    })
                    break;
            }
        });
    });
    $('#changepass_modal').on('hidden.bs.modal', function () {
        var old_password = $('#old_password').val('');
        var new_password = $('#new_password').val('');
        var new_confirm_password = $('#new_confirm_password').val('');
    });
})();