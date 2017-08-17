/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var offline = require('../services/offlineUser.js');
var query = require('../services/query.js');
var countLevel = require('../services/countLevel.js');
module.exports = {
	index: function(req, res) {
		User.findOne({id:req.session.passport.user}, function(err, user){
			user.level = countLevel(user.level)
			res.view('template/index/index.ejs',{user:user});
		});
	},
	profile: function(req, res){
		User.query(query.myProfile(req.session.passport.user), [], function(err, data){
			data[0].level = countLevel(data[0].level);
			res.view('template/index/profile.ejs',{user:data[0]});
		});
	},
	login: function(req, res){
		res.view('template/index/login');
	},

	logout: function(req, res) {
		if(req.session.passport == undefined)
			res.redirect('/login');
		else
		offline.logout(req, function(){
			req.logout();
			req.session.passport.role = undefined;
			res.redirect('/login');
		})
	},
	//ROUTE FOR PRACTICE
	practice: function(req, res){
		var type = req.param('type');
		var jlpt = req.param('jlpt');
		if(type != 'kanji' && type != 'grammar' && type != 'vocabulary') return res.notFound();
		if(jlpt != 'N1' && jlpt != 'N2' && jlpt != 'N3' && jlpt != 'N4' && jlpt != 'N5') return res.notFound();
		User.findOne({id:req.session.passport.user}, function(err, user){
			user.level = countLevel(user.level);
			res.view('template/index/practice.ejs',{user:user});
		});
	},
	//ROUTE FOR RANK
	play: function(req, res){
		User.findOne({id:req.session.passport.user}, function(err, user){
			Game.findOne({
				or : [
					{ user_one:req.session.passport.user , currentQuestion: { '!': null }},
					{ user_two:req.session.passport.user , currentQuestion: { '!': null }}
				],
				select:['currentQuestion','id','user_one','user_two','user_one_score','user_two_score']
			}).populate('user_one').populate('user_two').exec(function(err, game){
				if(err) return res.serverError();
				if(!game) return res.redirect('/');
				if(req.session.passport.user == game.user_one.id){
					compatitor = game.user_two;
				}else{
					compatitor = game.user_one;
				}
				user.level = countLevel(user.level);
				compatitor.level = countLevel(compatitor.level);
				res.view('template/index/playGame.ejs',{user:user, compatitor:compatitor});
			})
		});
	},
	//ROUTE FOR TEST
	test: function(req, res){
		User.findOne({id:req.session.passport.user}, function(err, user){
			Test.findOne({
				where:{user:req.session.passport.user, status: false},
			}).exec(function(err, test){
				if(err) return res.serverError();
				if(!test) return res.redirect('/');
				
				user.level = countLevel(user.level);
				res.view('template/index/test.ejs',{user:user});
			})
		});
	},
	//ROUTE FOR BOOKMARK
	bookmark: function(req, res) {
		User.findOne({id:req.session.passport.user}, function(err, user){
			user.level = countLevel(user.level)
			res.view('template/index/bookmark.ejs',{user:user});
		});
	},
	//ROUTE FOR ADMIN
	adminLogin: function(req, res) {
		res.view('template/admin/login');
	},
	admin: function(req, res){
		User.findOne({id:req.session.passport.user}, function(err, user){
			res.view('template/admin/index',{user:user});
		});
	},
	addQuestion: function(req, res){
		User.findOne({id:req.session.passport.user}, function(err, user){
			res.view('template/admin/add-question',{user:user});
		});
	},
	listQuestion: function(req, res){
		User.findOne({id:req.session.passport.user}, function(err, user){
			res.view('template/admin/list-question',{user:user});
		});
	},
	listReport: function(req, res){
		User.findOne({id:req.session.passport.user}, function(err, user){
			res.view('template/admin/list-report',{user:user});
		});
	}
};

