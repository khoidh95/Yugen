/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	add: function (req, res) {
		if (!require('../services/checkSession.js')(req)) return res.json({ message: 'have_err' });
		if (req.session.passport.role != 'admin') return res.json({ message: 'have_err' });
		var data = req.body.data;
		let insertQuestion = function () {
			return new Promise(function (fullfill, reject) {
				function insertDeQuy(d) {
					Question.create({
						content: d[0].content,
						explain: d[0].explain,
						jlpt: d[0].jlpt,
						isTest: d[0].isTest,
						type: d[0].type
					}).exec(function (err, question) {
						if (err) return reject(err);
						if (question.length == 0) return reject(err);
						var ans = [];
						for (var i = 0; i < d[0].answer.length; i++) {
							ans.push({
								questionId: question.id,
								content: d[0].answer[i].content,
								isCorrect: d[0].answer[i].isCorrect
							})
						}
						Answer.create(ans).exec(function (err, answers) {
							if (err) return reject(err);
							d.shift();
							if (d.length == 0) return fullfill();
							insertDeQuy(d);
						});
					})
				}
				insertDeQuy(data);
			})
		}
		insertQuestion().then(function () {
			res.json({ message: 'success' })
		}).catch(function (err) {
			res.json({ message: 'have_err', err: err });
		})
	},
	list: function (req, res) {
		if (!require('../services/checkSession.js')(req)) return res.json({ message: 'have_err' });
		if (req.session.passport.role != 'admin') return res.json({ message: 'have_err' });
		var count = 0;
		var quesData;
		var where = {
			jlpt: { 'contains': req.body.jlpt.trim() },
			content: { 'contains': req.body.content.trim() },
			explain: { 'contains': req.body.explain.trim() },
			type: { 'contains': req.body.type.trim() },
			isTest: { 'contains': req.body.isTest }
		}
		if (req.body.isTest !== '') {
			//where.isTest = (req.body.isTest == 'true')
			where.isTest = req.body.isTest;
		}
		let countQuestion = function () {
			return new Promise(function (fullfill, reject) {
				Question.count(where).exec(function (err, found) {
					if (err) return reject(err);
					count = found;
					return fullfill();
				})
			})
		}
		let getQuestion = function () {
			return new Promise(function (fullfill, reject) {
				Question.find({
					where: where,
					skip: req.body.skip,
					limit: req.body.limit,
					sort: 'id DESC'
				})
					.populate('answer').exec(function (err, data) {
						if (err) return reject(err);
						quesData = data;
						return fullfill();
					});
			})
		}
		countQuestion().then(getQuestion).then(function () {
			res.json({ message: 'success', data: quesData, count: count });
		}).catch(function (err) {
			res.json({ message: 'have_err', err: err });
		})
	},
	update: function (req, res) {
		if (!require('../services/checkSession.js')(req)) return res.json({ message: 'have_err' });
		if (req.session.passport.role != 'admin') return res.json({ message: 'have_err' });
		var question = req.body.question;
		var answer = question.answer;
		var listAnswerDelete = [];
		var listAnswerUpdate = [];
		var listAnswerInsert = [];
		for (var i = 0; i < answer.length; i++) {
			if (answer[i].id == undefined) {
				listAnswerInsert.push({
					questionId: question.id,
					content: answer[i].content,
					isCorrect: answer[i].isCorrect
				});
			} else {
				//day nay k chua nhung thang xoa ma chi chua update
				listAnswerUpdate.push(answer[i]);
			}
		}
		let getListDeleteAnswer = function () {
			return new Promise(function (fullfill, reject) {
				Answer.find({ questionId: question.id }).exec(function (err, ans) {
					if (err) return reject(err);
					if (listAnswerUpdate.length == 0) {
						listAnswerDelete = ans;
						return fullfill();
					}
					for (var i = 0; i < ans.length; i++) {
						for (var j = 0; j < listAnswerUpdate.length; j++) {
							if ((j == listAnswerUpdate.length - 1) && (ans[i].id != listAnswerUpdate[j].id)) {
								listAnswerDelete.push(ans[i]);
							}
							if (ans[i].id == listAnswerUpdate[j].id) break;
						}
					}
					return fullfill();
				});
			})
		}
		let deleteAnswer = function () {
			return new Promise(function (fullfill, reject) {
				if (listAnswerDelete.length == 0) return fullfill();
				function deleteAnswerDeQuy(arr) {
					Answer.destroy({ id: arr[0].id }).exec(function (err) {
						if (err) return reject(err);
						arr.shift();
						if (arr.length == 0) return fullfill();
						deleteAnswerDeQuy(arr);
					})
				}
				deleteAnswerDeQuy(listAnswerDelete);
			});
		}
		let updateAnswer = function () {
			return new Promise(function (fullfill, reject) {
				if (listAnswerUpdate.length == 0) return fullfill();
				function updateAnswerDeQuy(arr) {
					Answer.update({ id: arr[0].id }, {
						content: arr[0].content,
						isCorrect: arr[0].isCorrect
					}).exec(function (err) {
						if (err) return reject(err);
						arr.shift();
						if (arr.length == 0) return fullfill();
						updateAnswerDeQuy(arr);
					})
				}
				updateAnswerDeQuy(listAnswerUpdate);
			});
		}
		let insertAnswer = function () {
			return new Promise(function (fullfill, reject) {
				if (listAnswerInsert.length == 0) return fullfill();
				Answer.create(listAnswerInsert).exec(function (err, ans) {
					if (err) return reject(err);
					return fullfill();
				})
			});
		}

		let updateQuestion = function () {
			return new Promise(function (fullfill, reject) {
				Question.update({ id: question.id }, {
					content: question.content,
					explain: question.explain,
					jlpt: question.jlpt,
					isTest: question.isTest,
					type: question.type
				}).exec(function (err, ques) {
					if (err) return reject(err);
					return fullfill();
				})
			});
		}
		getListDeleteAnswer().then(updateQuestion).then(deleteAnswer)
			.then(updateAnswer).then(insertAnswer)
			.then(function () {
				res.json({ message: 'success' });
			}).catch(function (err) {
				res.json({ message: 'have_err', err: err });
			});
	},
	delete: function (req, res) {
		if (!require('../services/checkSession.js')(req)) return res.json({ message: 'have_err' });
		if (req.session.passport.role != 'admin') return res.json({ message: 'have_err' });
		if (typeof (req.body.id) != 'number') return res.json({ message: 'have_err' });
		Question.destroy({ id: req.body.id }).exec(function (err) {
			if (err) return res.json({ message: 'have_err' });
			Answer.destroy({ questionId: req.body.id }).exec(function (err) {
				if (err) return res.json({ message: 'have_err' });
				res.json({ message: 'success' });
			})
		})
	},
	getOne: function (req, res) {
		if (!require('../services/checkSession.js')(req)) return res.json({ message: 'have_err' });
		if (req.session.passport.role != 'admin') return res.json({ message: 'have_err' });
		if (typeof (req.body.id) != 'number') return res.json({ message: 'have_err' });
		Question.findOne({ id: req.body.id })
			.populate('answer').exec(function (err, data) {
				if (err) return res.json({ message: 'have_err' });
				return res.json({ message: 'success', question: data });
			});
	},
	randomARecord: function (req, res) {
		if (!require('../services/checkSession.js')(req)) return res.json({ message: 'have_err' });
		var type = req.body.type;
		var jlpt = req.body.jlpt;
		if (type != 'kanji' && type != 'grammar' && type != 'vocabulary') return res.json({ message: 'have_err' });
		if (jlpt != 'N1' && jlpt != 'N2' && jlpt != 'N3' && jlpt != 'N4' && jlpt != 'N5') res.json({ message: 'have_err' });
		var where = {
			type: type,
			jlpt: jlpt,
			isTest: false
		}
		Question.find(where).populate('answer').exec(function (err, ques) {
			if (err) return res.json({ message: 'have_err' });
			if (ques.length == 0) return res.json({ message: 'not_enough_question' });
			var randomRecord = ques[Math.floor(Math.random() * ques.length)];
			for (i = 0; i < randomRecord.answer.length; i++) {
				randomRecord.answer[i].isCorrect = undefined;
			}
			res.json({ message: 'success', question: randomRecord });
		})
	},
	getAnswerCorrect: function (req, res) {
		if (!require('../services/checkSession.js')(req)) return res.json({ message: 'have_err' });
		Answer.findOne({
			questionId: req.body.questionId,
			isCorrect: true
		}).exec(function (err, ans) {
			if (err) res.json({ message: 'have_err', err: err });
			if (!ans) res.json({ message: 'have_err', err: err });
			res.json({ message: 'success', answer: ans });
		})
	}
};

