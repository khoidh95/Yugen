module.exports = {
	validate: function(req, cb) {
		var isValid = {
			email:false,
			displayName: false,
			password: false
		};
		var rexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		var rexDisplayName = /\s\s+/g;
		//checkEmail
		isValid.email = (rexEmail.test(req.body.email) && req.body.email.length >= 5 && req.body.email.length <= 45);
		isValid.displayName = (!rexDisplayName.test(req.body.displayName.trim()) && req.body.displayName.trim().length >= 2 && req.body.displayName.trim().length <= 45)
		isValid.password = (req.body.password.trim().length >= 6 && req.body.password.trim().length <= 18);
		cb(isValid);
	}	
};

