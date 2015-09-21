'use strict';

var babelify = require('babelify');
var blaze = require('blaze_compiler/src/compiler');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var gutil = require('gulp-util');
var historyApiFallback = require('connect-history-api-fallback')
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var watchify = require('watchify');

var bundler = watchify(browserify(
  Object.assign({},
                watchify.args,
                {
                  entries: ['./src/app.js'],
                  debug: true,
                })));
bundler.transform(babelify);

function bundle() {
  return bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.reload({ stream: true }));
}

gulp.task('js', bundle);
bundler.on('update', bundle); // on any dep update, runs the bundler
bundler.on('log', gutil.log); // output build logs to terminal

gulp.task('index', () => {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['index', 'js']);
gulp.task('serve', ['build'], () => {
  browserSync({
    server: {
      baseDir: 'dist'
    },
    middleware: [ historyApiFallback() ],
  });
});

gulp.task('rules', () => {
  blaze.compile('rules.yaml', false)
});
