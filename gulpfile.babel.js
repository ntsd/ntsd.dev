import autoprefixer from "autoprefixer";
import browserSync from "browser-sync";
import spawn from "cross-spawn";
import cssnano from "cssnano";
import gulp from "gulp";
import postcss from "gulp-postcss";
import atimport from "postcss-import";
import tailwindcss from "tailwindcss";
import uglify from "gulp-uglify";
import through2 from "through2";
import crypto from "crypto";
import path from "path";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const isDevelopmentBuild = process.env.NODE_ENV === "development";

const CLOUDFLARE_WORKER_HOST = "http://127.0.0.1:8787";// "https://ntsd-dev-worker.ntsd.workers.dev";
const CLOUDFLARE_WORKER_API_KEY = process.env.CLOUDFLARE_WORKER_API_KEY;

const SITE_ROOT = "./_site";
const SITE_ROOT_HTML = `${SITE_ROOT}/**/*.(html|css|js|svg|png|json)`

const PRE_BUILD_STYLES = "./src/styles/style.css";
let POST_BUILD_STYLES = `./assets/css/`;
if (isDevelopmentBuild) {
  POST_BUILD_STYLES = `${SITE_ROOT}/assets/css/`
}

const PRE_BUILD_JS = ["./src/js/*.js", "!./src/js/sw.js"];
let POST_BUILD_JS = "./assets/js/";
if (isDevelopmentBuild) {
  POST_BUILD_JS = `${SITE_ROOT}/assets/js/`
}

const PRE_BUILD_SW = "./src/js/sw.js"
let POST_BUILD_SW = ".";
if (isDevelopmentBuild) {
  POST_BUILD_SW = `${SITE_ROOT}`
}

const TAILWIND_CONFIG = "./tailwind.config.js";

// Fix for Windows compatibility
const jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";

gulp.task("buildJekyll", () => {
  browserSync.notify("Building Jekyll site...");

  const args = ["exec", jekyll, "build"];

  if (isDevelopmentBuild) {
    args.push("--incremental");
  }

  return spawn("bundle", args, { stdio: "inherit" });
});

gulp.task("processStyles", () => {
  browserSync.notify("Compiling styles...");

  return gulp.src(PRE_BUILD_STYLES)
    .pipe(
      postcss([
        atimport(),
        tailwindcss(TAILWIND_CONFIG),
        ...(isDevelopmentBuild ? [] : [autoprefixer(), cssnano()]),
      ])
    )
    .pipe(gulp.dest(POST_BUILD_STYLES));
});

gulp.task("uglify", () => {
  return gulp.src(PRE_BUILD_JS)
    .pipe(uglify())
    .pipe(gulp.dest(POST_BUILD_JS));
});

gulp.task("uglify-sw", () => {
  return gulp.src(PRE_BUILD_SW)
    .pipe(uglify())
    .pipe(gulp.dest(POST_BUILD_SW));
});

gulp.task("bust-cache", () => {
  return gulp.src(SITE_ROOT_HTML)
    .pipe(through2.obj(function (file, _, cb) {
      const hash = crypto.createHash('md5');

      if (file.isNull() || file.isStream()) { // not support type
        return cb(null, file);
      }
      if (file.isBuffer()) {
        hash.end(file.contents);
      }

      const fileHash = hash.read().toString('hex').substr(0, this.checksumLength);
      const relativeRootPath = path.relative(process.cwd(), file.path);
      const relativePath = path.relative(SITE_ROOT, relativeRootPath);

      const postPath = `${CLOUDFLARE_WORKER_HOST}/${relativePath}`;
      axios
        .post(postPath, fileHash, {
          headers: { 'Authorization': CLOUDFLARE_WORKER_API_KEY }
        })
        .then(res => {
          console.log(`cache bust success: ${relativePath} ${fileHash}`);
        })
        .catch(error => {
          console.error(`cache bust failed ${relativePath} ${fileHash}`)
        });

      cb(null, file);
    }));
});

gulp.task("startServer", () => {
  browserSync.init({
    files: [SITE_ROOT + "/**"],
    open: "local",
    port: 4000,
    server: {
      baseDir: SITE_ROOT,
      serveStaticOptions: {
        extensions: ["html"],
      },
    },
  });

  gulp.watch(
    [
      "**/*.css",
      "**/*.html",
      "**/*.js",
      "**/*.md",
      "**/*.markdown",
      "!_site/**/*",
      "!node_modules/**/*",
      "_config.yml",
      "!assets/**/*",
    ],
    { interval: 500 },
    buildSite
  );
});

const jekyllSeries = gulp.series("buildJekyll", "processStyles");
const buildSite = gulp.parallel(jekyllSeries, "uglify", "uglify-sw");

exports.serve = gulp.series(buildSite, "startServer");
exports.default = gulp.series(buildSite);
exports.bustCache = gulp.series(jekyllSeries, "bust-cache");
