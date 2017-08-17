/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var passport = require('passport');
module.exports = {
	local: function (req, res) {
		 passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login', failureFlash: true},function(err, user, info){
		 	if(err){
		 		return res.badRequest(err);
		 	}
		 	if(!user){
		 		var email = require('querystring').escape(req.body.login_email);
		 		return res.redirect('/login?login_message=' + info.message + '&email=' + email);
			 }
			if(user.role == 'admin'){
		 		var email = require('querystring').escape(req.body.login_email);
		 		return res.redirect('/admin/login?login_message=not_admin'+ '&email=' + email);
		 	}
			req.logIn(user, function(err){
				if (err) {
					return res.forbidden(err);
				}
				if (req.body.remember) {
			      req.session.cookie.maxAge = 3 * 24 * 60 * 60 * 1000; //30 * 24 * 60 * 60 * 1000; 
			    } else {
			      req.session.cookie.expires = false;
			    }
			    return res.redirect('/');
			});
		})(req, res);
	},
	facebook: function(req, res) {
		passport.authenticate('facebook', { failureRedirect: '/login', scope: ['email','public_profile'] }, function(err, user){
			req.logIn(user, function(err){
				if (err) {
					return res.badRequest(err);
				}
				return res.redirect('/');
			});
		})(req, res);
	},
	google: function(req, res) {
		passport.authenticate('google', { failureRedirect: '/login', scope: ['email'] }, function(err, user){
			req.logIn(user, function(err){
				if (err) {
					return res.badRequest(err);
				}
				return res.redirect('/');
			});
		})(req, res);
	},
	admin: function(req, res){
		passport.authenticate('local', { successRedirect: '/admin',failureRedirect: '/admin/login', failureFlash: true},function(err, user, info){
		 	if(err){
		 		return res.badRequest(err);
		 	}
		 	if(!user){
		 		var email = require('querystring').escape(req.body.login_email);
		 		return res.redirect('/admin/login?login_message=' + info.message + '&email=' + email);
		 	}

		 	if(user.role != 'admin'){
		 		var email = require('querystring').escape(req.body.login_email);
		 		return res.redirect('/admin/login?login_message=not_admin'+ '&email=' + email);
		 	}
			req.logIn(user, function(err){
				if (err) {
					return res.forbidden(err);
				}
				if (req.body.remember) {
			      req.session.cookie.maxAge = 3 * 24 * 60 * 60 * 1000; //30 * 24 * 60 * 60 * 1000; 
			    } else {
			      req.session.cookie.expires = false;
			    }
			    req.session.passport.role = 'admin';
			    return res.redirect('/admin');
			});
		})(req, res);
	}
};

