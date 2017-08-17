/**
 * OnlineController
 *
 * @description :: Server-side logic for managing onlines
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var query =  require('../services/query.js');
var countLevel = require('../services/countLevel.js');
module.exports = {
	online: function (req, res) {
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var userId = req.session.passport.user;
		var listIdFriend = [];
		var listFriendOnline = [];
		var listFriendOffline = [];
		var listFriendRequest = [];
	    let makeUserOnline = function(){
	    	return new Promise(function(fullfill, reject){
	    		Online.findOrCreate({socketId: sails.sockets.getId(req)}, {socketId:sails.sockets.getId(req), userId:req.session.passport.user})
	    		.exec(function(err, createdOrFoundRecords){
	    			if(err)	return reject(err);
	    			return fullfill();
	    		});
	    	})
	    }

	    let getUserOnline = function(){
	    	return new Promise(function(fullfill, reject){
	    		User.query(query.listFriendId(userId), [], function(err, data){
		    		if(err) return reject(err);
		    		for(var i = 0; i < data.length; i++){
		    			listIdFriend.push(data[i].friendId);
		    		}
		    		if(listIdFriend.length == 0) return fullfill();
		    		User.query(query.listFriendOnline(listIdFriend), [], function(err, data){
		    			if(err) return reject(err);
		    			listFriendOnline = data;
		    			for(var i = 0; i < listFriendOnline.length; i++){
		    				listFriendOnline[i].level = countLevel(listFriendOnline[i].level)
		    			}
		    			return fullfill();
		    		});
		    	});
	    	})
	    }

	    let getUserOffline = function(){
	    	return new Promise(function(fullfill, reject){
	    		if(listIdFriend.length == 0) return fullfill();
		    		User.query(query.listFriendOffline(listIdFriend), [], function(err, data){
		    			if(err) return reject(err);
		    			listFriendOffline = data;
		    			for(var i = 0; i < listFriendOffline.length; i++){
		    				listFriendOffline[i].level = countLevel(listFriendOffline[i].level)
		    			}
		    			return fullfill();
	    		});
	    	})
	    }

	    let broadCastImOnline = function(){
	    	return new Promise(function(fullfill, reject){
	    		if(listIdFriend.length == 0) return fullfill();
	    		User.query(query.listSocketFriend(listIdFriend), [], function(err, data){
	    			if(err) return reject(err);
	    			var listSocketFriend = [];
	    			for(var i = 0; i < data.length; i++){
		    			listSocketFriend.push(data[i].socketId);
		    		}
		    		if(listSocketFriend.length == 0) return fullfill();
		    		User.query(query.myProfile(userId), [], function(err, data){
		    			if(err) return reject(err);
		    			data[0].level = countLevel(data[0].level);
		    			sails.sockets.broadcast(listSocketFriend, 'friendOnline', data[0]);
		    			return fullfill();
		    		});
    			});
	    	})
	    }

	    let friendsRequest = function(){
	    	return new Promise(function(fullfill, reject){
	    		User.query(query.listIdFriendRequest(userId), [], function(err, data){
	    			if(err) return reject(err);
					var friendsRequest = [];
	    			for(var i = 0; i < data.length; i++){
		    			friendsRequest.push(data[i].friendId);
		    		}
	    			if(data.length == 0) return fullfill();
	    			User.query(query.listUserInfo(friendsRequest), [], function(err, data){
	    				listFriendRequest = data;
	    				for(var i = 0; i < listFriendRequest.length; i++){
		    				listFriendRequest[i].level = countLevel(listFriendRequest[i].level)
		    			}
	    				return fullfill();
	    			})
    			});
	    	})
	    }

	    makeUserOnline().then(getUserOnline).then(getUserOffline).then(broadCastImOnline)
	    .then(friendsRequest)
	    .then(function(){
	    	responseObj = {
	    		message:'success', 
	    		listFriendOnline: listFriendOnline, 
	    		listFriendOffline:listFriendOffline,
	    		listFriendRequest: listFriendRequest
	    	}
	    	res.json(responseObj);
	    }).catch(function(err){
	    	return res.json({message:'have_err'});
	    });    
	},
};

