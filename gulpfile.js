var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

var port = process.env.PORT || 9000;

gulp.task('server', function() {
	browserSync({
   	  notify: false,
   	  port: port,
   	  server: {
    	baseDir: 'app'
      }
   });
});   

gulp.task('watch', function(){
    gulp.watch([
        'app/styles/*.css',
				'app/styles/*.less',
				'app/styles/**/*.css',
				'app/styles/**/*.less',
				'app/scripts/*.js',
        'app/scripts/**/*.js',
        'app/views/*.html',
        'app/views/dashboard/*.html',
        'app/*.html']).on('change', reload);
});

gulp.task('default', ['server', 'watch']);