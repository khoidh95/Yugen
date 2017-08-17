/**
 * ReportController
 *
 * @description :: Server-side logic for managing reports
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var query =  require('../services/query.js');
module.exports = {
	createReport: function (req, res) {
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		if(!req.body.content) return res.json({message:'have_err'});
		let checkQuestion = function(){
	    	return new Promise(function(fullfill, reject){
	    		Question.findOne({id:req.body.questionId}).exec(function(err, ques){
	    			if(err) return reject(err);
	    			if(!ques) return reject('question_not_found');
	    			return fullfill();
	    		})
	    	})
	    }
		let checkReport = function(){
	    	return new Promise(function(fullfill, reject){
	    		Report.find({questionId:req.body.questionId,userId: req.session.passport.user}).populate('questionId')
	    		.populate('userId').exec(function(err, report){
					if(err) return reject(err);
					if(report.length != 0) return fullfill(report[0]);
					return fullfill(null);
	    		});
	    	})
	    }
	    checkQuestion().then(checkReport).then(function(report){
	    	if(!report){
	    		Report.create({content:req.body.content, questionId: req.body.questionId, userId: req.session.passport.user})
	    		.exec(function(err, report){
	    			if(err) return res.json({message:'have_err'});
	    			return res.json({message:'success'});
	    		})
	    	}else{
	    		Report.update({id:report.id},{resolve:false,content:req.body.content, questionId: req.body.questionId, userId: req.session.passport.user})
	    		.exec(function(err, report){
	    			if(err) return res.json({message:'have_err'});
	    			return res.json({message:'success'});
	    		});
	    	}
	    });
	},
	listReport: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		if(req.session.passport.role != 'admin') return res.json({message:'have_err'});
		var count = 0;
		let countReport = function(){
			return new Promise(function(fullfill, reject){
				Report.query(query.listReportAndQuestion(req.body.type,req.body.jlpt,req.body.isTest,req.body.resolve), [], function(err, reports){
					if(err) return reject(err);
					count = reports.length;
					return fullfill();
				});
			});
		}
		let getReport = function(){
			return new Promise(function(fullfill, reject){
				Report.query(query.listReportAndQuestion(req.body.type,req.body.jlpt,req.body.isTest,req.body.resolve,req.body.skip,req.body.limit), [], function(err, reports){
					if(err) return reject(err);
				 	if(reports.length == 0) return fullfill([]);
				 	var listReports = [];
					function dequy(arr){
						Answer.find({questionId:arr[0].questionId}).exec(function(err, ans){
							if(err) return reject(err);
							arr[0].answer = ans;
							listReports.push(arr[0]);
							arr.shift();
							if(arr.length > 0){
								dequy(arr);
							}else{
								return fullfill(listReports);
							}
						})
					}
					dequy(reports);
				});
			});
		}
		countReport().then(getReport).then(function(reports){
			return res.json({message:'success', reports:reports, count:count});
		}).catch(function(err){
			return res.json({message:'have_err'});
		})
	},
	updateResolve: function(req, res){
		if(!require('../services/checkSession.js')(req)) return res.json({message:'have_err'});
		if(req.session.passport.role != 'admin') return res.json({message:'have_err'});
		if(typeof(req.body.resolve) != 'boolean') return res.json({message:'have_err'});
		Report.update({id:req.body.id},{resolve:req.body.resolve})
		.exec(function(err, report){
			if(err) return res.json({message:'have_err'});
			return res.json({message:'success'});
		});
	}
};

