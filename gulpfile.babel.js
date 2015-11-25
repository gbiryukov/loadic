'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');

let ES2015BasePlugins = [
    "babel-plugin-transform-es2015-template-literals",
    "babel-plugin-transform-es2015-literals",
    "babel-plugin-transform-es2015-function-name",
    "babel-plugin-transform-es2015-arrow-functions",
    "babel-plugin-transform-es2015-block-scoped-functions",
    "babel-plugin-transform-es2015-classes",
    "babel-plugin-transform-es2015-object-super",
    "babel-plugin-transform-es2015-shorthand-properties",
    "babel-plugin-transform-es2015-computed-properties",
    "babel-plugin-transform-es2015-for-of",
    "babel-plugin-transform-es2015-sticky-regex",
    "babel-plugin-transform-es2015-unicode-regex",
    "babel-plugin-check-es2015-constants",
    "babel-plugin-transform-es2015-spread",
    "babel-plugin-transform-es2015-parameters",
    "babel-plugin-transform-es2015-destructuring",
    "babel-plugin-transform-es2015-block-scoping",
    "babel-plugin-transform-es2015-typeof-symbol",
    ["babel-plugin-transform-regenerator", { "async": false, "asyncGenerators": false }]
]

gulp.task('babel-commonjs', () => {
    let source = gulp.src('src/*.js');

    return gulp.src('src/*.js')
        .pipe(babel({
            "plugins": ES2015BasePlugins.concat(["babel-plugin-transform-es2015-modules-commonjs"])
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('babel-amd', () => {
    let source = gulp.src('src/*.js');

    return gulp.src('src/*.js')
        .pipe(babel({
            "plugins": ES2015BasePlugins.concat(["babel-plugin-transform-es2015-modules-amd"])
        }))
        .pipe(rename({suffix: '.amd'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('demo', ['babel-amd', 'babel-commonjs'], () => {
    return gulp.src('dist/*.amd.js')
        .pipe(gulp.dest('demo/js/lib'));
});

gulp.task('default', ['demo']);
