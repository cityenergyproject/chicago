/*!
 * gulp
 * $ npm install gulp-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */

// Load plugins
var gulp = require('gulp'),
    mainBowerFiles = require('main-bower-files');
    fileinclude = require('gulp-file-include'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    connect     = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    del = require('del');

gulp.task('fileinclude', function() {
  return  gulp.src(['src/index.html'])
    .pipe(fileinclude())
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Includes: included' }));
});

gulp.task('templates', function() {
  return gulp.src('src/app/templates/**/*.html')
    .pipe(gulp.dest('dist/app/templates'))
    .pipe(notify({ message: 'templates copied' }));
});

// Styles
gulp.task('styles', function() {
  return gulp.src('src/styles/**/*.scss')
    .pipe(sass())
    .pipe(autoprefixer('last 2 version'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
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

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    // .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
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

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('fileinclude', 'styles', 'scripts', 'images', 'templates');
});

gulp.task('connect', function() {
  connect.server({
    root: 'dist',
    livereload: false
  });
});

// Watch
gulp.task('watch', function() {

  // Create LiveReload server
  livereload.listen({start:true});

  // Watch .html files
  gulp.watch('src/**/*.html', ['fileinclude', 'templates']);

  // Watch .scss files
  gulp.watch('src/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('src/app/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

});