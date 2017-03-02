var gulp = require('gulp'),
	del = require('del'),
	babel = require('gulp-babel'),
	cleanCss = require('gulp-clean-css'),
	cssmin = require('gulp-minify-css'),
	concat = require('gulp-concat'),
	htmlmin = require('gulp-htmlmin'),
	jshint = require('gulp-jshint'),
	nunjucks = require('gulp-nunjucks'),
	rename = require('gulp-rename'),
	replaceTask = require('gulp-replace-task'),
	revAppend = require('gulp-rev-append'),
	staticHash = require('gulp-static-hash'),
	scss = require('gulp-scss'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch'),
	livereload = require('gulp-livereload'),
	connect = require('gulp-connect'),
	browserSync = require('browser-sync');


var mainfest = {
	basePath: './loveStory/html/',
	staticPath: './loveStory/static/',
	distPath: './loveStory/dist/',
	testPath: './loveStory/test/'
};

//编译开发环境nunjucks
gulp.task('dev-nunjucks', function(){
	return gulp.src([mainfest.basePath + '*.html', !mainfest.basePath + '/tpl/*.html'])
			.pipe(nunjucks.compile())
			.pipe(gulp.dest(mainfest.testPath));
});

//静态文件添加md5值
gulp.task('dev-md5', ['dev-nunjucks'], function(){
	return gulp.src(mainfest.testPath + '*.html')
			.pipe(staticHash({asset: 'static'}))
			.pipe(gulp.dest(mainfest.testPath));
});

//编译scss
gulp.task('dev-sass', function(){
	return sass(mainfest.staticPath + 'scss/*.scss', {style: 'compressed'})
			.on('error', function(err){
				console.log('error:' + err.message);
			})
			.pipe(autoprefixer({
				//browsers: ['last 2 version'],
				cascade: false
			}))
			.pipe(cssmin({
	            advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
	            compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
	            keepBreaks: false,//类型：Boolean 默认：false [是否保留换行]
	            keepSpecialComments: '*'
	            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
	        }))
			.pipe(gulp.dest(mainfest.staticPath + 'css'))
			.pipe(livereload());
});

//js校验
gulp.task('dev-jshint', function(){
	return gulp.src(mainfest.staticPath + 'js/*.js')
			.pipe(jshint())
			.pipe(jshint.reporter('default'));
});

//合并前删除lib.js
gulp.task('del-lib', function(cb){
	return del(mainfest.staticPath + 'js/lib/lib.js',cb);
});

//合并js至lib.js
gulp.task('dev-lib', ['del-lib'], function(){
	return gulp.src([mainfest.staticPath + 'js/lib/require.js',
				mainfest.staticPath + 'js/lib/zepto.js',
				//mainfest.staticPath + 'js/lib/underscore.js',
				mainfest.staticPath + 'js/lib/zepto.onepagescroll.js',
				mainfest.staticPath + 'js/lib/zepto.fx.js',
				mainfest.staticPath + 'js/lib/fireworks.js'
			])
			.pipe(concat('lib.js'))
			.pipe(uglify())
			.pipe(gulp.dest(mainfest.staticPath + 'js/lib/'))
			.pipe(livereload());
});

//替换
gulp.task('dev-replace', function(){
	return gulp.src(mainfest.testPath + '*.html')
			.pipe(replaceTask({
				patterns: [{
					match: 'timestamp',
					replacement: new Date().getTime()
				}]
			}))
			.pipe(gulp.dest(mainfest.testPath));
});

//实时监控文件变化
gulp.task('watch', function(){
	gulp.watch('loveStory/static/js/*.js', ['dev-jshint']).on('change', browserSync.reload);
	gulp.watch('loveStory/static/scss/*.scss', ['dev-sass']).on('change', browserSync.reload);
	gulp.watch('loveStory/html/**', ['dev-md5']).on('change', browserSync.reload);
});


//搭建webserver
gulp.task('webserver', function(){
	connect.server({
		host: 'localhost',
		port: 8080,
		root: './loveStory/', //定义root根目录
		livereload: true
	});
});

//执行开发环境任务
gulp.task('dev', function(){
	gulp.run('dev-lib', 'dev-sass', 'dev-jshint', 'dev-md5', 'webserver', 'watch');
});



/**********************************online**********************************/
//delete files
gulp.task('del', function() {
    del.sync(mainfest.distPath);
});

gulp.task('copy-css', function() {
	return gulp.src([mainfest.staticPath+'css/reset.css', mainfest.staticPath+'css/loveStory.css'])//- 需要处理的css文件，放到一个字符串数组里
	        .pipe(concat('lovestory.min.css'))                     //- 合并后的文件名
	        .pipe(cleanCss())                                      //- 压缩处理成一行
	        .pipe(gulp.dest(mainfest.distPath+'static/css/'));     //- 输出文件本地
});


//线上压缩、合并mainjs 文件
gulp.task('script', function() {
    gulp.src(mainfest.staticPath + 'js/*.js')
        //.pipe(babel()) //babel解析ES6
        .pipe(concat('lovestory.min.js'))
        //.pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(mainfest.distPath + 'static/js'))
        .pipe(livereload());
});

//复制静态文件
gulp.task('copy-lib', function() {
    gulp.src(mainfest.staticPath + 'js/lib/lib.js')
        .pipe(gulp.dest(mainfest.distPath+'static/js/lib/'));
});

//复制静态文件
gulp.task('copy-img', function() {
    gulp.src(mainfest.staticPath + 'images/**')
        .pipe(gulp.dest(mainfest.distPath+'static/images/'));
});

//编译nunjucks模板
gulp.task('nunjucks', function() {
    return gulp.src([mainfest.basePath + '*.html', !mainfest.basePath + '/tpl/*.html'])
        .pipe(nunjucks.compile())
        .pipe(gulp.dest(mainfest.distPath));
});

//添加md5值
gulp.task('static-hash-html', ['nunjucks'], function () {
    return gulp.src(mainfest.distPath+'*.html')
        .pipe(staticHash({asset: 'static'}))
        .pipe(gulp.dest(mainfest.distPath));
});


//文件内容替换以及为静态文件链接添加md5
gulp.task('replace', function() {
    /*setTimeout(function(){
        gulp.src(mainfest.distPath + 'html/tpl/parent.html')
            .pipe(replace({
                patterns: [{
                    match: '&&&', //!!..
                    replacement: ''
                },{
                    match: 'timestamp', //!!..
                    replacement: new Date().getTime()
                }]
            }))
            .pipe(gulp.dest(mainfest.distPath + 'html/tpl/'));
    },1000);*/
    return gulp.src([mainfest.distPath+'*.html',mainfest.distPath+'static/css/loveStory.min.css']);
});

gulp.task('online', ['del', 'copy-css', 'script', 'copy-lib', 'copy-img', 'static-hash-html']);






gulp.task('default', function(){
	console.log('success')
});