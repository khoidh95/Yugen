/**
 * Question.js
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
  	content:{
  		type: 'text',

  	},
  	explain:{
  		type: 'text'
  	},
  	jlpt:{
  		model:'jlpt'
    },
    type:{
      type: 'string',
      enum: ['kanji', 'grammar', 'vocabulary'],
    },
  	isTest:{
  		type: 'boolean'
  	},  
    answer:{
      collection: 'answer',
      via:'questionId'
    },
    games:{
      collection: 'game',
      via:'questionId',
      through:'gamedetail'
    },
    tests:{
      collection: 'test',
      via:'questionId',
      through:'testdetail'
    },
    bookmark_users:{
      collection: 'user',
      via:'questionId',
      through:'bookmark'
    },
    reports:{
      collection:'user',
      via:'questionId',
      through:'report'
    }
  }
};

