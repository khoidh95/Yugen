var query = require('../services/query.js');
module.exports = function (id, cb) {
	Online.query(query.listSocketFriend([id]), [], function(err, data){
		if(err) return;
		var socket = [];
		for(var i = 0; i < data.length; i++){
			socket.push(data[i].socketId);
		}
		cb(socket);
	})
}