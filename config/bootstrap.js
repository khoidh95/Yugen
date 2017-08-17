/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {
	var destroyOnline = function(){
    	return new Promise(function(fullfill, reject){
    		Online.destroy({}).exec(function (err) {
    			return fullfill();
    		});
    	})
    }
	var createAdminDefault = function(){
    	return new Promise(function(fullfill, reject){
    		User.findOrCreate({email:'yugenvn@gmail.com'}
			,{email:'yugenvn@gmail.com', isActive:true, displayName:'Yugen Admin', password:'abc123', role:'admin', avatar:'/images/avatar-default.png'})
			.exec(function(err, user){
				return fullfill();
			});
    	})
    }
    var createJlptDefault = function(){
    	return new Promise(function(fullfill, reject){
    		Jlpt.findOrCreate({name:'N1'},{name:'N1'}).exec(function(err, user){
				Jlpt.findOrCreate({name:'N2'},{name:'N2'}).exec(function(err, user){
					Jlpt.findOrCreate({name:'N3'},{name:'N3'}).exec(function(err, user){
						Jlpt.findOrCreate({name:'N4'},{name:'N4'}).exec(function(err, user){
							Jlpt.findOrCreate({name:'N5'},{name:'N5'}).exec(function(err, user){
								Jlpt.findOrCreate({name:'NOT'},{name:'NOT'}).exec(function(err, user){
									return fullfill();
								});
							});
						});
					});
				});
			});
    	})
    }
    var updateGameAfterTurnOffServer = function(){
        return new Promise(function(fullfill, reject){
            Game.update({
                currentQuestion: { '!': null },
                status: true
            },{currentQuestion:null}).exec(function(err, game){
                fullfill();
            })
        })
        
    }
    var updateTestAfterTurnOffServer = function(){
        return new Promise(function(fullfill, reject){
            Test.update({
                status: false
            },{status: true}).exec(function(err, game){
                fullfill();
            })
        })
        
    }
    destroyOnline().then(createAdminDefault).then(createJlptDefault).then(updateGameAfterTurnOffServer).then(updateTestAfterTurnOffServer).then(function(){
    	cb();
    }).catch(function(){
    	cb();
    })
  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

};
