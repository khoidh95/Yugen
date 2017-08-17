module.exports = {
	encode: function (password, cb) {
		require('bcrypt').hash(password, 10).then(function(hash) {
			return cb(hash);
		});
	},
	decode: function (password, hash, cb){
		require('bcrypt').compare(password, hash, function(err, isOk) {
			cb(isOk);
		});
	}
};

