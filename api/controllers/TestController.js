/**
 * TestController
 *
 * @description :: Server-side logic for managing tests
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var query =  require('../services/query.js');
module.exports = {
	createTest: function(req, res) {
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var jlpt = req.body.jlpt;
		var userId = req.session.passport.user;
		var testId;
		if(jlpt != 'N1' && jlpt != 'N2' && jlpt != 'N3' && jlpt != 'N4' && jlpt != 'N5') res.json({message:'have_err'});
		var totalQues = 20;
		let checkIsTest = function(){
	    	return new Promise(function(fullfill, reject){
	    		Test.findOne({status: false,user:userId}).exec(function(err,test){
	    			if(err) return reject(err);
	    			if(test) return reject('is_testing');
	    			return fullfill();
	    		})
	    	})
	    }
	    let SetUpPlayer = function(){
	    	return new Promise(function(fullfill, reject){
	    		Test.create({user:userId, jlpt:jlpt}).exec(function(err,test){
					if(err) return reject(err);
					testId= test.id;
					return fullfill();
				})
	    	})
	    }
	    let SetUpQuestion = function(){
	    	return new Promise(function(fullfill, reject){
	    		function dequy(types){
	    			if(types.length == 0) return fullfill();
	    			Question.find({ select: ['id'], where: {isTest:true, type:types[0], jlpt:jlpt} }).exec(function(err, quesIds){
		    			if(err) return reject(err);
		    			if(quesIds.length < totalQues) return reject('not_enough_question');
		    			quesIds = require('../services/shuffleArray.js')(quesIds);
		    			Test.findOne({id:testId}).exec(function(err, test){
		    				if(err) return reject(err);
		    				var i = 0;
		    				for(i = 0 ; i < totalQues; i++ ){
		    					test.questions.add(quesIds.pop().id);
		    				}
		    				test.save(function(err){
								if(err) return reject(err);
								types.shift();
								dequy(types);
							})
		    			});
		    		})
	    		}
	    		dequy(['kanji', 'grammar', 'vocabulary']);
	    	})
	    }
	    checkIsTest().then(SetUpPlayer).then(SetUpQuestion).then(function(){
	    	if(!req.session.passport.test){
	    		req.session.passport.test = [];
	    	}
	    	res.json({message:'success'});
	    	setTimeout(function(){
	    		let check = function(){
					return new Promise(function(fullfill, reject){
			    		Test.findOne({status:false,id:testId}).exec(function(err, test){
			    			if(err) return reject(err);
			    			if(!test) return reject('test_is_finish');
			    			fullfill();
			    		})
			    	})
				}
				let broadcast = function(){
					return new Promise(function(fullfill, reject){
			    		User.query(query.listSocketFriend([req.session.passport.user]), [], function(err, data){
			    			if(err) return reject(err);
			    			if(!data) return reject();
			    			var listSocket = [];
			    			for(var i = 0; i < data.length; i++){
				    			listSocket.push(data[i].socketId);
				    		}
				    		if(listSocket.length == 0) return reject();
				    		sails.sockets.broadcast(listSocket, 'expired', {});
				    		return fullfill();
				    	});
			    	})
				}
				check().then(broadcast).then(function(){
					setTimeout(function(){
						Test.update({id:testId},{status:true}).exec(function(err, test){
			    			
			    		})
					},1000);
				}).catch(function(err){});
    		},1800000)
	    }).catch(function(err){
	    	if(err == 'not_enough_question'){
	    		Test.destroy({id:testId}).exec(function(err){
	    			return res.json({message:'have_err', err:'not_enough_question'})
	    		})
	    	}else{
	    		return res.json({message:'have_err', err:err})
	    	}
	    })
	},
	getMyTest: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var userId = req.session.passport.user;
		var expired;
		let checkIsTest = function(){
	    	return new Promise(function(fullfill, reject){
	    		Test.findOne({status: false,user:userId}).exec(function(err,test){
	    			if(err) return reject(err);
	    			if(!test) return reject('not_have_test');
	    			return fullfill();
	    		})
	    	})
	    }
	    let getAllQuestion = function(){
	    	return new Promise(function(fullfill, reject){
	    		Test.findOne({where:{status: false,user:userId}, select:['id','createdAt']})
	    		.populate('questions').exec(function(err,test){
	    			if(err) return reject(err);
	    			if(!test) return reject('not_have_test');
	    			expired = new Date(test.createdAt).getTime() + 1800000//1800000;
	    			var questions = [];
	    			function dequy(arr){
	    				if(arr.length == 0) return fullfill(questions);
	    				Question.findOne({id:arr[0].id}).populate('answer').exec(function(err, ques){
	    					if(err) return reject(err);
	    					if(!ques) return reject('question_not_found');
	    					for(var i = 0; i < ques.answer.length; i++){
								delete ques.answer[i].isCorrect;
							}
							questions.push({
								id:ques.id,
								content:ques.content,
								type:ques.type,
								answer: ques.answer
							});
							arr.shift();
							dequy(arr);
	    				});
	    			}
	    			dequy(test.questions);
	    		})
	    	})
	    }
	    checkIsTest().then(getAllQuestion).then(function(questions){
	    	return res.json({message:'success',questions:questions, questionsFlag:req.session.passport.test, expired:expired, now:new Date().getTime()});
	    }).catch(function(err){
	    	return res.json({message:'have_err', err:err})
	    })
	},
	submitAnswer: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var userId = req.session.passport.user;
		if(!req.body.questionId || !req.body.answerId) return res.json({message:'have_err'});
		let check = function(){
	    	return new Promise(function(fullfill, reject){
	    		Test.findOne({status: false,user:userId}).populate('questions',{where:{id:req.body.questionId}}).exec(function(err,test){
	    			if(err) return reject(err);
	    			if(!test) return reject('not_test');
	    			if(test.questions.length == 0) return reject('question_not_found_in_game');
	    			return fullfill();
	    		})
	    	})
	    }
	    check().then(function(){
	    	if(req.session.passport.test.length==0){
	    	 	req.session.passport.test.push({q:req.body.questionId, a:req.body.answerId});
	    	}else{
		    	for(var i = 0; i < req.session.passport.test.length; i++){
		    		if(req.session.passport.test[i].q != req.body.questionId && i == req.session.passport.test.length-1){
		    			req.session.passport.test.push({q:req.body.questionId, a:req.body.answerId});
		    		}else if(req.session.passport.test[i].q == req.body.questionId){
		    			req.session.passport.test[i].a = req.body.answerId;
		    			break;
		    		}
		    	}
	    	}
	    	return res.json({message:'success', questionsFlag:req.session.passport.test});
	    }).catch(function(err){
	    	return res.json({message:'have_err', err:err});
	    })
	},
	finishTest: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var mark = 0;
		var jlptUp;
		let calMark = function(){
	    	return new Promise(function(fullfill, reject){
	    		var testSession = req.session.passport.test;
	    		delete req.session.passport.test;
	    		function chamdiemDequy(arr){
	    			if(arr.length == 0) return fullfill(mark);
	    			Answer.findOne({questionId:arr[0].q, id:arr[0].a, isCorrect:true}).exec(function(err, ans){
	    				if(ans) mark++;
	    				arr.shift();
	    				chamdiemDequy(arr);
	    			})
	    		}
	    		chamdiemDequy(testSession);
	    	})
	    }
		let updateTest = function(){
			return new Promise(function(fullfill, reject){
				Test.findOne({status:false}).populate('user').exec(function(err, test){
	    			if(err) return reject(err);
	    			if(!test) return reject('test_is_finish');
	    			var jlptTest = parseInt(test.jlpt.split('')[1]);
	    			var jlptUser = parseInt(test.user.jlpt.split('')[1]);
	    			var jlptUpdate = test.user.jlpt;
					var userId = test.user.id;
					if(mark >= 40 && !jlptUser){
						jlptUpdate = test.jlpt;
						jlptUp = jlptUpdate;
					}
					else if(mark >= 40 && jlptTest <= jlptUser){
						jlptUpdate = test.jlpt;
						jlptUp = jlptUpdate;
					}
					Test.update({id:test.id},{status:true, mark:mark}).exec(function(err, _t){
						User.update({id:userId},{jlpt:jlptUpdate}).exec(function(err, user){
							fullfill();
						});
					})
	    		})
	    	})
		}
	    let getSocket = function(){
	    	return new Promise(function(fullfill, reject){
	    		User.query(query.listSocketFriend([req.session.passport.user]), [], function(err, data){
	    			if(err) return reject(err);
	    			if(!data) return reject();
	    			var listSocket = [];
	    			for(var i = 0; i < data.length; i++){
		    			listSocket.push(data[i].socketId);
		    		}
		    		if(listSocket.length == 0) return reject();
		    		return fullfill(listSocket);
		    	});
	    	})
	    }
	    calMark().then(updateTest).then(getSocket).then(function(listSocket){
	    	res.json({message:'success'});
	    	return sails.sockets.broadcast(listSocket, 'finishTest', {mark:mark,jlptUp:jlptUp});
	    }).catch(function(err){
	    	return res.json({message:'have_error'});
	    })
	},
	history: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var limit = req.body.limit;
		var skip = req.body.skip;
		var count = 0;
		let countTest = function(){
	    	return new Promise(function(fullfill, reject){
	    		Test.count({user:req.session.passport.user}).exec(function(err, _count){
					if(err) return reject(err);
					count = _count;
					return fullfill();
				});
	    	})
	    }
		let getTest = function(){
	    	return new Promise(function(fullfill, reject){
	    		Test.find({
					where:{user:req.session.passport.user},
					skip: skip,
					limit: limit,
					sort: 'id DESC'
				}).exec(function(err, tests){
					if(err) return reject(err);
					fullfill(tests);
				});
	    	})
	    }
	    countTest().then(getTest).then(function(test){
	    	res.json({message:'success', history:test, count:count});
	    }).catch(function(err){
	    	res.json({message:'have_err'})
	    });
	}
};

