/**
 * Game.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	id:{
  		type: 'integer',
  		primaryKey: true,
    	autoIncrement: true
  	},
    status:{
      type: 'boolean',
    },
    currentQuestion:{
      type: 'integer',
      defaultsTo:-1
    },
    mode:{
      type: 'integer'
    },
  	questions:{
      collection: 'question',
      via:'gameId',
      through:'gamedetail'
    },
    user_one:{
      model:'user'
    },
    user_two: {
      model:'user'
    },
    user_one_score:{
      type: 'integer',
      defaultsTo: 0
    },
    user_two_score:{
      type: 'integer',
      defaultsTo: 0
    }
  },
  beforeCreate:function(game, next) {
    if(game.user_one > game.user_two){
      var x= game.user_one;
      game.user_one = game.user_two;
      game.user_two = x;
    }
    next();
  }
};

