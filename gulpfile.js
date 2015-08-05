/*!
 * gulp
 * $ npm install gulp-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */

// Load plugins
var gulp = require('gulp'),
    mainBowerFiles = require('main-bower-files');
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    jasmine = require('gulp-jasmine'),
    connect     = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    del = require('del');

gulp.task('fileinclude', function() {
  return  gulp.src(['src/index.html', 'src/styles.html', 'src/iframe.html'])
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Index Copied' }));
});

gulp.task('templates', function() {
  return gulp.src('src/app/templates/**/*.html')
    .pipe(gulp.dest('dist/app/templates'))
    .pipe(notify({ message: 'templates copied' }));
});

// Styles
gulp.task('styles', function() {
  return gulp.src('src/styles/**/*.scss')
    .pipe(sass({includePaths: require('node-neat').includePaths}).on('error', sass.logError))
    .pipe(autoprefixer('last 2 version'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/styles'))
    .pipe(notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('src/app/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('dist/app'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Cities Config
gulp.task('cities_config', function() {
  return gulp.src('src/cities/*.json')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('dist/cities'))
    .pipe(notify({ message: 'Cities config task complete' }));
});

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('copy-bower', function() {
  return gulp.src(mainBowerFiles())
    .pipe(gulp.dest('dist/app/lib'));
});

// Clean
gulp.task('clean', function(cb) {
    del(['dist/assets/css', 'dist/assets/js', 'dist/assets/img'], cb)
});

gulp.task('copy-lib', function() {
  return gulp.src('src/lib/**/*')
    .pipe(gulp.dest('dist/lib'))
    .pipe(notify({ message: 'lib copied' }));
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('fileinclude', 'styles', 'scripts', 'images', 'templates', 'cities_config', 'copy-lib');
});

gulp.task('connect', function() {
  connect.server({
    root: 'dist',
    port: process.env.PORT || 8080,
    livereload: false
  });
});

gulp.task("heroku:production", function(){
  gulp.start('connect')
});

// Watch
gulp.task('watch', function() {
  gulp.start('default')
  // Create LiveReload server
  livereload.listen({start:true});

  // Watch .html files
  gulp.watch('src/**/*.html', ['fileinclude', 'templates']);
  gulp.watch('src/app/templates/**/*.html', ['templates']);

  // Watch .scss files
  gulp.watch(['src/styles/**/*.scss', 'src/lib/**/*.css'], ['styles']);

  // Watch .js files
  gulp.watch('src/app/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  gulp.watch('src/cities/*.json', ['cities_config']);

  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

});

gulp.task('test', function () {
  return gulp.src('spec/**/*_spec.js')
             .pipe(jasmine());
});
