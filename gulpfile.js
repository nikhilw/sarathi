var gulp = require("gulp");
// var eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");

gulp.task("test", () =>
    gulp.src("test/**/*.js", {read: false})
        // gulp-mocha needs filepaths so you can"t have any plugins before it
        .pipe(mocha({reporter: "spec"}))
		.once("error", () => {
            process.exit(1);
        })
        .once("end", () => {
            process.exit();
        })
);

gulp.task("default", ["test"]);
