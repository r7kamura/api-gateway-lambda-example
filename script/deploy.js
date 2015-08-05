var AWS = require('aws-sdk');
var Composer = require('api-composer').Composer;
var RequestLogger = require('stackable-fetcher').RequestLogger;
var ResponseLogger = require('stackable-fetcher').ResponseLogger;

var composer = new Composer({
  accessKeyId: AWS.config.credentials.accessKeyId,
  region: 'us-east-1',
  secretAccessKey: AWS.config.credentials.secretAccessKey,
  swaggerFilePath: 'swagger.yml'
}).use(RequestLogger).use(ResponseLogger);

composer.deploy().catch(function (error) {
  console.log(error);
});
