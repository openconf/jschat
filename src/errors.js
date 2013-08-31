var _ = require("underscore");

var internal = {
  authenticationFail : "401-1",
  authenticationReq: "401-2",
  featureAccess: "403-2",
  userIsNotFound: "412-1",
  mongoQueryFailed: "412-2"
};


var errors = {
  authError: errorBuilder({
    statusCode: 401,
    code: internal.authenticationFail,
    message: "authentication failed: "
  }),
  authRequiredError: errorBuilder({
    statusCode: 401,
    code: internal.uthenticationReq,
    message: "authentication required to acces this endpoint"
  }),
  accessError: errorBuilder({
    statusCode: 403,
    message: "user doesn't have access to this resource"
  }),
  notFound: errorBuilder({
    statusCode: 404,
    message: "Resource not found"
  }),
  badRequest: errorBuilder({
    statusCode: 400,
    message: "Bad Request"
  }),
  featureAccessError: errorBuilder({
    statusCode: 403,
    code: internal.featureAccess
  }),
  userIsNotFoundError: errorBuilder({
    statusCode: 412,
    code: internal.userIsNotFound
  }),
  mongoError: errorBuilder({
    statusCode: 412,
    code: internal.mongoQueryFailed
  })
};


function errorBuilder(errorObject){
  return function error(message){
    var error = _.clone(errorObject);
    if(error.message) message = error.message + message;

    if(_(message).isObject()){
      error = _.extend(error, message);
    }else{
      error.message = message;
    }
    error.isError = true;
    if(error.statusCode === 500){
      error.stack = (new Error('dummy')).stack;
    }
    return error;
  };
}

module.exports = errors;
