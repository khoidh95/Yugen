var app = angular.module('indexApp', ['ui.bootstrap', 'ngSanitize']);
app.filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});
$(function () {
    $('.popovers').popover();
    window.setTimeout(function () {
        $(".alert").fadeTo(2000, 500).slideUp(300, function () {
            $(this).remove();
        });
    }, 5000);
    $(".menu-friend-toggle").click(function (e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
    var friendIdSearch;
    $('#search-friend-modal').on('hidden.bs.modal', function () {
        $('#friend-search-result').hide();
        $('#friend-search-result-notfound').hide();
        $('#search-friend-input').val('');
    });
    $('#search-friend-btn').click(function () {
        $.post("/relationship/searchfriend", { friendId: $('#search-friend-input').val().trim() }, function (data, status) {
            switch (data.message) {
                case 'have_error':
                    setTimeout(function () {
                        utils.alert({
                            title: 'Error',
                            msg: 'Something went wrong!'
                        });
                    }, 500);
                    break;
                case 'user_not_found':
                    $('#friend-search-result').hide();
                    $('#friend-search-result-notfound').show();
                    break;
                case 'success':
                    $('#friend-search-result-notfound').hide();
                    $('#friend-search-result').show();
                    $('#friend-search-result-displayName').html(data.user.displayName);
                    $('#friend-search-result-avatar').attr('src', data.user.avatar);
                    friendIdSearch = data.user.id;
                    if (data.user.status == 0) {
                        $('#search-addFriend-btn').show();
                        $('#search-addFriend-btn-seen').hide();
                        $('#search-addFriend-btn-accept').hide();
                        $('#search-addFriend-btn-destroy').hide();
                        $('#search-addFriend-btn-isFriend').hide();
                    }
                    else if (data.user.status == 1) {
                        if (data.user.userIs == 1) {
                            $('#search-addFriend-btn').hide();
                            $('#search-addFriend-btn-seen').show();
                            $('#search-addFriend-btn-destroy').show();
                            $('#search-addFriend-btn-accept').hide();
                            $('#search-addFriend-btn-isFriend').hide();
                        } else {
                            $('#search-addFriend-btn').hide();
                            $('#search-addFriend-btn-seen').hide();
                            $('#search-addFriend-btn-accept').show();
                            $('#search-addFriend-btn-destroy').show();
                            $('#search-addFriend-btn-isFriend').hide();
                        }
                    }
                    else if (data.user.status == 2) {
                        if (data.user.userIs == 2) {
                            $('#search-addFriend-btn').hide();
                            $('#search-addFriend-btn-seen').show();
                            $('#search-addFriend-btn-destroy').show();
                            $('#search-addFriend-btn-accept').hide();
                            $('#search-addFriend-btn-isFriend').hide();
                        } else {
                            $('#search-addFriend-btn').hide();
                            $('#search-addFriend-btn-seen').hide();
                            $('#search-addFriend-btn-accept').show();
                            $('#search-addFriend-btn-destroy').show();
                            $('#search-addFriend-btn-isFriend').hide();
                        }
                    } else {
                        $('#search-addFriend-btn').hide();
                        $('#search-addFriend-btn-seen').hide();
                        $('#search-addFriend-btn-accept').hide();
                        $('#search-addFriend-btn-destroy').hide();
                        $('#search-addFriend-btn-isFriend').show();
                    }
                    break;
            }
        });
    });
    $('#search-addFriend-btn').click(function () {
        io.socket.post('/relationship/addfriend', { friendId: friendIdSearch }, function (data, jwres) {
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
                    $('#search-addFriend-btn').hide();
                    $('#search-addFriend-btn-seen').show();
                    $('#search-addFriend-btn-destroy').show();
                    $('#search-addFriend-btn-isFriend').hide();
                    break;
            }
        });
    });
    $('#search-addFriend-btn-destroy').click(function () {
        $.post('/relationship/deletefriend', { friendId: friendIdSearch }, function (data, status) {
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
                    $('#search-addFriend-btn').show();
                    $('#search-addFriend-btn-seen').hide();
                    $('#search-addFriend-btn-destroy').hide();
                    $('#search-addFriend-btn-accept').hide();
                    $('#search-addFriend-btn-isFriend').hide();
                    break;
            }
        });
    });
    $('#search-addFriend-btn-accept').click(function () {
        $.post('/relationship/acceptfriend', { friendId: friendIdSearch }, function (data, status) {
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
                    $('#search-addFriend-btn').hide();
                    $('#search-addFriend-btn-seen').hide();
                    $('#search-addFriend-btn-destroy').hide();
                    $('#search-addFriend-btn-accept').hide();
                    $('#search-addFriend-btn-isFriend').show();
                    break;
            }
        });
    });
});

(function () {
    /*MODULE ANGULAR for side bar*/
    app.controller('indexCtr', function ($scope, $http) {
        function isContainFriend(list, id) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].id == id) return true;
            }
            return false;
        }
        function removeFriend(list, id) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].id == id) {
                    list.splice(i, 1);
                }
            }
            return list;
        }
        $scope.acceptFriendRq = function (friendId) {
            $.post('/relationship/acceptfriend', { friendId: friendId }, function (data, status) {
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
                        $scope.listFriendRequest = removeFriend($scope.listFriendRequest, friendId);
                        $scope.getData()
                        $scope.$apply();
                        break;
                }
            });
        }
        $scope.refuseFriendRq = function (friendId) {
            $.post('/relationship/deletefriend', { friendId: friendId }, function (data, status) {
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
                        $scope.listFriendRequest = removeFriend($scope.listFriendRequest, friendId);
                        $scope.listFriendOffline = removeFriend($scope.listFriendOffline, friendId);
                        $scope.listFriendOnline = removeFriend($scope.listFriendOnline, friendId);
                        $scope.$apply();
                        break;
                }
            });
        }
        $scope.deleteFriendRq = function (friendId, friendName) {
            utils.confirm({
                title: 'Notice',
                msg: 'Do you want to remove ' + friendName + ' from your friend list?',
                okText: 'Yes',
                cancelText: 'No',
                callback: function () {
                    $.post('/relationship/deletefriend', { friendId: friendId }, function (data, status) {
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
                                $scope.listFriendRequest = removeFriend($scope.listFriendRequest, friendId);
                                $scope.listFriendOffline = removeFriend($scope.listFriendOffline, friendId);
                                $scope.listFriendOnline = removeFriend($scope.listFriendOnline, friendId);
                                $scope.$apply();
                                break;
                        }
                    });
                }
            });

        }
        $scope.getData = function () {
            io.socket.get('/online', function gotResponse(data, jwRes) {
                $scope.listFriendOnline = data.listFriendOnline;
                $scope.listFriendOffline = data.listFriendOffline;
                $scope.listFriendRequest = data.listFriendRequest;
                $scope.$apply();
            });
        }
        $scope.getData();
        io.socket.on('friendOnline', function (data) {
            if (!isContainFriend($scope.listFriendOnline, data.id)) {
                $scope.listFriendOnline.unshift(data);
                $scope.listFriendOffline = removeFriend($scope.listFriendOffline, data.id);
            }
            $scope.$apply();
        });
        io.socket.on('friendOffline', function (data) {
            if (!isContainFriend($scope.listFriendOffline, data.id)) {
                $scope.listFriendOffline.unshift(data);
                $scope.listFriendOnline = removeFriend($scope.listFriendOnline, data.id);
            }
            $scope.$apply();
        });

        io.socket.on('friendRequest', function (data) {
            $scope.listFriendRequest.unshift(data);
            $scope.$apply();
            utils.friendRequest({
                avatar: data.avatar,
                displayName: data.displayName
            });
        });

        io.socket.on('friendDelete', function (data) {
            $scope.listFriendRequest = removeFriend($scope.listFriendRequest, data.id);
            $scope.listFriendOnline = removeFriend($scope.listFriendOnline, data.id);
            $scope.listFriendOffline = removeFriend($scope.listFriendOffline, data.id);
            $scope.$apply();
        });
        //HISTORY AND TOP 10 CODE
        $scope.history_friend = {
            current: 0,
            limit: 5,
            data: [],
            pages: 0
        };
        $scope.history_rank = {
            current: 0,
            limit: 5,
            data: [],
            pages: 0
        };
        $scope.top10 = [];
        $scope.loadTop10 = function () {
            $http.post("/rank/top10", {}, {}).then(function (res) {
                if (res.data.message == 'success') {
                    $scope.top10 = res.data.top10;
                }
            });
        }
        $scope.loadHistoryRank = function () {
            $scope.loadTop10();
            var skip = $scope.history_rank.current * $scope.history_rank.limit;
            $http.post("/game/history", { mode: 1, skip: skip, limit: $scope.history_rank.limit }, {}).then(function (res) {
                if (res.data.message == 'success') {
                    $scope.history_rank.data = res.data.history;
                    $scope.history_rank.pages = Math.ceil(res.data.count / $scope.history_rank.limit);
                } else {

                }
            });
        }
        $scope.nextRankHistory = function () {
            if ($scope.history_rank.current >= $scope.history_rank.pages - 1) return;
            $scope.history_rank.current++;
            $scope.loadHistoryRank();
        }
        $scope.preRankHistory = function () {
            if ($scope.history_rank.current <= 0) return;
            $scope.history_rank.current--;
            $scope.loadHistoryRank();
        }
        $scope.loadFriendHistory = function () {
            var skip = $scope.history_friend.current * $scope.history_friend.limit;
            $http.post("/game/history", { mode: 2, skip: skip, limit: $scope.history_friend.limit }, {}).then(function (res) {
                if (res.data.message == 'success') {
                    $scope.history_friend.data = res.data.history;
                    $scope.history_friend.pages = Math.ceil(res.data.count / $scope.history_friend.limit);
                } else {

                }
            });
        }
        $scope.nextFriendHistory = function () {
            if ($scope.history_friend.current >= $scope.history_friend.pages - 1) return;
            $scope.history_friend.current++;
            $scope.loadFriendHistory();
        }
        $scope.preFriendHistory = function () {
            if ($scope.history_friend.current <= 0) return;
            $scope.history_friend.current--;
            $scope.loadFriendHistory();
        }
        //BOOK MARK CODE
        $scope.createBookmark = function (questionId) {
            $http.post("/user/bookmark/create", { questionId: questionId }, {}).then(function (res) {
                switch (res.data.message) {
                    case 'success':
                        utils.alert({
                            title: 'Notice',
                            msg: 'Done!'
                        });
                        break;
                    case 'already_bookmark':
                        utils.alert({
                            title: 'Error',
                            msg: 'This question is bookmarked!'
                        });
                        break;
                }
            });
        }
        //REPORT CODE
        $scope.report = {
            questionId: undefined,
            questionContent: '',
            content: ''
        }
        $scope.openReportModal = function (questionId, questionContent) {
            $scope.report.content = '';
            $scope.report.questionId = questionId;
            $scope.report.questionContent = questionContent;
            $('#report-create-modal').modal('show');
        }
        $scope.createReport = function () {
            if ($scope.report.content.trim().length == 0) {
                utils.alert({
                    title: 'Error',
                    msg: 'Please enter report content!'
                });
                return;
            }
            if ($scope.report.content.trim().length > 1000) {
                utils.alert({
                    title: 'Error',
                    msg: 'Content is too long!'
                });
                return;
            }
            $http.post("/report/create", { questionId: $scope.report.questionId, content: $scope.report.content.trim() }, {}).then(function (res) {
                if (res.data.message == 'success') {
                    $('#report-create-modal').modal('hide');
                    utils.alert({
                        title: 'Notice',
                        msg: "Thanks for your feedback! We'll review this question."
                    });
                }
            });
        }
        //RANK CODE
        $scope.isWaitingRank = false;
        $scope.codeRank;
        $scope.rankQueue = {};
        $scope.requestRank = function(){
            io.socket.post('/game/rank/register', function responseFromServer (body, res) {
                if(res.body.message == 'success'){
                    $scope.isWaitingRank = true;
                }else if(res.body.message == 'you_are_in_game'){
                    $scope.backToGameNoti();
                }else if(res.body.message == 'not_enough_question'){
                    utils.alert({
                        title:'Error',
                        msg: "Sorry! We don't have enough question."
                    });
                }
                $scope.$apply();
            });
        }
        $scope.initRank = function () {
            io.socket.post('/game/rank/init', {}, function (body, res) {
                if (res.body.message == 'in_queue') {
                    $scope.isWaitingRank = true;
                }
                $scope.$apply();
            });
        }
        $scope.initRank();
        $scope.cancelRank = function () {
            io.socket.post('/game/rank/cancel', { code: $scope.codeRank }, function responseFromServer(body, res) {
                if (res.body.message == 'have_err') {
                    utils.alert({
                        title: 'Error',
                        msg: 'Something went wrong!'
                    });
                }
                $scope.codeRank = undefined;
            });
        }
        $scope.joinGame = function () {
            io.socket.post('/game/rank/joingame', { code: $scope.codeRank }, function (res, jwres) {
                if (res.message == 'have_err') {
                    utils.alert({
                        title: 'Error',
                        msg: 'Something went wrong'
                    });
                    $('#rank-request-modal').modal('hide');
                } else if (res.message == 'in_room') {
                    $('#rank-request-modal .modal-footer').hide();
                }
                $scope.$apply();
            });
        }
        io.socket.on('registerRank', function (msg) {
            $scope.isWaitingRank = true;
            $scope.$apply();
        });

        io.socket.on('acceptARank', function (msg) {
            $scope.codeRank = msg.code;
            $scope.rankQueue.me = msg.me;
            $scope.rankQueue.compatitor = msg.compatitor;
            $('#rank-request-modal').modal('show');
            $('#rank-request-modal .modal-footer').show();
            $scope.$apply();
            console.log($scope.rankQueue)
        });

        io.socket.on('cancelRankQueue', function (msg) {
            if (msg.message == 'success') $scope.isWaitingRank = false;
            $('#rank-request-modal').modal('hide');
            if (msg.registerAgain) $scope.requestRank(); 
            $scope.$apply();
        });

        io.socket.on('startGame', function (msg) {
            if (window.location.pathname != '/play') {
                window.location.href = window.location.origin + '/play';
            }
        });

        //PLAY WITH FRIEND CODE
        $scope.invite = {
            sender: [],
            type: 'kanji',
            jlpt: 'N1',
            id: undefined
        }

        $scope.playWithFriendRequest= function(friendId){
            io.socket.post('/game/playwithfriendrequest', {friendId:$scope.invite.id, jlpt:$scope.invite.jlpt, type:$scope.invite.type}, function (res, jwres){
                console.log(res.message)
                if(res.message == 'have_err'){
                    utils.alert({
                        title:'Error',
                        msg: 'Somthing went wrong!'
                    });
                    return;
                }else if(res.message == 'not_enough_question'){
                    utils.alert({
                        title:'Error',
                        msg: "Sorry! We don't have enough question."
                    });
                    return;
                }else if(res.message == 'user_is_playing'){
                    $scope.backToGameNoti();
                    return;
                }else if(res.message == 'friend_is_playing'){
                    utils.alert({
                        title:'Notice',
                        msg: 'Your friend is playing other game.'
                    });
                    return;
                }else if(res.message == 'not_online'){
                    utils.alert({
                        title:'Notice',
                        msg: 'Your friend is offline.'
                    });
                    return;
                }
                $scope.$apply();
            });
        }
        $scope.playWithFriendCancel = function () {
            io.socket.post('/game/playwithfriendcancel', {}, function (res, jwres) {
                if (res.message == 'success') $('#friend-invite-success-modal').modal('hide');
            });
        }
        $scope.cancelRequestPlayWithFriend = function (friendId) {
            io.socket.post('/game/playwithfriendcancel', { friendId: friendId }, function (res, jwres) {
                if (res.message == 'success') {
                    for (var i = 0; i < $scope.invite.sender.length; i++) {
                        if ($scope.invite.sender[i].id == friendId) {
                            $scope.invite.sender.splice(i, 1);
                        }
                    }
                    $scope.$apply();
                }
            });
        }
        $scope.acceptRequestPlayWithFriend = function (friendId, i) {
            console.log($scope.invite.sender[i])
            io.socket.post('/game/playWithfriendjoin', { friendId: friendId, type: $scope.invite.sender[i].game.type, jlpt: $scope.invite.sender[i].game.jlpt }, function (res, jwres) {
            });
        }
        $scope.playWithFriendInit = function (friendId) {
            io.socket.post('/game/playWithfriendinit', {}, function (res, jwres) {
                if (res.message == 'in_request') {
                    $('#friend-invite-success-modal').modal('show');
                    $scope.$apply();
                }
            });
        }
        $scope.playWithFriendInit();


        io.socket.on('friend-game-invite-success', function (msg) {
            $('#friend-invite-success-modal').modal('show');
        });

        io.socket.on('friend-game-invite', function (msg) {
            $scope.invite.sender.push(msg.sender);
            $scope.$apply();
        });
        io.socket.on('friend-game-invite-cancel', function (msg) {
            for (var i = 0; i < $scope.invite.sender.length; i++) {
                if ($scope.invite.sender[i].id == msg.userId) {
                    $scope.invite.sender.splice(i, 1);
                }
            }
            $scope.$apply();
        });
        io.socket.on('friend-game-invite-refuse', function (msg) {
            utils.alert({
                title: 'Notice',
                msg: 'Your invite is refused!'
            });
            $('#friend-invite-success-modal').modal('hide');
        });
        io.socket.on('friend-game-invite-im-cancel', function (msg) {
            $('#friend-invite-success-modal').modal('hide');
        });
        io.socket.on('friend-game-invite-im-refuse', function (msg) {
            for (var i = 0; i < $scope.invite.sender.length; i++) {
                if ($scope.invite.sender[i].id == msg.friendId) {
                    $scope.invite.sender.splice(i, 1);
                }
            }
            $scope.$apply();
        });
        io.socket.on('join-game-friend', function (msg) {
            window.location.href = window.location.origin + '/play';
        });

        //TEST
        $scope.test = {
            jlpt: 'N5'
        }
        $scope.createTest = function () {
            $http.post("/test/create", { jlpt: $scope.test.jlpt }, {}).then(function (res) {
                console.log(res.data)
                if (res.data.message == 'success') {
                    window.location.href = window.location.origin + '/test';
                } else {
                    if (res.data.err == 'is_testing') {
                        utils.confirm({
                            title: 'Notice',
                            msg: "You haven't finished the test yet.Do you want to come back?",
                            okText: 'Go to test',
                            callback: function () {
                                window.location.href = window.location.origin + '/test';
                            }
                        });
                    } else if (res.data.err == 'not_enough_question') {
                        utils.alert({
                            title: 'Error',
                            msg: "Sorry! We don't have enough question."
                        });
                    }
                }
            });
        }
        $scope.history_test = {
            current: 0,
            limit: 5,
            data: [],
            pages: 0
        };
        $scope.loadHistoryTest = function () {
            $scope.loadTop10();
            var skip = $scope.history_test.current * $scope.history_test.limit;
            $http.post("/test/history", { skip: skip, limit: $scope.history_test.limit }, {}).then(function (res) {
                console.log(res)
                if (res.data.message == 'success') {
                    $scope.history_test.data = res.data.history;
                    $scope.history_test.pages = Math.ceil(res.data.count / $scope.history_test.limit);
                }
            });
        }
        $scope.nextTestHistory = function () {
            if ($scope.history_test.current >= $scope.history_test.pages - 1) return;
            $scope.history_test.current++;
            $scope.loadHistoryTest();
        }
        $scope.preTestHistory = function () {
            if ($scope.history_test.current <= 0) return;
            $scope.history_test.current--;
            $scope.loadHistoryTest();
        }

        //CODE XU LY PHAN ICON QUAY LAI GAME SAU KHI RA INDEX VA CAC TRANG KHAC
        $scope.indexIsPlaying = false;
        $scope.isPlaying = function () {
            $http.post("/game/isplaying", {}, {}).then(function (res) {
                if (res.data.message == 'user_not_playing') {
                    $scope.indexIsPlaying = false;
                } else if (res.data.message == 'user_is_playing') {
                    $scope.indexIsPlaying = true;
                }
            });
        }
        $scope.backToGameNoti = function () {
            utils.confirm({
                title: 'Notice',
                msg: "You haven't finished the match. Do you want to come back?",
                okText: 'Yes',
                cancelText: 'No',
                callback: function () {
                    window.location.href = window.location.origin + '/play';
                }
            });
        }
        io.socket.on('finishGame', function (data) {
            $scope.indexIsPlaying = false;
            console.log('finish')
            $scope.$apply();
        });
        $scope.isPlaying();
    });

    $(document).ready(function () {
        $('div#hide-1').removeAttr('id');
        $('ul#hide-1').removeAttr('id');
    });
})();