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

gulp.task('zip', function () {
  var tasks = listChildDirectoryPaths(functionsPath).map(function (directoryPath) {
    return gulp.src([directoryPath + '/dist/**/*'])
      .pipe(zip('dist.zip'))
      .pipe(gulp.dest(directoryPath));
  });
  return merge(tasks);
});
