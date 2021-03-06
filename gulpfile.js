'use strict';

var gulp = require('gulp'),
    rigger = require('gulp-rigger'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    autoPrefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    newer = require('gulp-newer'),
    del = require('del'),
    babel = require('gulp-babel'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,

    path = {
        build: {
            html: 'bld/',
            js: 'bld/js/',
            css: 'bld/css/',
            img: 'bld/img/',
            fnt: 'bld/fnt/',
            fico: 'bld/fico/',
            libs: 'bld/libs/'
        },
        source: {
            html: [
                'src/**/*.html',
                '!src/**/_*.html',
                '!src/libs/**/*'
            ],
            js: [
                'src/js/**/*.js',
                '!src/js/isolated/**/*'
            ],
            sass: [
                'src/css/**/*.+(sass|scss)',
                '!src/css/isolated/**/*.*'
            ],
            img: 'src/img/**/*.*',
            fnt: 'src/fnt/**/*.*',
            fico: 'src/fico/**/*.*',
            libs: 'src/libs/**/*.*'
        },
        watch: {
            html: [
                'src/**/*.html',
                '!src/libs/**/*'
            ],
            js: [
                'src/js/**/*.js',
                '!src/js/isolated/**/*.js'
            ],
            sass: [
                'src/css/**/*.+(sass|scss)',
                '!src/css/isolated/**/*.*'
            ],
            img: 'src/img/**/*.*',
            fnt: 'src/fnt/**/*.*',
            fico: 'src/fico/**/*.*',
            libs: 'src/libs/**/*.*'
        },
        clean: {
            build: 'bld'
        }
    },

    webconfig = {
        server: {
            baseDir: "bld/"
        },
        tunnel: false,
        host: 'localhost',
        port: 1111,
    },

    nm = 'au6fw'; // change it to your project's name

function buildHtml() {
    return gulp.src(path.source.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
}

function buildJs() {
    return gulp.src(path.source.js)
        .pipe(babel())
        .pipe(uglify())
        .pipe(concat(nm+'.min.js'))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
}

function buildNewer(globSrc, globBld) {
    return gulp.src(globSrc)
        .pipe(newer(globBld))
        .pipe(gulp.dest(globBld))
        .pipe(reload({stream: true}));
}

function buildCss() {
    return gulp.src(path.source.sass)
        .pipe(sass())
        .pipe(autoPrefixer({
            browsers: ['ie 8-9', 'last 2 versions']
        }))
        .pipe(cleanCSS())
        .pipe(rename({
            basename: nm,
            suffix: '.min'
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
}

function buildImg() {
    return gulp.src(path.source.img)
        .pipe(newer(path.build.img))
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeViewBox: false}],
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
}

gulp.task('cleanBuild', function() {
    return del(path.clean.build);
});

gulp.task('build', ['cleanBuild'], function () {
    buildNewer(path.source.libs, path.build.libs);
    buildNewer(path.source.fnt, path.build.fnt);
    buildNewer(path.source.fico, path.build.fico);
    buildImg();
    buildJs();
    buildCss();
    buildHtml();
});

function startServer() {
    browserSync(webconfig);
}

function watch() {
    gulp.watch(path.watch.html, function () { buildHtml(); });
    gulp.watch(path.watch.js, function () { buildJs(); });
    gulp.watch(path.watch.sass, function () { buildCss(); });
    gulp.watch(path.watch.img, function () { buildImg(); });
    gulp.watch(path.watch.fnt, function () { buildNewer(path.source.fnt, path.build.fnt); });
    gulp.watch(path.watch.fico, function () { buildNewer(path.source.fico, path.build.fico); });
    gulp.watch(path.watch.libs, function () { buildNewer(path.source.libs, path.build.libs); });
}

gulp.task('default', ['build'], function () {
    startServer();
    watch();
});
