module.exports = {
	makeRoom: function(req, cb){
		var _uid = req.session.passport.user;
		var _sid = sails.sockets.getId(req);
		Online.query(query.listSocketFriend([_uid]), [], function(err, socs){
			for(var i = 0 ; i < socs.length; i ++){
				sails.sockets.join(socs[i].socketId, 'rank-queue-' + _uid);
			}
			
			sails.sockets.join(_sid, 'rank-queue-' + _uid);
			cb();
		});
	},
	destroyRoom: function(_uid, cb){
		sails.sockets.removeRoomMembersFromRooms('rank-queue-' + _uid,['rank-queue-' + _uid], function(){
			cb();
		});
	},
	makePlay: function(req, cb){
		var _uid = req.session.passport.user;
		var _sid = sails.sockets.getId(req);
		Online.query(query.listSocketFriend([_uid]), [], function(err, socs){
			for(var i = 0 ; i < socs.length; i ++){
				sails.sockets.join(socs[i].socketId, 'play-' + _uid);
			}
			
			sails.sockets.join(_sid, 'play-' + _uid);
			cb();
		});
	},
	destroyPlay: function(_uid, cb){
		sails.sockets.removeRoomMembersFromRooms('play-' + _uid,['play-' + _uid], function(){
			cb();
		});
	},
	makeRoomFriend:function(id, cb){
		Online.query(query.listSocketFriend([id]), [], function(err, socs){
			for(var i = 0 ; i < socs.length; i ++){
				sails.sockets.join(socs[i].socketId, 'room-friend-' + id);
			}
			cb();
		});
	},
	sendMessageRoomFriend:function(id,message, parameter){
		sails.sockets.broadcast('room-friend-' + id,message, parameter);
	},
	destroyRoomFriend: function(_uid, cb){
		sails.sockets.removeRoomMembersFromRooms('room-friend-' + _uid,['room-friend-' + _uid], function(){
			cb();
		});
	},
};

