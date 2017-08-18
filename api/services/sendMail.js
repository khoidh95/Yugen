var nodemailer = require('nodemailer');
var EmailTemplate = require('email-templates').EmailTemplate;
var sgTransport = require('nodemailer-sendgrid-transport');
module.exports = {
	sendMail: function(mail, cb) {
		var options = {
			auth: {
			  api_user: 'khoidh',
			  api_key: '9872141166a'
			}
		  }
		var client = nodemailer.createTransport(sgTransport(options));
		var template = new EmailTemplate(mail.templateUrl);
		template.render(mail.render, function(err, result) {
			if (err) return cb(err);
			mail.mailOptions.html = result.html;
    		client.sendMail(mail.mailOptions, function(error, info) {
    			if (error) return cb(error);
    			cb();
		        // Handle error, etc
		    });
		});
	}
};