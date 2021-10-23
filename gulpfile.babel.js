import autoprefixer from "autoprefixer";
import browserSync from "browser-sync";
import spawn from "cross-spawn";
import cssnano from "cssnano";
import { dest, series, src, task, watch, parallel } from "gulp";
import postcss from "gulp-postcss";
import atimport from "postcss-import";
import tailwindcss from "tailwindcss";
import uglify from "gulp-uglify";

const isDevelopmentBuild = process.env.NODE_ENV === "development";

const SITE_ROOT = "./_site";

const PRE_BUILD_STYLES = "./src/styles/style.css";
let POST_BUILD_STYLES = `./assets/css/`;
if (isDevelopmentBuild) {
  POST_BUILD_STYLES = `${SITE_ROOT}/assets/css/`
}

const PRE_BUILD_JS = "./src/js/*.js";
let POST_BUILD_JS = `./assets/js/`;
if (isDevelopmentBuild) {
  POST_BUILD_JS = `${SITE_ROOT}/assets/js/`
}

const TAILWIND_CONFIG = "./tailwind.config.js";

// Fix for Windows compatibility
const jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";

task("buildJekyll", () => {
  browserSync.notify("Building Jekyll site...");

  const args = ["exec", jekyll, "build"];

  if (isDevelopmentBuild) {
    args.push("--incremental");
  }

  return spawn("bundle", args, { stdio: "inherit" });
});

task("processStyles", () => {
  browserSync.notify("Compiling styles...");

  return src(PRE_BUILD_STYLES)
    .pipe(
      postcss([
        atimport(),
        tailwindcss(TAILWIND_CONFIG),
        ...(isDevelopmentBuild ? [] : [autoprefixer(), cssnano()]),
      ])
    )
    .pipe(dest(POST_BUILD_STYLES));
});

task('uglify', () => {
  return src([PRE_BUILD_JS])
    .pipe(uglify())
    .pipe(dest(POST_BUILD_JS));
});

task("startServer", () => {
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

  watch(
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

const serie = series("buildJekyll", "processStyles");
const buildSite = parallel(serie, "uglify")

exports.serve = series(buildSite, "startServer");
exports.default = series(buildSite);
