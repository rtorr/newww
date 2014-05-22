var gulp = require('gulp'),
    nib = require('nib'),
    stylus = require('gulp-stylus'),
    nodemon = require('gulp-nodemon');

gulp.task('styles', function () {
  gulp.src('stylus/index.styl')
      .pipe(stylus({use: [nib()]}))
      .pipe(gulp.dest('static/css/'))
})

gulp.task('develop', function () {
  nodemon({ script: 'index.js', ext: 'hbs styl js', ignore: ['node_modules/', 'test/', 'facets/*/test/'] })
    .on('change', ['styles'])
    .on('restart', function () {
      console.log('restarted!')
    })
})

// gulp.task('watch', function () {
//   // watch stylus files
//   gulp.watch('stylus/*.styl', ['styles'])

// })

gulp.task('default', ['styles'])