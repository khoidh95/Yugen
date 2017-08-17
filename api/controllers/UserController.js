/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var validateService = require('../services/validateRegister.js');
var countLevel = require('../services/countLevel.js');
module.exports = {
	registerUser: function (req, res) {
		validateService.validate(req, function(isValid){
			if(!isValid.email || !isValid.displayName || !isValid.password){
				return res.badRequest({isValid: isValid});
			}
			var newUser = {
				email: req.body.email.trim(),
				displayName: req.body.displayName.trim(),
				password: req.body.password.trim(),
				avatar:'/images/avatar-default.png'
			};
			User.find({
				email: req.body.email.trim()
			}).then(function (users) {
				if(users.length != 0){
					var email = require('querystring').escape(users[0].email);
					var displayname = require('querystring').escape(users[0].displayName);
					return res.redirect('/login?register_message=emailexist&email=' + email + '&displayname=' + displayname);
				} 
				User.create(newUser).then(function(user){
					require('../services/verifyEmail.js').sendVerify(user, function(err){
						if(err){
							return res.badRequest(err);
						}else{
							return res.view('template/index/verify/sentEmail.ejs', {email: user.email});
						}
					});
				}).catch(function (err) {
					return res.badRequest(err);
				});
			}).catch(function (err) {
				return res.badRequest(err);
			});
		});
	},
	verifyUser: function(req, res){
		if(!req.query) return res.notFound();
		if(!req.query.verifycode) return res.notFound();
		require('../services/verifyEmail.js').verifyCode(req.query.verifycode, function(id){
			if(!id) return res.notFound();
			User.find({
				id: parseInt(id)
			}).then(function (users) {
				if(users.length != 0){
					if(users[0].isActive) return res.notFound();
					User.update({
						id: parseInt(id)
					},{
						isActive: true
					}).then(function(user){
						return res.view('template/index/verify/verifyUser.ejs');
					}).catch(function(err){
						return res.badRequest(err);
					});
				}else{
					return res.notFound();
				}
			})		
		});
	},
	reVerifyUser: function(req, res){
		if(!req.body.email) return res.json({message:'email_not_found'});
		if(!req.body.password) return res.json({message:'password_not_correct'});
		User.findOne({email: req.body.email}, function(err, user){
			if(!user)	return res.json({message:'email_not_found'});
			require('../services/bcryptPassword.js').decode(req.body.password, user.password, function(ok){
				if(!ok)	return res.json({message:'password_not_correct'});
				if(user.isActive) return res.json({message:'email_actived'});
				require('../services/verifyEmail.js').sendVerify(user, function(err){
					if(err){
						return res.json({message:'have_error'});
					}else{
						return res.json({message:'success'});
					}
				});
			});
		})
	},
	forgotPasswordEmail: function(req, res){
		if(!req.body.email) return res.json({message:'email_not_found'});
		User.findOne({email: req.body.email}, function(err, user){
			if(!user)	return res.json({message:'email_not_found'});
			require('../services/forgotPasswordEmail.js').sendVerify(user, function(err){
				if(err){
					return res.json({message:'have_error'});
				}else{
					return res.json({message:'success'});
				}
			});
		})
	},
	forgotPassword: function(req, res){
		if(!req.query.code)	return res.notFound();
		require('../services/forgotPasswordEmail.js').verifyCode(req.query.code, function(id, updatedAt){
			User.findOne({id: id}, function(err, user){
				if(err) return res.badRequest(err);
				if(!user) return res.notFound();
				if(user.updatedAt != updatedAt)	return res.notFound();
				return res.view('template/index/forgot-password/changePassword.ejs', {user:user});
			})
		})
	},
	changepassword: function(req, res){
		if(!req.body.password) return res.json({message:"password_not_correct"});
		if(!req.body.code) return res.json({message:"code_not_correct"});
		/*CHECK*/
		require('../services/forgotPasswordEmail.js').verifyCode(req.body.code, function(id, updatedAt){
			User.findOne({id: parseInt(id)}, function(err, user){
				if(err) return res.json({message:'have_error'});
				if(!user) return res.json({message:'email_not_found'});
				if(user.updatedAt != updatedAt)	return res.json({message:'have_error'});
				require('../services/bcryptPassword.js').encode(req.body.password, function(hash){
					User.update({id:parseInt(id)},{
						password: hash
					}, function(err, user){
						if(err) return res.json({message:'have_error'});
						return res.json({message:'success'});
					});	
				})
			})
		});
	},
	changepasswordWithSession: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:"have_error"});
		if(!req.body.old_password || !req.body.new_password || !req.body.new_confirm_password) return res.json({message:"have_error"});
		User.findOne({id:req.session.passport.user}, function(err, user){
			if(err)	return res.json({message:'have_error'});
			require('../services/bcryptPassword.js').decode(req.body.old_password, user.password, function(ok){
				if(!ok)	return res.json({message:'password_not_correct'});
				require('../services/bcryptPassword.js').encode(req.body.new_password, function(hash){
					User.update({id:parseInt(req.session.passport.user)},{
						password: hash
					}, function(err, user){
						if(err) return res.json({message:'have_error'});
						return res.json({message:'success'});
					});	
				})
			});
		});
	},
	editProfile: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:"have_error"});
		if(!req.body.displayName && (!req.body.fileName || !req.body.imageData)) return res.json({message:"have_error"});
		// check displayName
		if(req.body.displayName){
			User.update({id: req.session.passport.user},{
				displayName: req.body.displayName
			}, function(err, user){
				if(err)	return res.json({message:"have_error"});
				if(!user[0]) return res.json({message:"have_error"});
				return res.json({message:"success", displayName:user[0].displayName});
			});
		}else{
			var fs = require('fs');
			var path = require('path');
			var folderPicuture = path.join(__dirname, '../../assets/Attachment/' + req.session.passport.user);
			var myMkdirSync = function(dir){
			    if (fs.existsSync(dir)){
			        return
			    }
			    try{
			        fs.mkdirSync(dir)
			    }catch(err){
			        if(err.code == 'ENOENT'){
			            myMkdirSync(path.dirname(dir)) //create parent dir
			            myMkdirSync(dir) //create dir
			        }
			    }
			}
			myMkdirSync(folderPicuture);
			fs.writeFile(folderPicuture + '/avatar.png', req.body.imageData.replace(/^data:image\/png;base64,/, ""), 'base64', function(err) {
		        if(err){
		        	res.json({message:'have_error', err:err});
		        }
		        else{
		        	var avatar = '/Attachment/' + req.session.passport.user + '/avatar.png';
		        	User.update({id:req.session.passport.user},{
		        		avatar:avatar
		        	},function(err, user){
		        		if(err) return res.json({message:'have_error'});
		            	return res.json({message:'success', avatar:avatar} );
		        	})
		        }
		    });
		}
	},
	
	//BOOKMARK
	createBookMark: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:"have_error"});
		let checkQuestions = function(){
	    	return new Promise(function(fullfill, reject){
	    		Question.findOne({id: req.body.questionId}).exec(function(err, ques){
	    			if(err) return reject(err);
	    			if(!ques) return reject('question_not_found');
	    			return fullfill();
	    		})
	    	})
	    }
	    let checkBookMark = function(){
	    	return new Promise(function(fullfill, reject){
	    		User.findOne({id:req.session.passport.user}).populate('bookmark_questions',{id:req.body.questionId}).exec(function(err,user){
	    			if(err) return reject(err);
	    			if(!user) return reject(err);
	    			if(user.bookmark_questions.length > 0) return reject('already_bookmark');
	    			return fullfill();
	    		})
	    	})
	    }
	    let createBookMark = function(){
	    	return new Promise(function(fullfill, reject){
	    		User.findOne({id: req.session.passport.user}).exec(function(err, user){
	    			if(err) return reject(err);
	    			if(!user) return reject('user_not_found');
	    			user.bookmark_questions.add(req.body.questionId);
	    			user.save(function(err){
	    				if(err) return reject(err);
	    				return fullfill();
	    			})
	    		})
	    	})
	    }
	    checkQuestions().then(checkBookMark).then(createBookMark).then(function(){
	    	res.json({message:'success'});
	    }).catch(function(err){
	    	if(err == 'already_bookmark') return res.json({message:'already_bookmark'});
	    	return res.json({message:'have_err'});
	    })
	},
	listBookMark: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:"have_error"});
		var current = parseInt(req.body.current);
		if(typeof(current)!='number') return res.json({message:"have_error"});
		var limit = 6;
		var skip = current * limit;
		var count = 0; 
		let countBookmark = function(){
			return new Promise(function(fullfill, reject){
				User.findOne({
					select:['id'],
					where:{
						id: req.session.passport.user
					}
				}).populate('bookmark_questions').exec(function (err, ques) {
					if(err) return reject(err);
					count = ques.bookmark_questions.length;
					return fullfill();
				})
			});
		}
		let list = function(){
	    	return new Promise(function(fullfill, reject){
	    		User.findOne({
					select:['id'],
					where:{
						id: req.session.passport.user
					}
				}).populate('bookmark_questions',{limit:limit, skip:skip}).exec(function (err, ques) {
					if(err) return reject(err)
					var questions = [];

					if(ques.bookmark_questions.length == 0) return fullfill();
					function dequy(arr){
						Answer.find({questionId:arr[0].id}).exec(function(err, ans){
							if(err) return reject(err)
							questions.push({
								questions: arr[0],
								answers : ans
							});
							arr.shift();
							if(arr.length > 0){
								dequy(arr);
							}else{
								return fullfill(questions);
							}
						})
					}
					dequy(ques.bookmark_questions)
				})
	    	})
	    }
	    countBookmark().then(list).then(function(questions){
	    	var pages = Math.ceil(count / limit);
	    	return res.json({message:'success', questions: questions, pages:pages});
	    })	
	},
	deleteBookMark:function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:"have_error"});
		let checkQuestions = function(){
	    	return new Promise(function(fullfill, reject){
	    		Question.findOne({id: req.body.questionId}).exec(function(err, ques){
	    			if(err) return reject(err);
	    			if(!ques) return reject('question_not_found');
	    			return fullfill();
	    		})
	    	})
	    }
	    let deleteQuestions = function(){
	    	return new Promise(function(fullfill, reject){
	    		User.findOne({id: req.session.passport.user}).exec(function(err, user){
					if(err) return reject(err);
					if(!user) return reject('user_not_found');
					user.bookmark_questions.remove(req.body.questionId);
					user.save(function(err){
						if(err) return reject(err);
	    				return fullfill();
					});
				})
	    	})
	    }
		checkQuestions().then(deleteQuestions).then(function(){
	    	res.json({message:'success'});
	    }).catch(function(err){
	    	res.json({message:'have_err'});
	    })
	}
};

