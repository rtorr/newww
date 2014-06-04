var gulp = require('gulp'),
    nib = require('nib'),
    stylus = require('gulp-stylus'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    nodemon = require('gulp-nodemon');

gulp.task('styles', function () {
  gulp.src('stylus/index.styl')
      .pipe(stylus({use: [nib()]}))
      .pipe(gulp.dest('static/css/'))
})

gulp.task('develop', function () {
  nodemon({ script: 'server.js', ext: 'hbs styl js', ignore: ['node_modules/', 'test/', 'facets/*/test/'] })
    .on('change', ['styles'])
    .on('restart', function () {
      console.log('restarted!')
    })
})

var footerScripts = [
  "static/js/jquery-2.1.0.min.js",
  "static/js/d3.js",
  "static/js/charts.js",
  "static/js/sh_main.js",
  "static/js/sh_javascript.min.js",
  "static/js/aristotle.js",
  "static/js/scripts.js",
  "static/js/google-analytics.js",
  "https://ssl.google-analytics.com/ga.js",
  "static/js/hiring.js"
];

gulp.task('concat', function () {
  gulp.src(footerScripts)
      .pipe(uglify())
      .pipe(concat('footer.min.js'))
      .pipe(gulp.dest('static/js/'))
})

// gulp.task('watch', function () {
//   // watch stylus files
//   gulp.watch('stylus/*.styl', ['styles'])

// })

gulp.task('default', ['styles'])