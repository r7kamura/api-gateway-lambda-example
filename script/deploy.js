var AWS = require('aws-sdk');
var Composer = require('api-composer').Composer;

var LoggerMiddleware = function (application) {
  this.application = application;
};

LoggerMiddleware.prototype.call = function (environment) {
  console.log((environment.method + '     ').substr(0, 7) + environment.url);
  return this.application.call(environment);
};

var composer = new Composer({
  accessKeyId: AWS.config.credentials.accessKeyId,
  region: 'us-east-1',
  secretAccessKey: AWS.config.credentials.secretAccessKey,
  swaggerFilePath: 'swagger.yml'
}).use(LoggerMiddleware);

composer.deploy().catch(function (error) {
  console.log(error);
});
