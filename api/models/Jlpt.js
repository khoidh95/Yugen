/**
 * Jlpt.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	name:{
  		type: 'string',
  		size: 45,
  		primaryKey: true
  	},
  	user_jlpt:{
  		collection: 'user',
      	via:'jlpt'
  	},
    question_jlpt:{
      collection: 'question',
      via:'jlpt'
    },
    test_jlpt:{
      collection: 'test',
      via:'jlpt'
    }
  }
};

