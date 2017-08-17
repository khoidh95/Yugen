/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': 'HomeController.index',

  '/profile':'HomeController.profile',

  '/login': 'HomeController.login',

  '/logout': 'HomeController.logout',
  
  'POST /login/local': 'AuthController.local',

  '/login/facebook':'AuthController.facebook',

  '/login/facebook/callback':'AuthController.facebook',

  '/login/google':'AuthController.google',

  '/login/google/callback':'AuthController.google',

  'POST /user': 'UserController.registerUser',

  'POST /user/editProfile': 'UserController.editProfile',

  'POST /user/reverify': 'UserController.reVerifyUser',

  'POST /user/forgot': 'UserController.forgotPasswordEmail',

  'POST /user/changepassword': 'UserController.changepassword',

  'POST /user/changepasswordwithsession': 'UserController.changepasswordWithSession',

  'POST /rank/top10': 'GameController.top10',

  '/forgot': 'UserController.forgotPassword',

  '/verify':'UserController.verifyUser',

  '/online': 'OnlineController.online',

  //BOOKMARK
  '/bookmark':'HomeController.bookmark',  
  
  'POST /user/bookmark': 'UserController.listBookMark',

  'POST /user/bookmark/create': 'UserController.createBookMark',

  'POST /user/bookmark/delete': 'UserController.deleteBookMark',

  //REPORT
  'POST /report/create': 'ReportController.createReport',

  'POST /report/list': 'ReportController.listReport',

  'POST /report/updateresolve': 'ReportController.updateResolve',

  //TEST
  '/test': 'HomeController.test',

  'POST /test/create': 'TestController.createTest',

  'POST /test/mytest': 'TestController.getMyTest',

  'POST /test/submitanswer': 'TestController.submitAnswer',

  'POST /test/finish': 'TestController.finishTest',

  'POST /test/history':'TestController.history',
  
  'POST /relationship/addfriend': 'RelationshipController.addFriend',

  'POST /relationship/searchfriend': 'RelationshipController.searchFriend',

  'POST /relationship/deletefriend': 'RelationshipController.deleteFriend',

  'POST /relationship/acceptfriend': 'RelationshipController.acceptFriend',

  '/practice/:jlpt/:type': 'HomeController.practice',

  'POST /question/randomrecord' :'QuestionController.randomARecord',

  'POST /question/getanswercorrect' :'QuestionController.getAnswerCorrect',

  '/play': 'HomeController.play',
  
  'POST /game/isplaying':'GameController.isPlaying',

  'POST /game/rank/register':'GameController.rankRegister',

  'POST /game/rank/init':'GameController.rankInit',

  'POST /game/rank/cancel':'GameController.rankCancel',

  'POST /game/rank/joingame':'GameController.rankJoinGame',

  'POST /game/playgame':'GameController.game',

  'POST /game/gameanswer':'GameController.gameAnswer',

  'POST /game/gameinit':'GameController.gameInit',

  'POST /game/playwithfriendrequest':'GameController.playWithFriendRequest',

  'POST /game/playwithfriendcancel':'GameController.playWithFriendCancel',

  'POST /game/playWithfriendinit':'GameController.playWithFriendInit',

  'POST /game/playWithfriendjoin':'GameController.playWithFriendJoinGame',

  'POST /game/history':'GameController.history',

  'GET /admin/login': 'HomeController.adminLogin',

  'POST /admin/login': 'AuthController.admin',

  '/admin': 'HomeController.admin',

  '/admin/addquestion': 'HomeController.addQuestion',

  '/admin/listquestion': 'HomeController.listQuestion',

  '/admin/listreport': 'HomeController.listReport',

  'POST /question/add': 'QuestionController.add',

  'POST /question/list': 'QuestionController.list',

  'POST /question/delete': 'QuestionController.delete',

  'POST /question/getone': 'QuestionController.getOne',

  'POST /question/update': 'QuestionController.update',
  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
