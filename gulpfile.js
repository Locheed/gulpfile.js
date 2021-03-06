'use strict';

var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    sourcemaps    = require('gulp-sourcemaps'),
    browserSync   = require('browser-sync').create(),
    runSequence   = require('run-sequence'),
    plumber       = require('gulp-plumber'),
    coffee        = require('gulp-coffee'),
    concat        = require('gulp-concat'),
    uglify        = require('gulp-uglify'),
    cleanCSS      = require('gulp-clean-css'),
    del           = require('del'),
    jshint        = require('jshint'),
    gulp_jshint   = require('gulp-jshint'),
    rename        = require('gulp-rename');

// Build paths
var jsFiles   = 'src/assets/js/**/*.js',
    jsDest    = 'build/assets/js',
    jsVendor  = './src/assets/js/vendor/**/*.js',
    sassFiles = 'src/assets/SASS/**/*.+(scss|sass)',
    sassDest  = 'src/assets/css/',
    //cssPrefix = 'src/assets/css/prefixed/',
    cssDest   = 'build/assets/css',
    fontFiles = 'src/assets/fonts',
    fontDest  = 'build/assets/fonts',
    imgFiles  = 'src/assets/img',
    imgDest   = 'build/assets/img';


// ** Default task to start watching filechanges of .sass, .scss and .js **
// ** LiveReload browser **
gulp.task('default', ['browserSync', 'sass', 'gulp_jshint'], function() {
      gulp.watch(sassFiles, ['sass']);
      gulp.watch('*.html', browserSync.reload);
      gulp.watch(jsFiles, browserSync.reload);
      gulp.watch(jsFiles, ['gulp_jshint']);
      // Other watchers
    });

// ** Build task to build project **
gulp.task('build', function (callback) {
  runSequence('clean:build',
   ['jsFiles', 'fonts', 'jsVendor', 'minify-css'],
    callback
  )
});

// ** Development plugins **
gulp.task('sass', function() {
  return gulp.src(sassFiles)

    .pipe(plumber({
        handleError: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass.sync()) // Using gulp-sass
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(plumber.stop())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(sassDest))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: ''
    },
  })
});

gulp.task('gulp_jshint', function() {
  return gulp.src(jsFiles)
  .pipe(gulp_jshint())
  .pipe(gulp_jshint.reporter('jshint-stylish'));
});

// ** Building plugins **
/*
gulp.task('autoprefixer', function() {
  return gulp.src(sassDest)
    .pipe(plumber({
        handleError: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(postcss([autoprefixer({ browsers: ['last 2 versions'] }) ]))
    .pipe(plumber.stop())
    .pipe(gulp.dest(cssPrefix));
});
*/
// ** Concanate and minify JS and CSS files.
gulp.task('jsFiles', function() {
  gulp.src([
          jsFiles,
          '!' + jsVendor
      ])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(jsDest));
});

gulp.task('jsVendor', function() {
    gulp.src(jsVendor)
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(jsDest));
});

// Concanate and minify CSS
gulp.task('minify-css', function() {
    return gulp.src(sassDest + "*.css")
        .pipe(sourcemaps.init())
        .pipe(cleanCSS({debug: true}, function(details) {
            console.log(details.name + ': Original size: ' + details.stats.originalSize);
            console.log(details.name + ': After minify size: ' + details.stats.minifiedSize);
        }))
        .pipe(sourcemaps.write())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(gulp.dest(cssDest));
});

gulp.task('fonts', function() {       // Task copies possible fonts from dev to build
  return gulp.src(fontFiles)
  .pipe(gulp.dest(fontDest))
});

//gulp.task('images', function() {       // Task copies possible image files from dev to build
//  return gulp.src('assets/img/*.{gif,jpg,png,svg}')
//  .pipe(gulp.dest('build/assets/img'))
//});

gulp.task('clean:build', function() {
  return del(['build/**/*']);
});

// ** Error handling plugins **
gulp.src('./assets/*.ext')
    .pipe(plumber())
    .pipe(coffee())
    .pipe(gulp.dest('./build'));
