const gulp = require('gulp');
const toc = require('gulp-doctoc');
const marked = require('gulp-marked');

gulp.task('default', function () {

  gulp.src(['./*.md', './!(node_modules)/*.md'])
    .pipe(toc())
    .pipe(marked())
    .pipe(gulp.dest('./public/'));
});