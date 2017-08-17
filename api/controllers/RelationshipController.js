/**
 * RelationshipController
 *
 * @description :: Server-side logic for managing relationships
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	addFriend: function (req, res){
		//CHECK CAC THAM SO
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		if(!req.body.friendId) return res.json({message:'have_err'});
		var friendId = parseInt(req.body.friendId);
		var userId = req.session.passport.user;
		if(!friendId) return res.json({message:'have_err'});
		if (req.session.passport.user == friendId) return res.json({message:'have_err'});
		//TIM XEM FRIEND ID CO HAY KO
		User.findOne({id: friendId}).exec(function(err, friend){
			if(err) return res.json({message:'have_err'});
			if(!friend) return res.json({message:'have_err'});
			if(friend.isActive == false) return res.json({message:'have_err'});
			if(friend.role == 'admin') return res.json({message:'have_err'});
			// USER_ONE id phai nho hown id cua USER_TWO
			var user_one = userId < friendId ? userId : friendId;
			var user_two = userId < friendId ? friendId : userId;
			var status = userId==user_one?1:2;
			// TAO MOI 1 RELATIONSHIP
			Relationship.findOrCreate({user_one: user_one, user_two:user_two}, {user_one: user_one, user_two: user_two,status:status})
			.exec(function(err, relation){
				if(err) return res.json({message:'have_err'});
				/*PHAN REALTIME */
				//TIM SOCKET CUA THANG YEU CAU KET BAN
				User.query(query.listSocketFriend([friendId]), [], function(err, data){
	    			if(err) return res.json({message:'have_err'});
	    			var listSocketFriend = [];
	    			for(var i = 0; i < data.length; i++){
		    			listSocketFriend.push(data[i].socketId);
		    		}
		    		//NEU THANG DO KO ONLINE THI RETURN
		    		if(listSocketFriend.length == 0) return res.json({message:'success'});
		    		//NEU THANG DO ONLINE THI GUI INFO CUA MINH
		    		User.query(query.myProfile(req.session.passport.user), [], function(err, data){
		    			if(err) return res.json({message:'have_err'});
		    			// GUI DEN CAC SOCKET CUA THANG MINH YEU CAU KET BAN
		    			sails.sockets.broadcast(listSocketFriend, 'friendRequest', data[0]);
		    			return res.json({message:'success'});
		    		});
    			});
			});
		})
	},	
	searchFriend: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:"have_error"});
		var friendId = req.body.friendId
		if(!friendId) return res.json({message:'user_not_found'});
		friendId = parseInt(friendId);
		if(!friendId) return res.json({message:'user_not_found'});
		User.findOne({id:friendId}).exec(function(err, friend){
			if(err) return res.json({message:'have_error'});
			if(!friend) return res.json({message:'user_not_found'});
			if(friend.isActive == false) return res.json({message:'user_not_found'});
			if(friend.role == 'admin') return res.json({message:'user_not_found'});
			if(friend.id == req.session.passport.user) return res.json({message:'user_not_found'});
			var relation_user_one = req.session.passport.user < friend.id?req.session.passport.user:friend.id;
			var relation_user_two = req.session.passport.user < friend.id?friend.id:req.session.passport.user;

			var userIs = req.session.passport.user==relation_user_one?1:2;

			Relationship.findOne({user_one: relation_user_one, user_two: relation_user_two}).exec(function(err, rela){
				if(err)  return res.json({message:"have_error"});
				if(!rela) return res.json({message:'success', user:{id:friend.id, displayName: friend.displayName, avatar: friend.avatar, status:0}});
				switch(rela.status) {
                    case 1:
                		return res.json({message:'success', user:{id:friend.id, displayName: friend.displayName, avatar: friend.avatar, status:1, userIs:userIs}});
                        break;
                    case 2:
                    	return res.json({message:'success', user:{id:friend.id, displayName: friend.displayName, avatar: friend.avatar, status:2, userIs:userIs}});
                        break;
                    case 3:
                    return res.json({message:'success', user:{id:friend.id, displayName: friend.displayName, avatar: friend.avatar, status:3}});
                        break;
                }
			});
			
		})
	},
	deleteFriend: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		if(!req.body.friendId) return res.json({message:'have_err'});
		var friendId = parseInt(req.body.friendId);
		var userId = req.session.passport.user;
		if(!friendId) return res.json({message:'have_err'});
		if (userId == friendId) return res.json({message:'have_err'});

		var user_one = userId < friendId?userId:friendId;
		var user_two = userId < friendId?friendId:userId;

		Relationship.destroy({user_one:user_one, user_two:user_two}).exec(function(err){
			if(err) return res.json({message:"have_error"});
			/*PHAN REALTIME */
			//TIM SOCKET CUA THANG YEU CAU KET BAN
			User.query(query.listSocketFriend([friendId]), [], function(err, data){
    			if(err) return res.json({message:'have_err'});
    			var listSocketFriend = [];
    			for(var i = 0; i < data.length; i++){
	    			listSocketFriend.push(data[i].socketId);
	    		}
	    		//NEU THANG DO KO ONLINE THI RETURN
	    		if(listSocketFriend.length == 0) return res.json({message:'success'});
	    		//NEU THANG DO ONLINE THI GUI INFO CUA MINH
	    		User.query(query.myProfile(req.session.passport.user), [], function(err, data){
	    			if(err) return res.json({message:'have_err'});
	    			// GUI DEN CAC SOCKET CUA THANG MINH YEU CAU KET BAN
	    			sails.sockets.broadcast(listSocketFriend, 'friendDelete', data[0]);
	    			return res.json({message:'success'});
	    		});
			});
		})
	},
	acceptFriend: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		if(!req.body.friendId) return res.json({message:'have_err'});
		var friendId = parseInt(req.body.friendId);
		var userId = req.session.passport.user;
		if(!friendId) return res.json({message:'have_err'});
		if (userId == friendId) return res.json({message:'have_err'});

		var user_one = userId < friendId?userId:friendId;
		var user_two = userId < friendId?friendId:userId;

		Relationship.findOne({user_one:user_one, user_two:user_two}).exec(function(err, rela){
			if(err) return res.json({message:"have_error"});
			if(!rela) return res.json({message:"have_error"});
			Relationship.update({user_one:user_one, user_two:user_two},{status:3}).exec(function(err){
				if(err)	 return res.json({message:"have_error"});
				return res.json({message:"success"});
			});
		})
	}
};

