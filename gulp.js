const gulp = require('gulp');
const jasmineBrowser = require('gulp-jasmine-browser');
const watch = require('gulp-watch');

gulp.task('default', function() {
  // my default task will go here
});

gulp.task('jasmine', function() {
  return gulp.src(['src/**/*.js', 'spec/**/*_spec.js'])
    .pipe(watch(filesForTest))
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({port: 8888}));
});

gulp.task('jasmine-phantom', function() {
  return gulp.src(['src/**/*.js', 'spec/**/*_spec.js'])
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless());
});
