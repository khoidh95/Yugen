var mysql = {
	listFriendId:function(userId) {
		var query = 'SELECT IF(u.id > r.user_one,r.user_one,r.user_two) AS friendId ' +
					'FROM yugen.user as u,yugen.relationship as r ' +
					'WHERE r.status = 3 AND ' +
					'((u.id != r.user_one AND u.id = r.user_two) OR ' +
					'(u.id = r.user_one AND u.id != r.user_two)) ' +
					'AND u.id = ' + userId;
		return query;
	},
	
	listFriendOnline: function(list) {
		var head= 'SELECT u.id, u.displayName, u.jlpt, u.level, u.avatar, u.score,  ' +
					'(SELECT COUNT(*) FROM yugen.user WHERE yugen.user.score>=u.score) AS rank  ' +
					'FROM yugen.user as u , yugen.online as o  ' +
					'WHERE u.id = o.userId ' +
					'AND (';
		var tails = ') ' +
					'GROUP BY o.userId ';
		var center = '';
		for(var i = 0 ; i < list.length; i++){
			center += 'u.id = ' + list[i] + ' OR ';
		}
		center = center.substring(0, center.length-3);
		var query = head + center + tails;
		return query;
	},
	// SELECT u.id, u.displayName, u.jlpt, u.level, u.avatar, u.score, 
	// (SELECT COUNT(*) FROM yugen.user WHERE yugen.user.score>=u.score) AS rank 
	// FROM yugen.user as u , yugen.online as o 
	// WHERE u.id = o.userId
	// AND (u.id=1 OR u.id=3)
	// GROUP BY o.userId

	listFriendOffline: function(list) {
		var head= 'SELECT u.id, u.displayName, u.jlpt, u.level, u.avatar, u.score,  ' +
					'(SELECT COUNT(*) FROM yugen.user WHERE yugen.user.score>=u.score) AS rank  ' +
					'FROM yugen.user as u  ' +
					'LEFT JOIN yugen.online as o ' +
					'ON u.id = o.userId ' +
					'WHERE o.userId IS NULL ' +
					'AND (';
		var tails = ') ';
		var center = '';
		for(var i = 0 ; i < list.length; i++){
			center += 'u.id = ' + list[i] + ' OR ';
		}
		center = center.substring(0, center.length-3);
		var query = head + center + tails;
		return query;
	},
	// SELECT u.id, u.displayName, u.jlpt, u.level, u.avatar, u.score, 
	// (SELECT COUNT(*) FROM yugen.user WHERE yugen.user.score>=u.score) AS rank 
	// FROM yugen.user as u 
	// LEFT JOIN yugen.online as o
	// ON u.id = o.userId
	// WHERE o.userId IS NULL
	// AND (u.id=1 OR u.id=3)

	listSocketFriend: function(list){
		var head= "SELECT o.socketId " +
					"FROM yugen.online AS o " +
					"WHERE ";
		var center = '';
		for(var i = 0 ; i < list.length; i++){
			center += 'o.userId = ' + list[i] + ' OR ';
		}
		center = center.substring(0, center.length-3);
		var query = head + center ;
		return query;
	},
	// SELECT o.socketId
	// FROM yugen.online AS o
	// WHERE o.userId = 1 or o.userId =3
	
	myProfile: function(myId){
		var query = 'SELECT u.id, u.displayName, u.jlpt, u.level, u.avatar, u.score,  ' +
					'(SELECT COUNT(*) FROM yugen.user WHERE yugen.user.score>=u.score and role = "member") AS rank  ' +
					'FROM yugen.user as u ' +
					'WHERE u.id = ' + myId;
		return query;
	},
	// SELECT u.id, u.displayName, u.jlpt, u.level, u.avatar, u.score, 
	// (SELECT COUNT(*) FROM yugen.user WHERE yugen.user.score>=u.score) AS rank 
	// FROM yugen.user as u 
	// WHERE u.id = 1

	listIdFriendRequest: function(myId){
		var query = 'SELECT if(r.status = 2, r.user_two, 0) + if(r.status = 1, r.user_one, 0) AS friendId ' +
					'FROM yugen.relationship as r ' +
					'WHERE r.status != 3 ' +
					'AND ((r.status = 2 AND r.user_one = ' + myId + ') OR (r.status =1 AND r.user_two = ' + myId + ')) ORDER BY r.createdAt DESC';
		return query;
	},
	// SELECT if(r.status = 2, r.user_two, 0) + if(r.status = 1, r.user_one, 0) AS friendId
	// FROM yugen.relationship as r
	// WHERE r.status != 3
	// AND ((r.status = 2 AND r.user_one = 2) OR (r.status =1 AND r.user_two = 2))

	listUserInfo: function(list) {
		var head= 'SELECT u.id, u.displayName, u.jlpt, u.level, u.avatar, u.score, ' +
					'(SELECT COUNT(*) FROM yugen.user WHERE yugen.user.score>=u.score) AS rank ' +
					'FROM yugen.user as u ' +
					'WHERE ';
		var center = '';
		for(var i = 0 ; i < list.length; i++){
			center += 'u.id = ' + list[i] + ' OR ';
		}
		center = center.substring(0, center.length-3);
		var query = head + center;
		return query;
	},
	// SELECT u.id, u.displayName, u.jlpt, u.level, u.avatar, u.score, 
	// (SELECT COUNT(*) FROM yugen.user WHERE yugen.user.score>=u.score) AS rank 
	// FROM yugen.user as u 
	// WHERE u.id = 1 OR u.id = 2
	top10Rank: function(){
		return 'SELECT u.id, u.displayName, u.jlpt, u.level, u.avatar, u.score, '+
				'(SELECT COUNT(*) FROM yugen.user WHERE yugen.user.score>=u.score and role = "member" and isActive = true) AS rank '+
				'FROM yugen.user as u WHERE u.role = "member" and isActive = true '+
				'ORDER BY rank '+
				'LIMIT 0, 10';
	},
	// SELECT r.id, r.userId,r.questionId,r.content, r.resolve,q.content as "question_content",
	// q.explain as "question_explain",q.type as "question_type",q.jlpt as"question_jlpt",
	// q.isTest as "question_isTest"
	// q.isTest as "question_isTest"
	// FROM yugen.report as r 
	// LEFT JOIN yugen.question as q
	// ON r.questionId = q.id
	// WHERE q.type LIKE '%vocabulary%' AND
	// q.jlpt LIKE '%N1%' AND
	// q.type = 0 AND
	// r.resolve = 0
	listReportAndQuestion: function(_type, _jlpt, _isTest, _resolve, _skip, _limit){
		var query = 'SELECT r.id, r.userId,r.questionId,r.content, r.resolve,q.content as "question_content", '+
			'q.explain as "question_explain",q.type as "question_type",q.jlpt as"question_jlpt", '+
			'q.isTest as "question_isTest" '+
			'FROM yugen.report as r ' +
			'LEFT JOIN yugen.question as q ' +
			'ON r.questionId = q.id ' +
			'WHERE q.type LIKE "%' + _type + '%" AND ' +
			'q.jlpt LIKE "%' + _jlpt + '%" ';
		if(typeof(_isTest) == 'boolean'){
			query += ' AND q.isTest = ' + (_isTest ? 1 : 0);
		}
		if(typeof(_resolve) == 'boolean'){
			query += ' AND r.resolve = ' + (_resolve ? 1 : 0);
		}
		query += ' ORDER BY r.id DESC ';
		if(typeof(_skip) == 'number' && typeof(_limit) == 'number'){
			query += ' LIMIT ' + _skip + ', ' + _limit;
		}
		return query;
	}
}

module.exports = mysql

