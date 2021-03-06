'use strict';
const kramdown = require('gulp-kramdown');
const identity = require('gulp-identity');
const path = require('path');
const vui = require('./vui');

module.exports = opts => {
    const gulp = require('gulp');
    const notify = opts.notify ? require('gulp-notify') : identity;
    const watch = opts.interactive ? require('gulp-watch') : identity;

    const paths = {
        in: {
            all: path.resolve(opts.in + '/**/*'),
            md: path.resolve(opts.in + '/**/*.md'),
        },
        out: {
            all: path.resolve(opts.out + '/**/*'),
        }
    };

    const dest = action => {
        let ret = gulp.dest(opts.out, { cwd: opts.in })
        if(opts.notify) {
            ret.pipe(notify(action + ': <%= file.relative %>'));
        }
        return ret;
    };

    const base = {
        base: path.resolve(opts.in + '/')
    };

    gulp.task('markdown', () => {
        const md = [
            paths.in.md,
            '!' + paths.out.all,
        ];

        gulp.src(md)
            .pipe(watch(md, base))
            .pipe(kramdown({ renderer: vui.renderer(opts) }))
            .pipe(vui.layout(opts))
            .pipe(dest('Compiled'));
    });

    gulp.task('lib', () => {
        const dir = path.resolve(__dirname + '/../bower_components');
        gulp.src(path.resolve(dir + '/**/*'))
            .pipe(gulp.dest(path.resolve(opts.out + '/lib/'), { cwd: dir }));
    });

    gulp.task('copy', () => {
        const nonMd = [
            paths.in.all,
            '!' + paths.out.all,
            '!/**/*.md',
            '!/**/*.swp',
        ];

        gulp.src(nonMd)
            .pipe(watch(nonMd, base))
            .pipe(dest('Copied'));
    });

    gulp.task('runtime', () => {
        const files = path.resolve(__dirname + '/runtime/**/*');
        gulp.src(files)
            .pipe(watch(files, { base: path.resolve(__dirname + '/runtime/') }))
            .pipe(dest('Runtime files'));
    });

    gulp.task('build', () => {
        gulp.start('lib');
        gulp.start('runtime');
        gulp.start('copy');
        gulp.start('markdown');

        if(opts.interactive) {
            gulp.watch(path.resolve(__dirname + '/templates/layout.mustache'), ['markdown']);
        }
    });

    return gulp;
};
