'use strict';
// Plugins
  var
    browserSync     = require('browser-sync'),
    gulp            = require('gulp'),
    autoprefixer    = require('gulp-autoprefixer'),
    minifyCss       = require('gulp-clean-css'),
    notify          = require('gulp-notify'),
    pug             = require('gulp-pug'),
    plumber         = require('gulp-plumber'),
    rename          = require('gulp-rename'),
    rigger          = require('gulp-rigger'),
    sass            = require('gulp-sass'),
    uglify          = require('gulp-uglify'),
    watch           = require('gulp-watch'),
    rimraf          = require('rimraf');

  var
    reload = browserSync.stream,
    log = function(err) {
      notify.onError({
        title: "Gulp error in " + err.plugin,
        message:  err.toString()
      })(err);
    };

// Paths
  var
    path = {
      build: {
        html: 'build',
        js: 'build/assets/js/',
        css: 'build/assets/css/'
      },
      app: {
        html: 'app/*.pug',
        js: 'app/js/*.js',
        css: 'app/css/**/*.scss'
      },
      watch: {
        html: 'app/**/*.pug',
        js: 'app/js/**/*.js',
        css: 'app/css/**/*.scss'
      },
      clean: './build'
    },
    serverConfig = {
      server: {
        baseDir: './build',
        index: 'index.html'
      },
      host: 'localhost',
      port: 9000
    };

// Server
  gulp.task('server', function () {
    browserSync(serverConfig);
  });


// Build
  // HTML
    gulp.task('html:build', function () {
      gulp.src(path.app.html)
        .pipe(plumber({
          errorHandler: log
        }))
        .pipe(pug({
          pretty: true
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({once: true}));
    });

  // CSS
    gulp.task('css:build', function () {
      gulp.src(path.app.css)
        .pipe(plumber({
          errorHandler: log
        }))
        .pipe(sass({
          includePaths: ['partials']
        }))
        .pipe(autoprefixer({
          browsers: ['last 3 versions', '> 1%']
        }))
        .pipe(minifyCss())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({
          once: true
        }));
    });

  // JS
    gulp.task('js:build', function () {
      gulp.src(path.app.js)
        .pipe(plumber({
          errorHandler: log
        }))
        .pipe(rigger())
        .pipe(uglify())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({once: true}));
    });

  gulp.task('build', [
    'html:build',
    'js:build',
    'css:build'
  ]);

  gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
  });

// Watch
  gulp.task('watch', function () {
    watch([path.watch.html], function(event, cb) {
      gulp.start('html:build');
    });
    watch([path.watch.css], function(event, cb) {
      gulp.start('css:build');
    });
    watch([path.watch.js], function(event, cb) {
      gulp.start('js:build');
    });
  });

gulp.task('default', ['build', 'server', 'watch']);