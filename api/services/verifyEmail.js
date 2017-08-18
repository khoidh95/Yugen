var Cryptr = require('cryptr'),
cryptr = new Cryptr('encryptverifyemail');
var mail = require('../services/sendMail.js');

var verifyMail ={
mailOptions:{
	from: 'yugenvn@gmail.com', // sender address
	subject: 'Verify Yugen', // Subject line
	text: 'Hello world ?', // plain text body
},
templateUrl:require('path').join(__dirname, '../../views/template/index/email/verify-register'),
render:{}

}
module.exports = {
sendVerify: function(user, cb) {
	var hash = cryptr.encrypt(user.id + '-' + user.email);
	verifyMail.mailOptions.to = user.email;
	verifyMail.render = {
		displayName: user.displayName,
		linkVerify: 'http://yugenvn.com/verify?verifycode=' + hash,
	}
	mail.sendMail(verifyMail, function(err){
		if(err)	return cb(err);
		return cb();
	});
},
verifyCode: function(code, cb) {
	 try{
		 decryptedString = cryptr.decrypt(code);
		 cb(decryptedString.split('-')[0]);
	 }catch(e){
		 cb()
	 }
}
};

