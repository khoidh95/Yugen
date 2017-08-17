module.exports = function(req){
	if(!req.session) return false;
	if(!req.session.passport) return false;
	if(!req.session.passport.user) return false;
	return true;
}