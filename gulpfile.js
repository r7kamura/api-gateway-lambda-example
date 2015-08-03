var awsLambda = require('node-aws-lambda');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var install = require('gulp-install');
var merge = require('merge-stream');
var path = require('path');
var zip = require('gulp-zip');

var functionsPath = './functions';

/**
 * @param {String} directoryPath
 * @return {Array.<String>}
 */
var listChildDirectoryPaths = function (directoryPath) {
  return fs.readdirSync(directoryPath).filter(function(pathPart) {
    return fs.statSync(path.join(directoryPath, pathPart)).isDirectory();
  }).map(function (pathPart) {
    return path.join(directoryPath, pathPart);
  });
}

gulp.task('bundle', function () {
  var tasks = listChildDirectoryPaths(functionsPath).map(function (directoryPath) {
    return gulp.src(directoryPath + '/package.json')
      .pipe(gulp.dest(directoryPath + '/dist'))
      .pipe(install({ production: true }));
  });
  return merge(tasks);
});

gulp.task('clean', function (callback) {
  del(
    [
      'functions/*/dist',
      'functions/*/dist.zip',
    ],
    callback
  );
});

gulp.task('compile', function () {
  var tasks = listChildDirectoryPaths(functionsPath).map(function (directoryPath) {
    return gulp.src(directoryPath + '/src/**/*.js').pipe(gulp.dest(directoryPath + '/dist'));
  });
  return merge(tasks);
});

gulp.task('upload', function (callback) {
  Promise.all(
    listChildDirectoryPaths(functionsPath).map(function (directoryPath) {
      return new Promise(function (resolve, reject) {
        awsLambda.deploy(
          directoryPath + '/dist.zip',
          {
            functionName: directoryPath.split('/').pop(),
            handler: 'index.handler',
            region: 'us-east-1',
            role: 'arn:aws:iam::549958975024:role/myFirstRole',
            timeout: 60
          },
          resolve
        );
      });
    })
  ).then(function () {
    callback();
  });
});

gulp.task('zip', function () {
  var tasks = listChildDirectoryPaths(functionsPath).map(function (directoryPath) {
    return gulp.src([directoryPath + '/dist/**/*'])
      .pipe(zip('dist.zip'))
      .pipe(gulp.dest(directoryPath));
  });
  return merge(tasks);
});
