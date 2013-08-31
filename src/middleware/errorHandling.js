var _ = require('underscore');

module.exports = function(err, req, res, next){
  //TODO: make true logging
  if(err){
    if(err.isError){
      if(err.err && err.err.message && !err.message) err.message = err.err.message;
      return res.json(err.statusCode, _(err).pick('statusCode', 'message', 'err'));
    }
  }
  console.log(err);
  res.json(500, {
    message: 'Something is terribly wrong'
  });
}
