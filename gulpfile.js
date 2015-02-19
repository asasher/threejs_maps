var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')(),
	gutil = plugins.util,
	plumber = plugins.plumber,
	del = require('del'),
	browserSync = require('browser-sync');

var appDir = 'app/';

var paths = {
	styles : appDir + 'styles/',
	scripts : appDir + 'scripts/',
	bower : appDir + 'bower_components/',
	html : appDir
}

var files = {
	styles : paths.styles + '*.scss', 
	scripts : paths.scripts + '*.js',
	html : paths.html + '*.html'
}

var logErr = function (err) {
	gutil.log(gutil.colors.bgRed('[>_<]'),' ', err);
};

var logMsg = function (msg) {
	gutil.log(gutil.colors.bgBlue('[-_-]'),' ', msg);
}

//styles
gulp.task('styles' , function () {
	plugins.rubySass(paths.styles, {'sourcemap=none': true}).on('error', function (err) {
    	logErr(err);
 	})
 	.pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
 	.pipe(gulp.dest(paths.styles));
});

//clean
gulp.task('clean', function(cb) {
  del([paths.styles + '*.css'], function (err, deletedFiles) {
  		logErr(err);
  		logMsg('files deleted:' + deletedFiles.join(', '));
	});
});

//build
gulp.task('build', function() {
    gulp.start('styles');
});

//serve
gulp.task('serve', ['build'], function() {
    browserSync({
    	files: [files.styles,
    			files.scripts,
    			files.html],
        server: {
            baseDir: appDir
        }
    });

    gulp.watch(files.styles, ['styles']);
});

//default
gulp.task('default', ['clean'],function() {
    gulp.start('build');
});
