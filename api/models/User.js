/**
 * User.js
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

  	fid:{
  		type: 'string'
  	},

  	gid:{
  		type: 'string'
  	},

  	displayName:{
  		type: 'string',
  		size: 100
  	},

  	email:{
  		type: 'string',
  		unique: true,
  		size: 45
  	},

  	password: {
  		type: 'string',
  	},

  	level: {
  		type: 'integer',
      defaultsTo: 1
  	},

    score:{
      type: 'integer',
      defaultsTo:0
    },

    jlpt: {
  		model: 'jlpt',
      defaultsTo:'None'
    },
    
    avatar:{
      type: 'string'
    },

    role:{
      type: 'string',
      enum: ['admin', 'member'],
      defaultsTo: 'member'
    },

    isActive:{
      type:'boolean',
      defaultsTo: false,
    },
  	
    relationship_user_one: {
      collection: 'relationship',
      via:'user_one'
    },

    relationship_user_two: {
      collection: 'relationship',
      via:'user_two'
    },

    game_user_one: {
      collection: 'game',
      via:'user_one'
    },

    game_user_two: {
      collection: 'game',
      via:'user_two'
    },
    test_user:{
      collection: 'test',
      via:'user'
    },
    online:{
      collection: 'online',
      via:'userId'
    },
    bookmark_questions:{
      collection: 'question',
      via:'userId',
      through:'bookmark'
    },

    reports:{
      collection:'question',
      via:'userId',
      through:'report'
    }
  },
  beforeCreate: function(user, next) {
    if(!user.password){
      return next();
    }
    require('../services/bcryptPassword.js').encode(user.password, function(hash){
      user.password = hash;
      return next();
    });
  }
};

