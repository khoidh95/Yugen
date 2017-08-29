/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var query =  require('../services/query.js');
var socRQ = require('../services/SocRQ.js');
var Cryptr = require('cryptr'),
    cryptr = new Cryptr('encryptrankgame');
module.exports = {
	rankRegister:function (req, res) {
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var CountQuestion = function(){
			return new Promise(function(fullfill, reject){
	    		Question.count({isTest:false}).exec(function(err,count){
	    			if(err) return reject(err);
	    			if(count < 15) return reject('not_enough_question');
	    			return fullfill();
	    		});
	    	});
		}
		CountQuestion().then(function(){
			Game.findOne({
				or : [
					{ user_one:req.session.passport.user , currentQuestion: { '!': null }},
					{ user_two:req.session.passport.user , currentQuestion: { '!': null }}
				],
				select:['currentQuestion','id','user_one','user_two','user_one_score','user_two_score']
			}).exec(function(err, game){
				if(err) return  res.json({message:'have_error'});
				if(game) return res.json({message:'you_are_in_game'});

				// CHECK XEM NGUOI CHOI CO TRONG HANG DOI HAY CHUA
				if(sails.config.globals.rankQueue.indexOf(req.session.passport.user) >= 0) return res.json({message:'success'});
				// CHUA CO THI DAY NGUOI CHOI VAO HANG DOI
				sails.config.globals.rankQueue.push(req.session.passport.user);
				// DANG KI ROOM RESGISTER CUA 1 USER
				socRQ.makeRoom(req, function(){
					// CHECK XEM HANG DOI CO DUNG 1 NGUOI DANG DOI HAY KHONG?
					if(sails.config.globals.rankQueue.length < 2){
						sails.sockets.broadcast('rank-queue-' + req.session.passport.user,'registerRank', {message:'success'});
						return res.json({message:'success'});
					} 
					// LAY ID CUA 2 THANG DAU TIEN
					var playerOneId;
					var playerTwoId;

					var playerOneSocket = [];
					var playerTwoSocket = [];
					
					function shakehand(){
						if(sails.config.globals.rankQueue.length < 2) return res.json({message:'success'});
						playerOneId = sails.config.globals.rankQueue.shift();
						playerTwoId = sails.config.globals.rankQueue.shift();
						playerOneSocket = [];
						playerTwoSocket = [];
			    		Online.query(query.listSocketFriend([playerOneId]), [], function(err, data){
							for(var i = 0; i < data.length; i++){
				    			playerOneSocket.push(data[i].socketId);
			    			}
				    		Online.query(query.listSocketFriend([playerTwoId]), [], function(err, data){
								for(var i = 0; i < data.length; i++){
					    			playerTwoSocket.push(data[i].socketId);
					    		}

					    		// PLAYER 1 DISCONNECT , PLAYER 2 CONNECTED
					    		if(playerOneSocket.length == 0 && playerTwoSocket.length !=0){
					    			if(sails.config.globals.rankQueue.indexOf(playerTwoId) < 0)
					    				sails.config.globals.rankQueue.unshift(playerTwoId);
					    			shakehand();
					    		}

					    		// PLAYER 1 CONNECTED , PLAYER 2 DISCONNECTED
					    		if(playerOneSocket.length != 0 && playerTwoSocket.length ==0){
					    			if(sails.config.globals.rankQueue.indexOf(playerOneId) < 0)
					    				sails.config.globals.rankQueue.unshift(playerOneId);
					    			shakehand();
					    		}

					    		// PLAYER 1 CONNECTED , PLAYER 2 CONNECTED
					    		if(playerOneSocket.length != 0 && playerTwoSocket.length !=0){
					    			res.json({message:'success'});
					    			var code = cryptr.encrypt(new Date().getTime().toString() + '-' + playerOneId + '-' + playerTwoId);
					    			User.query(query.myProfile(playerOneId), [], function(err, data){
										data[0].level = countLevel(data[0].level);
										var userOne = data[0];
										User.query(query.myProfile(playerTwoId), [], function(err, data){
											data[0].level = countLevel(data[0].level);
											var userTwo = data[0];
											sails.sockets.broadcast('rank-queue-' + playerOneId,'acceptARank', {code: code,me: userOne, compatitor:userTwo});
					    					sails.sockets.broadcast('rank-queue-' + playerTwoId,'acceptARank', {code: code,me: userTwo, compatitor:userOne});
										});
									});
					    			sails.config.globals.roomGame[code] = [];
					    			setTimeout(function(){
					    				if(sails.config.globals.roomGame[code]){
					    					delete sails.config.globals.roomGame[code];
						    				sails.sockets.broadcast('rank-queue-' + playerOneId,'cancelRankQueue', {message:'success'});
						    				sails.sockets.broadcast('rank-queue-' + playerTwoId,'cancelRankQueue', {message:'success'});
					    					socRQ.destroyRoom(playerOneId, function(){});
					    					socRQ.destroyRoom(playerTwoId, function(){});
					    				}
					    			},20000)
					    		}
							});
						});
				    }
				    shakehand();
				});
			})
		}).catch(function(err){
			if(err=='not_enough_question'){
				return res.json({message:'not_enough_question'});
				return res.json({message:'have_err'});
			}
		})
				
	},
	rankInit: function(req, res){
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});

		if(sails.config.globals.rankQueue.indexOf(req.session.passport.user) >= 0){
			sails.sockets.join(sails.sockets.getId(req), 'rank-queue-' + req.session.passport.user);
			return res.json({message:'in_queue'});
		}else{
			return res.json({message:'no_queue'});
		}
	},
	rankCancel: function(req, res){
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var _uid = req.session.passport.user;
		var i = sails.config.globals.rankQueue.indexOf(_uid);
		if(i >= 0) sails.config.globals.rankQueue.splice (i, 1);
		if(!req.body.code)
			sendSingle();
		else{
			var decryptedCode = cryptr.decrypt(req.body.code);
			if(!decryptedCode) sendSingle();
			else{
				var id1 = parseInt(decryptedCode.split('-')[1]);
				var id2 = parseInt(decryptedCode.split('-')[2]);
				if(_uid == id1){
					sendCancel(id1, id2);
				}else if( _uid == id2){
					sendCancel(id2, id1);
				}
			}
		}
		
		function sendCancel(idY, idN, data){
			delete sails.config.globals.roomGame[req.body.code];
			sails.sockets.broadcast('rank-queue-' + idY, 'cancelRankQueue', {message:'success'});
			sails.sockets.broadcast('rank-queue-' + idN, 'cancelRankQueue', {message:'success', registerAgain:true});
			sails.sockets.leaveAll('rank-queue-' + idY, function(){});
			sails.sockets.leaveAll('rank-queue-' + idN, function(){});
		}
		function sendSingle(){
			sails.sockets.broadcast('rank-queue-' + _uid, 'cancelRankQueue', {message:'success'});
			sails.sockets.leaveAll('rank-queue-' + _uid, function(){});
		}
	},
	rankJoinGame: function(req, res){
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var decryptedCode = cryptr.decrypt(req.body.code);
		if(!decryptedCode) return res.json({message:'have_err'});
		var id1 = decryptedCode.split('-')[1];
		var id2 = decryptedCode.split('-')[2];
		var playerOneId;
		if(req.session.passport.user != id1 && req.session.passport.user != id2)
			return res.json({message:'have_err'});
		if(!sails.config.globals.roomGame[req.body.code])
			return res.json({message:'have_err'});
		try{
			if(sails.config.globals.roomGame[req.body.code].length == 0){
				sails.config.globals.roomGame[req.body.code].push(req.session.passport.user)
				return res.json({message:'in_room'});
			}else if(sails.config.globals.roomGame[req.body.code].length == 1){
				if(sails.config.globals.roomGame[req.body.code][0] == req.session.passport.user)
					return res.json({message:'in_room'});
				sails.config.globals.roomGame[req.body.code].push(req.session.passport.user);
				playerOneId = sails.config.globals.roomGame[req.body.code][0];
			}else if(sails.config.globals.roomGame[req.body.code].length == 2){
				return res.json({message:'in_room'});
			}
		}catch(err){
			return res.json({message:'have_err'});
		}
		var gameId;
		var totalQues = 15;
		var skip = 0;
		let SetUpPlayer = function(){
	    	return new Promise(function(fullfill, reject){
	    		Game.create({status:false, user_one:id1, user_two:id2, mode:1}).exec(function(err,game){
					if(err) return reject(err);
					gameId= game.id;
					return fullfill();
				})
	    	})
	    }
		let SetUpQuestion = function(){
	    	return new Promise(function(fullfill, reject){
	    		Question.find({ select: ['id'], where: {isTest:false} }).exec(function(err, quesIds){
	    			if(err) return reject(err);
	    			if(quesIds < totalQues) return reject('not_enough_question');
	    			quesIds = require('../services/shuffleArray.js')(quesIds);
	    			Game.findOne({id:gameId}).exec(function(err, game){
	    				if(err) return reject(err);
	    				var i = 0;
	    				for(i = 0 ; i < totalQues; i++ ){
	    					game.questions.add(quesIds.pop().id);
	    				}
	    				game.save(function(err){
							if(err) return reject(err);
							return fullfill();
						})
	    			});
	    		})
	    	})
	    }

	    SetUpPlayer().then(SetUpQuestion).then(function(){
	    	sails.sockets.broadcast('rank-queue-' + id1, 'startGame', {});
			sails.sockets.broadcast('rank-queue-' + id2, 'startGame', {});
	    }).catch(function(err){
	    	if(err != 'not_enough_question'){
	    		return res.json({message:'have_err'});
	    	}

	    });
	},
	game: function(req, res){
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var id1,id2;
		let setUpSocket = function(){
			return new Promise(function(fullfill, reject){
	    		socRQ.makePlay(req, function(){
	    			return fullfill();
	    		});
	    	})
		}
	    let getGame = function(){
	    	return new Promise(function(fullfill, reject){

	    		Game.findOne({
				  or : [
				    { user_one:req.session.passport.user ,status:false},
				    { user_two:req.session.passport.user ,status:false}
				  ]
				}).exec(function(err, game){
	    			if(err) return reject(err);
	    			if(!game) return reject(null);
	    			if(game.user_one < game.user_two){
	    				id1 = game.user_one;
	    				id2 = game.user_two;
	    			}else{
	    				id2 = game.user_one;
	    				id1 = game.user_two;
	    			}
	    			Game.update({id:game.id},{status: true}).exec(function(err, updateGame){
	    				if(err) return reject(err);
	    				return fullfill(game);
	    			});
	    			
	    		});
	    	})
	    }

	    setUpSocket().then(getGame).then(function(game){
	    	var skip = 0;
	    	var preQuesId;
	    	var gameId = game.id;
	    	var gameMode = game.mode;
	    	sails.config.globals._1vs1['room' + gameId] = {
	    		times:0,
	    		users:[],
	    		game:[]
	    	};
	    	let GameInfo = function(){
		    	return new Promise(function(fullfill, reject){
		    		Game.findOne({select: ['id','user_one','user_two','user_one_score', 'user_two_score'], where: {id:game.id} }).populate('questions',{limit:1,skip:skip}).exec(function(err,game){
						game.questions[0];
						Answer.find({select:['id','content'],where:{questionId:game.questions[0].id}}).exec(function(err, answers){
							game.questions[0].answer = answers;
							Game.update({id:game.id},{currentQuestion:game.questions[0].id}).exec(function(err,update){
						    	sails.config.globals._1vs1['room' + gameId].times = 0;
						    	sails.config.globals._1vs1['room' + gameId].users = [];
						    	sails.config.globals._1vs1['room' + gameId].game.push({
						    		id:game.questions[0].id,
						    		u1:false,
						    		u2:false
						    	});
								fullfill(game);
							});
						})
					});
		    	})
		    }

		    let GetAllQuestionAndAnswer = function(){
		    	return new Promise(function(fullfill, reject){
		    		Game.findOne({id:gameId}).populate('questions').exec(function(err, game){
						var questions = game.questions;
						var resQues = [];
						function dequy(arr){
							Question.findOne({id:arr[0].id}).populate('answer').exec(function(err, q){
								if(err) return reject(err);
								if(!q) return reject(err);
								resQues.push(q);
								arr.shift();
								if(arr.length == 0) return fullfill(resQues);
								dequy(arr);
							});
						}
						dequy(questions);
					})
		    	});
		    }
		    GameInfo().then(function(game){
				var counter = 0;
    			//GAME INTERVAL
    			var gameInterval = setInterval(function(){
    				if(counter == 0){
    					if(skip == 15){
				    		Answer.findOne({questionId:preQuesId, isCorrect: true}).exec(function(err, correct){
					    		Game.update({id:gameId},{currentQuestion:null}).exec(function(err,update){});
					    		GetAllQuestionAndAnswer().then(function(reviewQuestion){
					    			Game.findOne({select: ['id','user_one','user_two','user_one_score', 'user_two_score'], where: {id:game.id} }).exec(function(err, g){
					    				sails.sockets.broadcast('play-' + id1, 'receiveQuestion', {me_score:g.user_one_score,compatitor_score:g.user_two_score,correct:correct, gameReview:sails.config.globals._1vs1['room' + gameId].game,me:'u1',reviewQuestion: reviewQuestion});
										sails.sockets.broadcast('play-' + id2, 'receiveQuestion', {me_score:g.user_two_score,compatitor_score:g.user_one_score,correct:correct, gameReview:sails.config.globals._1vs1['room' + gameId].game,me:'u2',reviewQuestion: reviewQuestion});
										sails.sockets.broadcast('play-' + id1, 'finishGame', {});
										sails.sockets.broadcast('play-' + id2, 'finishGame', {});
										delete sails.config.globals._1vs1['room' + gameId];
										socRQ.destroyPlay(id1,function(){});
										socRQ.destroyPlay(id2,function(){});
										//THIS IS RANK GAME
										if(gameMode == 1){
											if(g.user_one_score < g.user_two_score){
												User.findOne({id:id1}).exec(function(err, u1){
													User.update({id:id1},{level:u1.level + 2}).exec(function(err, upU1){});
												});
												User.findOne({id:id2}).exec(function(err, u2){
													User.update({id:id2},{level:u2.level + 10, score:u2.score + 3}).exec(function(err, upU2){});
												});
											}else if(g.user_one_score > g.user_two_score){
												User.findOne({id:id1}).exec(function(err, u1){
													User.update({id:id1},{level:u1.level + 10, score:u1.score + 3}).exec(function(err, upU1){});
												});
												User.findOne({id:id2}).exec(function(err, u2){
													User.update({id:id2},{level:u2.level + 2}).exec(function(err, upU2){});
												});
											}else{
												User.findOne({id:id1}).exec(function(err, u1){
													User.update({id:id1},{level:u1.level + 5, score:u1.score + 1}).exec(function(err, upU1){});
												});
												User.findOne({id:id2}).exec(function(err, u2){
													User.update({id:id2},{level:u2.level + 5, score:u2.score + 1}).exec(function(err, upU2){});
												});
											}
										//THIS IS FRIEND GAME
										}else if(gameMode == 2){
											if(g.user_one_score < g.user_two_score){
												User.findOne({id:id1}).exec(function(err, u1){
													User.update({id:id1},{level:u1.level + 2}).exec(function(err, upU1){});
												});
												User.findOne({id:id2}).exec(function(err, u2){
													User.update({id:id2},{level:u2.level + 10}).exec(function(err, upU2){});
												});
											}else if(g.user_one_score > g.user_two_score){
												User.findOne({id:id1}).exec(function(err, u1){
													User.update({id:id1},{level:u1.level + 10}).exec(function(err, upU1){});
												});
												User.findOne({id:id2}).exec(function(err, u2){
													User.update({id:id2},{level:u2.level + 2}).exec(function(err, upU2){});
												});
											}else{
												User.findOne({id:id1}).exec(function(err, u1){
													User.update({id:id1},{level:u1.level + 5}).exec(function(err, upU1){});
												});
												User.findOne({id:id2}).exec(function(err, u2){
													User.update({id:id2},{level:u2.level + 5}).exec(function(err, upU2){});
												});
											}
										}
									});
					    		}).catch(function(){});							
				    			clearInterval(gameInterval);
			    			});
				    	}else{
				    		GameInfo().then(function(game){
				    			Answer.findOne({questionId:preQuesId, isCorrect: true}).exec(function(err, correct){
				    				sails.sockets.broadcast('play-' + id1, 'receiveQuestion',
										{question: game.questions[0], answer: game.questions[0].answer, me_score:game.user_one_score,
										compatitor_score:game.user_two_score, correct:correct});
									sails.sockets.broadcast('play-' + id2, 'receiveQuestion',
										{question: game.questions[0], answer: game.questions[0].answer, me_score:game.user_two_score,
										compatitor_score:game.user_one_score, correct:correct});
				    				skip++;
						    		preQuesId = game.questions[0].id;
				    			});
					    	});
				    	}
    				}
    				if(counter >= 0 && counter <=20){
    					if(counter == 0 && skip == 0){
    						counter = 15;
    					}
    					if(counter <= 15){
	    					sails.sockets.broadcast('play-' + id1, 'counterTime',{counter:counter, skip:skip});
							sails.sockets.broadcast('play-' + id2, 'counterTime',{counter:counter, skip:skip});
						}
    				}else{
    					counter = 20;
    				}
    				counter--;
			    }, 1000);
	    	});

	    })  
	},
	gameAnswer: function(req, res){
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		if(!req.body.answerId) return res.json({message:'have_err'});

		Game.findOne({
			or : [
				{ user_one:req.session.passport.user ,status:true, currentQuestion: { '!': null }},
				{ user_two:req.session.passport.user ,status:true, currentQuestion: { '!': null }}
			],
			select:['currentQuestion','id','user_one','user_two','user_one_score','user_two_score']
		}).exec(function(err, game){
			if(err) return;
			if(!game) return;
			if(sails.config.globals._1vs1['room' + game.id].users.indexOf(req.session.passport.user) >= 0){
				return;
			}
			sails.config.globals._1vs1['room' + game.id].users.push(req.session.passport.user);
			Answer.findOne({questionId: game.currentQuestion,isCorrect:true,id:req.body.answerId}).exec(function(err, ans){
				if(err) return res.json({message:'have_err'});

				var curQuesRoom = sails.config.globals._1vs1['room' + game.id].game.length - 1;
				if(game.user_one == req.session.passport.user){
					sails.config.globals._1vs1['room' + game.id].game[curQuesRoom].u1 = req.body.answerId;
					sails.sockets.broadcast('play-' + game.user_one, 'syncAns',{answerId:req.body.answerId});
				}else{
					sails.config.globals._1vs1['room' + game.id].game[curQuesRoom].u2 = req.body.answerId;
					sails.sockets.broadcast('play-' + game.user_two, 'syncAns',{answerId:req.body.answerId});
				}

				if(!ans){
					sails.config.globals._1vs1['room' + game.id].times = 0;
					return;
				}
				
				if(game.user_one == req.session.passport.user){
					if(sails.config.globals._1vs1['room' + game.id].times == 0 ){
						Game.update({id:game.id},{user_one_score:game.user_one_score + 150}).exec(function(err, update){});;
						sails.config.globals._1vs1['room' + game.id].times = new Date().getTime();
					}else{
						var times = new Date().getTime() - sails.config.globals._1vs1['room' + game.id].times;
						times = Math.ceil(times/1000);
						var user_two_score = game.user_two_score  + (5 * times);
						Game.update({id:game.id},{user_one_score:game.user_one_score + 150, user_two_score: user_two_score})
							.exec(function(err, update){});
					}
				}else if(game.user_two == req.session.passport.user){
					if(sails.config.globals._1vs1['room' + game.id].times ==0 ){
						Game.update({id:game.id},{user_two_score:game.user_two_score + 150}).exec(function(err, update){});;
						sails.config.globals._1vs1['room' + game.id].times = new Date().getTime();
					}else{
						var times = new Date().getTime() - sails.config.globals._1vs1['room' + game.id].times;
						times = Math.ceil(times/1000);
						var user_one_score = game.user_one_score  + 5 * times;
						Game.update({id:game.id},{user_two_score:game.user_two_score + 150, user_one_score: user_one_score})
							.exec(function(err, update){});
					}
				}		
			})
		});
	},
	gameInit: function(req, res){
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		Game.findOne({
				or : [
					{ user_one:req.session.passport.user , currentQuestion: { '!': null }},
					{ user_two:req.session.passport.user , currentQuestion: { '!': null }}
				],
				select:['currentQuestion','id','user_one','user_two','user_one_score','user_two_score']
			}).exec(function(err, game){
				if(err) return res.json({message:'have_err'});
				if(!game) return res.json({message:'have_err'});
				Question.findOne({id:game.currentQuestion}).exec(function(err, ques){
					if(err) return res.json({message:'have_err'});
					if(!ques) return res.json({message:'have_err'});
					Answer.find({where:{questionId: ques.id}, select:['id','content']}).exec(function(err, ans){
						if(err) return res.json({message:'have_err'});
						if(ques.length == 0) return res.json({message:'have_err'});
						socRQ.makePlay(req, function(){
							if(req.session.passport.user == game.user_one){
								var curQuesRoom = sails.config.globals._1vs1['room' + game.id].game.length - 1;
								var answerChoice = sails.config.globals._1vs1['room' + game.id].game[curQuesRoom].u1;
								sails.sockets.broadcast('play-' + req.session.passport.user, 'receiveQuestion',
								{question: ques, answer: ans, me_score:game.user_one_score,
								compatitor_score:game.user_two_score, answerChoice:answerChoice});
							}else if(req.session.passport.user == game.user_two){
								var curQuesRoom = sails.config.globals._1vs1['room' + game.id].game.length - 1;
								var answerChoice = sails.config.globals._1vs1['room' + game.id].game[curQuesRoom].u2;
								sails.sockets.broadcast('play-' + req.session.passport.user, 'receiveQuestion',
								{question: ques, answer: ans, me_score:game.user_two_score,
								compatitor_score:game.user_one_score, answerChoice:answerChoice});
							}
			    		});
					})
				})
			})
	},
	playWithFriendRequest: function(req, res){
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var friendId = parseInt(req.body.friendId);
		var userInfo;
		if(!friendId)  return res.json({message:'have_err'});
		if(friendId == req.session.passport.user) return res.json({message:'have_err'});
		var CountQuestion = function(){
			return new Promise(function(fullfill, reject){
	    		Question.count({jlpt:req.body.jlpt, type:req.body.type, isTest:false}).exec(function(err,count){
	    			if(err) return reject(err);
	    			if(count < 15) return reject('not_enough_question');
	    			return fullfill();
	    		});
	    	});
		}
		var CheckUserOnGame = function(){
			return new Promise(function(fullfill, reject){
	    		Game.findOne({
					or : [
						{ user_one:req.session.passport.user , currentQuestion: { '!': null }},
						{ user_two:req.session.passport.user , currentQuestion: { '!': null }}
					]
				}).populate('user_one').populate('user_two').exec(function(err, game){
					if(err) return reject(err);
					if(game) return reject('user_is_playing');
					if(!game) return fullfill();
				})
	    	});
		}
		var CheckFriendOnGame = function(){
			return new Promise(function(fullfill, reject){
	    		Game.findOne({
					or : [
						{ user_one:friendId, currentQuestion: { '!': null }},
						{ user_two:friendId, currentQuestion: { '!': null }}
					]
				}).populate('user_one').populate('user_two').exec(function(err, game){
					if(err) return reject(err);
					if(game) return reject('friend_is_playing');
					if(!game) return fullfill();
				})
	    	});
		}
		var getUserInfo = function(){
			return new Promise(function(fullfill, reject){
	    		User.findOne({where:{id:req.session.passport.user}, select:['id','displayName']}).exec(function(err, user){
	    			if(err) return reject(err);
	    			if(!user) return reject();
	    			userInfo = user;
	    			userInfo.game = {
	    				type:req.body.type,
	    				jlpt: req.body.jlpt
	    			}
	    			return fullfill();
	    		});
	    	});
		}
		var checkImWaittingRequest = function(){
			return new Promise(function(fullfill, reject){
	    		if(sails.config.globals.roomGame['play-friend-request-' + req.session.passport.user]){
	    			return reject();
	    		}
	    		return fullfill();
	    	});
		}
		var makeRoom2Friend = function(){
			return new Promise(function(fullfill, reject){
	    		socRQ.makeRoomFriend(req.session.passport.user, function(){
	    			socRQ.makeRoomFriend(friendId, function(){
		    			fullfill();
		    		});
	    		})
	    	});
		}
		CountQuestion().then(CheckUserOnGame).then(CheckFriendOnGame).then(checkImWaittingRequest)
		.then(getUserInfo).then(makeRoom2Friend).then(function(){
				//CAN HUY KHI MAT KET NOI VA LOGOUT
				sails.config.globals.roomGame['play-friend-request-' + req.session.passport.user] = friendId;
				socRQ.sendMessageRoomFriend(req.session.passport.user,'friend-game-invite-success',{});
				socRQ.sendMessageRoomFriend(friendId,'friend-game-invite',{sender:userInfo});
		}).catch(function(err){
			if(err == 'not_enough_question'){
				return res.json({message:'not_enough_question'});
			}
			if(err=='user_is_playing'){
				return res.json({message:'user_is_playing'});
			}
			if(err=='friend_is_playing'){
				return res.json({message:'friend_is_playing'});
			}
			if(err=='not_online'){
				return res.json({message:'not_online'});
			}
			return res.json({message:'have_err'});
		})	
	},
	playWithFriendInit: function(req, res){
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		if(sails.config.globals.roomGame['play-friend-request-' + req.session.passport.user]){
			return res.json({message:'in_request'});
		}
	},
	playWithFriendCancel: function(req, res){
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var friendId = parseInt(req.body.friendId);
		if(friendId && sails.config.globals.roomGame['play-friend-request-' + friendId]){
			socRQ.sendMessageRoomFriend(friendId,'friend-game-invite-refuse',{});
			socRQ.sendMessageRoomFriend(req.session.passport.user,'friend-game-invite-im-refuse',{friendId:friendId});
			delete sails.config.globals.roomGame['play-friend-request-' + friendId];
			return res.json({message:'success'});
		}
		friendId = sails.config.globals.roomGame['play-friend-request-' + req.session.passport.user];
		socRQ.sendMessageRoomFriend(friendId,'friend-game-invite-cancel',{userId:req.session.passport.user});
		socRQ.sendMessageRoomFriend(req.session.passport.user,'friend-game-invite-im-cancel',{});
		delete sails.config.globals.roomGame['play-friend-request-' + req.session.passport.user];
		res.json({message:'success'});
	},	
	playWithFriendJoinGame: function(req, res){
		if (!req.isSocket) return res.json({message:'have_err'});
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		//CHECK PLAYER REQUEST
		var friendId = parseInt(req.body.friendId);
		var userId = req.session.passport.user;
		if(!friendId) return res.json({message:'have_err'});
		if(sails.config.globals.roomGame['play-friend-request-' + friendId] != userId)
			return res.json({message:'have_err'});
		//CHECK JLPT AND TYPE
		var jlpt = req.body.jlpt;
		var type = req.body.type;
		if(type != 'kanji' && type != 'grammar' && type != 'vocabulary' && type != 'ALL') return res.json({message:'have_err'});
		if(jlpt != 'N1' && jlpt != 'N2' && jlpt != 'N3' && jlpt != 'N4' && jlpt != 'N5' && jlpt != 'ALL') res.json({message:'have_err'});
		var questionWhere = {
			type: type,
			jlpt: jlpt,
			isTest: false
		}
		if(type == 'ALL'){
			questionWhere.type = {'contains':''}
		}
		if(jlpt == 'ALL'){
			questionWhere.jlpt = {'contains':''}
		}
		//CHECK IN GAME FOR USER
		let checkInGameForUser = function(){
	    	return new Promise(function(fullfill, reject){
	    		Game.findOne({
					or : [
						{ user_one:userId , currentQuestion: { '!': null }},
						{ user_two:userId , currentQuestion: { '!': null }}
					],
					select:['id','user_one','user_two']
				}).populate('user_one').populate('user_two').exec(function(err, game){
					if(err) return reject(err);
					if(game) return reject('user_in_game');
					return fullfill();
				});
	    	});
	    }
		//CHECK IN GAME FOR FRIEND
		let checkInGameForFriend = function(){
	    	return new Promise(function(fullfill, reject){
	    		Game.findOne({
					or : [
						{ user_one:friendId , currentQuestion: { '!': null }},
						{ user_two:friendId , currentQuestion: { '!': null }}
					],
					select:['id','user_one','user_two']
				}).populate('user_one').populate('user_two').exec(function(err, game){
					if(err) return reject(err);
					if(game) return reject('player_in_game');
					return fullfill();
				});
	    	});
	    }
		//SETUP GAME
		var gameId;
		var totalQues = 15;
		var skip = 0;
		let SetUpPlayer = function(){
	    	return new Promise(function(fullfill, reject){
	    		Game.create({status:false, user_one:friendId, user_two:userId, mode:2}).exec(function(err,game){
					if(err) return reject(err);
					gameId= game.id;
					return fullfill();
				})
	    	})
	    }
		let SetUpQuestion = function(){
	    	return new Promise(function(fullfill, reject){
	    		Question.find({ select: ['id'], where: questionWhere }).exec(function(err, quesIds){
	    			if(err) return reject(err);
	    			if(quesIds.length < totalQues) return reject('not_enough_question');
	    			quesIds = require('../services/shuffleArray.js')(quesIds);
	    			Game.findOne({id:gameId}).exec(function(err, game){
	    				if(err) return reject(err);
	    				var i = 0;
	    				for(i = 0 ; i < totalQues; i++ ){
	    					game.questions.add(quesIds.pop().id);
	    				}
	    				game.save(function(err){
							if(err) return reject(err);
							return fullfill();
						})
	    			});
	    		})
	    	})
	    }
	    checkInGameForUser().then(checkInGameForFriend).then(SetUpPlayer).then(SetUpQuestion).then(function(){
	    	socRQ.sendMessageRoomFriend(friendId,'join-game-friend',{});
	    	socRQ.sendMessageRoomFriend(userId,'join-game-friend',{});
	    }).catch(function(err){

	    });
	},
	top10: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:"have_error"});
		User.query(query.top10Rank(), [], function(err, top10){
			if(err) return res.json({message:"have_error"});
			for(var i = 0; i < top10.length; i ++){
				top10[i].level = countLevel(top10[i].level);
			}
			return res.json({message:'success',top10:top10});
		});
	},
	history: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		var mode = req.body.mode;
		var limit = req.body.limit;
		var skip = req.body.skip;
		var userId = req.session.passport.user;
		var count = 0;
		let countGame = function(){
	    	return new Promise(function(fullfill, reject){
	    		Game.count({
					or : [
						{ user_one:userId , currentQuestion:  null,mode:mode },
						{ user_two:userId , currentQuestion:  null,mode:mode }
					]
				}).exec(function(err, _count){
					if(err) return reject(err);
					count = _count;
					return fullfill();
				});
	    	})
	    }
		let getGame = function(){
	    	return new Promise(function(fullfill, reject){
	    		Game.find({
					or : [
						{ user_one:userId , currentQuestion:  null,mode:mode },
						{ user_two:userId , currentQuestion:  null,mode:mode }
					],
					skip: skip,
					limit: limit,
					sort: 'id DESC'
				}).populate('user_one').populate('user_two').exec(function(err, game){
					if(err) return reject(err);
					fullfill(game);
				});
	    	})
	    }
	    countGame().then(getGame).then(function(games){
	    	var history = [];
	    	for(var i = 0; i < games.length; i++){
	    		if(userId == games[i].user_one.id){
	    			history.push({
	    				me:{
	    					id:games[i].user_one.id,
	    					avatar:games[i].user_one.avatar,
	    					displayName:games[i].user_one.displayName,
	    					score:games[i].user_one_score
	    				},
	    				compatitor:{
	    					id:games[i].user_two.id,
	    					avatar:games[i].user_two.avatar,
	    					displayName:games[i].user_two.displayName,
	    					score:games[i].user_two_score
	    				},
	    			});
	    		}else if(userId == games[i].user_two.id){
	    			history.push({
	    				me:{
	    					id:games[i].user_two.id,
	    					avatar:games[i].user_two.avatar,
	    					displayName:games[i].user_two.displayName,
	    					score:games[i].user_two_score
	    				},
	    				compatitor:{
	    					id:games[i].user_one.id,
	    					avatar:games[i].user_one.avatar,
	    					displayName:games[i].user_one.displayName,
	    					score:games[i].user_one_score
	    				}
	    			});
	    		}
	    	}
	    	res.json({message:'success', history:history, count:count});
	    }).catch(function(err){
	    	res.json({message:'have_err'})
	    });

	},
	isPLaying: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		Game.findOne({
			or : [
				{ user_one:req.session.passport.user , currentQuestion: { '!': null }},
				{ user_two:req.session.passport.user , currentQuestion: { '!': null }}
			]
		}).populate('user_one').populate('user_two').exec(function(err, game){
			if(err) return res.json({message:'have_err'});
			if(game) return res.json({message:'user_is_playing'});
			if(!game) return res.json({message:'user_not_playing'});
		})
	}
};

