var AWS = require('aws-sdk');
var Client = require('amazon-api-gateway-client').Client;
var RequestLogger = require('stackable-fetcher').RequestLogger;
var ResponseLogger = require('stackable-fetcher').ResponseLogger;

var client = new Client({
  accessKeyId: AWS.config.credentials.accessKeyId,
  region: 'us-east-1',
  secretAccessKey: AWS.config.credentials.secretAccessKey,
}).use(RequestLogger).use(ResponseLogger);

client.listRestapis().then(function (restapis) {
  restapis.forEach(function (restapi) {
    client.deleteRestapi({ restapiId: restapi.source.id });
  });
});

client.createRestapi({
  name: 'test'
}).then(function (restapi) {
  return client.deleteModel({
    modelName: 'Empty',
    restapiId: restapi.source.id
  }).then(function () {
    return restapi;
  });
}).then(function (restapi) {
  return client.deleteModel({
    modelName: 'Error',
    restapiId: restapi.source.id
  }).then(function () {
    return restapi;
  });
}).then(function (restapi) {
  return client.createResources({
    paths: ['/articles', '/recipes'],
    restapiId: restapi.source.id
  }).then(function () {
    return restapi;
  });
}).then(function (restapi) {
  return Promise.all(
    [
      {
        httpMethod: 'GET',
        path: '/articles'
      },
      {
        httpMethod: 'GET',
        path: '/recipes'
      }
    ].map(function (endpoint) {
      return client.findResourceByPath({
        path: endpoint.path,
        restapiId: restapi.source.id
      }).then(function (resource) {
        return client.putMethod({
          httpMethod: endpoint.httpMethod,
          resourceId: resource.source.id,
          restapiId: restapi.source.id
        }).then(function () {
          return resource;
        });
      }).then(function (resource) {
        return client.putIntegration({
          httpMethod: endpoint.httpMethod,
          integrationHttpMethod: 'GET',
          resourceId: resource.source.id,
          restapiId: restapi.source.id,
          type: 'HTTP',
          uri: 'https://api.github.com/users/r7kamura'
        }).then(function () {
          return resource;
        });
      }).then(function (resource) {
        return client.putMethodResponse({
          httpMethod: endpoint.httpMethod,
          resourceId: resource.source.id,
          restapiId: restapi.source.id,
          statusCode: 200
        }).then(function (response) {
          console.log(response);
          return resource;
        });
      }).then(function (resource) {
        return client.putIntegrationResponse({
          httpMethod: endpoint.httpMethod,
          resourceId: resource.source.id,
          restapiId: restapi.source.id,
          statusCode: 200
        }).then(function () {
          return resource;
        });
      });
    })
  ).then(function () {
    return restapi;
  });
}).then(function (restapi) {
  client.createDeployment({
    restapiId: restapi.source.id,
    stageName: 'production'
  }).then(function (resource) {
    console.log(resource);
  });
}).catch(function (error) {
  console.log(error);
});
