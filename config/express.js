var bcryptPassword = require('../api/services/bcryptPassword.js');
var passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	LocalStrategy   = require('passport-local').Strategy;

var facebookHandle = function(token, tokenSecret, profile, done) {
	process.nextTick(function(){
		User.findOne({fid: profile.id}, function(err, user){
			if(user) {
				//User da co trong DB
				User.update({id : user.id},{
					fid: profile.id,
					// displayName: profile.name.familyName + ' '+ profile.name.givenName,
					// avatar: profile.photos[0].value
				}).exec(function afterwards(err, updated){
					return done(null, user);
				});
			} else {
				//User CHUA co trong DB
				var data = {
					fid: profile.id,
					displayName: profile.name.familyName + ' '+ profile.name.givenName,
					avatar: profile.photos[0].value,
					isActive:true
				};
				User.create(data, function(err, user){
					return done(err, user);
				});
			}
		});
	});
}
var googleHandle = function(token, tokenSecret, profile, done) {
	process.nextTick(function(){
		var photoUrl = profile.photos[0].value.split('?')[0] + '?sz=320';
		var displayName = 'User' + profile.id;
		if(profile.displayName){
			displayName = profile.displayName;
		}else if(profile.name.familyName || profile.name.givenName){
			displayName = profile.name.familyName + ' ' + profile.name.givenName;
			displayName = displayName.trim();
		}
		User.findOne({gid: profile.id}, function(err, user){
			if(user) {
				//User da co trong DB
				User.update({id : user.id},{
					gid: profile.id,
					// displayName: profile.displayName,
					// avatar: photoUrl
				}).exec(function afterwards(err, updated){
					return done(null, user);
				});
			} else {
				//User CHUA co trong DB
				var data = {
					gid: profile.id,
					displayName: displayName,
					avatar: photoUrl,
					isActive:true
				};
				User.create(data, function(err, user){
					return done(err, user);
				});
			}
		});
	});
}
var localHandle = function(username, password, done){
	process.nextTick(function(){
		User.findOne({email:username}, function(err, user){
			if(err){return done(err)}
			if(!user){
				return done(null, false, {message:'email_not_found'});
			}
			bcryptPassword.decode(password, user.password, function(ok){
				if(!ok)	return done(null, false, { message: 'password_not_correct' });
				if(!user.isActive)	return done(null, false, {message:'account_not_active'});
				return done(null, user);
			});
		})
	});
}

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	User.findOne({id:id}, function(err, user){
		done(err, user);
	})
});

module.exports.http = {
	customMiddleware: function(app) {
		passport.use(new FacebookStrategy({
			clientID: "1902837660040417", 
			clientSecret: "c0a56ec89e688eba08fbde1bb6fb4044", 
			callbackURL: "http://yugenvn.com/login/facebook/callback",
			profileFields: ['id','name', 'picture.width(320).height(320)']
		}, facebookHandle));
		passport.use(new GoogleStrategy({
		    clientID: '336649618127-n6rr9oeiqvpllvj1s1mocqf08vkktnf8.apps.googleusercontent.com',
		    clientSecret: 'w2tp1kev3rVQfcsoXOtmg1wI',
		    callbackURL: "http://yugenvn.com/login/facebook/callback"
	  	},googleHandle));
		passport.use(new LocalStrategy({
		    usernameField: 'login_email',
		    passwordField: 'login_password'
		},localHandle));
		app.use(passport.initialize());
		app.use(passport.session());
	}
	
}

