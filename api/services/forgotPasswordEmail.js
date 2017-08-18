var Cryptr = require('cryptr'),
    cryptr = new Cryptr('encryptverifyemail');
var mail = require('../services/sendMail.js');

var verifyMail ={
	mailOptions:{
	    from: 'yugenvn@gmail.com', // sender address
	    subject: 'Verify Yugen', // Subject line
	    text: 'Hello world ?', // plain text body
	},
	templateUrl:require('path').join(__dirname, '../../views/template/index/email/forgot-password'),
	render:{}

}
module.exports = {
	sendVerify: function(user, cb) {
		var hash = cryptr.encrypt(user.id + '|' + user.email + '|' + user.updatedAt);
		verifyMail.mailOptions.to = user.email;
		verifyMail.render = {
			displayName: user.displayName,
			linkForgot: 'http://localhost:1337/forgot?code=' + hash,
		}
		mail.sendMail(verifyMail, function(err){
			if(err)	return cb(err);
			return cb();
		});
	},
	verifyCode: function(code, cb) {
		 try{
		 	decryptedString = cryptr.decrypt(code);
		 	cb(decryptedString.split('|')[0], decryptedString.split('|')[2]);
		 }catch(e){
		 	cb()
		 }
	}
};
