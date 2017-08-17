/**
 * Relationship.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	user_one:{
  		model:'user'
  	},
  	user_two: {
  		model:'user'
  	},
  	status: {
  		type: 'integer',
      required: true,
      enum: [1,2,3]
  	}
  }
};

