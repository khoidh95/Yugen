/**
 * Test.js
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
  	  defaultsTo: false
    },
    jlpt:{
      model:'jlpt'
    },
    user:{
      model:'user'
    },
    mark:{
    	type:'integer',
      	defaultsTo: 0
    },
    questions:{
      collection: 'question',
      via:'testId',
      through:'testdetail'
    }
  }
};

