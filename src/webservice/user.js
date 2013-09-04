var signer = require('secure.me')({salt: nconf.get('security:salt')}).signer;
signer = signer({salt:nconf.get('security:salt')});
module.exports = function(app){
  app.get('/api/me', getMe);
}

function getMe(req, res, next){
  var userSigned = signer.sign(req.user);
  res.json(userSigned);
}
