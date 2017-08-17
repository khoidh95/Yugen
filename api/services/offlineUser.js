var query =  require('../services/query.js');
var socRQ =  require('../services/SocRQ.js');
module.exports = {
	closeTab:function(socket,session, cb) {
		var req = {session: session};
		if(!require('../services/checkSession.js')(req)) return cb();
		Online.destroy({socketId:socket.id}).exec(function (err) {
			var listIdFriend = [];
			let broadCastImOffline = function(){
		    	return new Promise(function(fullfill, reject){
		    		User.query(query.listFriendId(session.passport.user), [], function(err, data){
			    		if(err) return reject(err);
			    		for(var i = 0; i < data.length; i++){
			    			listIdFriend.push(data[i].friendId);
			    		}
			    		if(listIdFriend.length == 0) return fullfill();
			    		User.query(query.listSocketFriend(listIdFriend), [], function(err, data){
			    			if(err) return reject(err);
			    			var listSocketFriend = [];
			    			for(var i = 0; i < data.length; i++){
				    			listSocketFriend.push(data[i].socketId);
				    		}
				    		if(listSocketFriend.length == 0) return fullfill();
				    		Online.count({userId:session.passport.user}).exec(function(err, count){
				    			if(err) return reject(err);
				    			if(count!=0) return fullfill();
				    			User.query(query.myProfile(session.passport.user), [], function(err, data){
					    			if(err) return reject(err);
					    			sails.sockets.broadcast(listSocketFriend, 'friendOffline', data[0]);
					    			return fullfill();
					    		});
				    		});
		    			});
			    	});
		    	})
		    }
		    let broadcastFriendGameRequest = function(){
		    	return new Promise(function(fullfill, reject){
		    		if(sails.config.globals.roomGame['play-friend-request-' + session.passport.user]){
			    		User.query(query.listSocketFriend([session.passport.user]), [], function(err, data){
			    			if(data.length == 0){
			    				socRQ.sendMessageRoomFriend(sails.config.globals.roomGame['play-friend-request-' + session.passport.user],'friend-game-invite-cancel',{userId:session.passport.user});
			    				delete sails.config.globals.roomGame['play-friend-request-' + session.passport.user];
			    			}
			    			return fullfill();
			    		})
		    		}
		    		return fullfill();
		    	})
		    }
		    let broadcastRank = function(){
		    	return new Promise(function(fullfill, reject){
		    		var index = sails.config.globals.rankQueue.indexOf(session.passport.user);
		    		if(index < 0) return fullfill();
		    		User.query(query.listSocketFriend([session.passport.user]), [], function(err, data){
		    			if(data.length == 0){
		    				
		    				sails.config.globals.rankQueue.splice(index,1);
		    			}
		    			return fullfill();
		    		})
		    	})
		    }
		    broadCastImOffline().then(broadcastFriendGameRequest).then(broadcastRank).then(function(){
		    	cb();
		    }).catch(function(err){
				cb();
		    })
		});		
	},
	logout: function(req, cb){
		Online.destroy({userId:req.session.passport.user}).exec(function (err) {
			var listIdFriend = [];
			let broadCastImOffline = function(){
		    	return new Promise(function(fullfill, reject){
		    		User.query(query.listFriendId(req.session.passport.user), [], function(err, data){
			    		if(err) return reject(err);
			    		for(var i = 0; i < data.length; i++){
			    			listIdFriend.push(data[i].friendId);
			    		}
			    		if(listIdFriend.length == 0) return fullfill();
			    		User.query(query.listSocketFriend(listIdFriend), [], function(err, data){
			    			if(err) return reject(err);
			    			var listSocketFriend = [];
			    			for(var i = 0; i < data.length; i++){
				    			listSocketFriend.push(data[i].socketId);
				    		}
				    		if(listSocketFriend.length == 0) return fullfill();
				    		User.query(query.myProfile(req.session.passport.user), [], function(err, data){
					    			if(err) return reject(err);
					    			sails.sockets.broadcast(listSocketFriend, 'friendOffline', data[0]);
					    			return fullfill();
				    		});
		    			});
			    	});
		    	})
		    }
		    let broadcastFriendGameRequest = function(){
		    	return new Promise(function(fullfill, reject){
		    		if(sails.config.globals.roomGame['play-friend-request-' + req.session.passport.user]){
	    				socRQ.sendMessageRoomFriend(sails.config.globals.roomGame['play-friend-request-' + req.session.passport.user],'friend-game-invite-cancel',{userId:req.session.passport.user});
	    				delete sails.config.globals.roomGame['play-friend-request-' + req.session.passport.user];
		    		}
		    		return fullfill();
		    	})
		    }
		    let broadcastRank = function(){
		    	return new Promise(function(fullfill, reject){
		    		var index = sails.config.globals.rankQueue.indexOf(req.session.passport.user);
		    		if(index >= 0) sails.config.globals.rankQueue.splice(index,1);
		    		return fullfill();
		    	})
		    }
		    broadCastImOffline().then(broadcastFriendGameRequest).then(broadcastRank).then(function(){
		    	cb();
		    }).catch(function(err){
				cb();
		    })
		});	
	}
}