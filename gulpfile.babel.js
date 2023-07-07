import autoprefixer from "autoprefixer";
import browserSync from "browser-sync";
import spawn from "cross-spawn";
import cssnano from "cssnano";
import gulp from "gulp";
import postcss from "gulp-postcss";
import atimport from "postcss-import";
import tailwindcss from "tailwindcss";
import uglify from "gulp-uglify";
import replace from "gulp-replace";
import through2 from "through2";
import crypto from "crypto";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import htmlmin from "gulp-htmlmin";
import tailwindConfigDefault from "./tailwind.config.js";
import express from "express";
import { stream as critical } from "critical";

dotenv.config();

const isDevelopmentBuild = process.env.NODE_ENV === "development";

const CLOUDFLARE_WORKER_HOST = process.env.CLOUDFLARE_WORKER_HOST;
const CLOUDFLARE_WORKER_API_KEY = process.env.CLOUDFLARE_WORKER_API_KEY;

const SITE_ROOT = isDevelopmentBuild ? "./_watch" : "./_site";
const SITE_ROOT_HTML = `${SITE_ROOT}/**/*.html`;
const CACHE_BUST_PATH = `${SITE_ROOT}/**/*.?(html|css|js)`;

const PRE_BUILD_STYLES = "./src/styles/*.css";
const POST_BUILD_STYLES = `${SITE_ROOT}/assets/css/`;

const PRE_BUILD_JS = ["./src/js/*.js", "!./src/js/sw.js"];
const POST_BUILD_JS = `${SITE_ROOT}/assets/js/`;

const PRE_BUILD_SW = "./src/js/sw.js";
const POST_BUILD_SW = `${SITE_ROOT}`;

// const TAILWIND_CONFIG = "./tailwind.config.js";

// Fix for Windows compatibility
const jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";

gulp.task("buildJekyll", () => {
  browserSync.notify("Building Jekyll site...");

  const args = ["exec", jekyll, "build"];

  args.push("--destination", SITE_ROOT);
  if (isDevelopmentBuild) {
    args.push("--incremental");
  }

  return spawn("bundle", args, { stdio: "inherit" });
});

gulp.task("processStyles", () => {
  browserSync.notify("Compiling styles...");

  const tailwindConfig = Object.assign(tailwindConfigDefault, {
    purge: {
      enabled: true,
      content: [SITE_ROOT_HTML],
    },
  });

  return gulp
    .src(PRE_BUILD_STYLES)
    .pipe(
      postcss([
        atimport(),
        tailwindcss(tailwindConfig),
        ...(isDevelopmentBuild
          ? []
          : [
              autoprefixer(),
              cssnano({
                preset: ["default", { discardComments: { removeAll: true } }],
              }),
            ]),
      ])
    )
    .pipe(gulp.dest(POST_BUILD_STYLES));
});

gulp.task("uglify", () => {
  return gulp.src(PRE_BUILD_JS).pipe(uglify()).pipe(gulp.dest(POST_BUILD_JS));
});

gulp.task("uglify-sw", () => {
  return gulp
    .src(PRE_BUILD_SW)
    .pipe(replace("pre-version", Math.random().toString(36)))
    .pipe(replace("runtime-version", Math.random().toString(36)))
    .pipe(uglify())
    .pipe(gulp.dest(POST_BUILD_SW));
});

gulp.task("bust-cache", () => {
  return gulp.src(CACHE_BUST_PATH).pipe(
    through2.obj(function (file, _, cb) {
      if (!file.isBuffer()) {
        // not support type
        return cb(null, file);
      }

      const hash = crypto.createHash("md5");

      hash.end(file.contents);

      const fileHash = hash
        .read()
        .toString("hex")
        .substr(0, this.checksumLength);
      const relativeRootPath = path.relative(process.cwd(), file.path);
      const relativePath = path.relative(SITE_ROOT, relativeRootPath);

      const cachePath = `${CLOUDFLARE_WORKER_HOST}/cache-bust/${relativePath}`;
      axios
        .get(cachePath)
        .then((res) => {
          if (res.data === fileHash) {
            // when cache no update
            return;
          }
          axios
            .post(cachePath, fileHash, {
              headers: { Authorization: CLOUDFLARE_WORKER_API_KEY },
            })
            .then(() => {
              console.log(`cache bust success: ${relativePath} ${fileHash}`);
            })
            .catch((error) => {
              console.error(
                `cache bust failed ${relativePath} ${fileHash} ${error}`
              );
            });
        })
        .catch((error) => {
          console.error(
            `get cache failed ${relativePath} ${fileHash} ${error}`
          );
        });

      cb(null, file);
    })
  );
});

gulp.task("post-js", () => {
  var server = express();
  server.use(express.static(SITE_ROOT));
  server.listen(6969);

  return gulp
    .src(SITE_ROOT_HTML, { base: SITE_ROOT })
    .pipe(
      through2.obj(async (file, _, cb) => {
        if (!file.isBuffer()) {
          // not support type
          return cb(null, file);
        }

        const relativeRootPath = path.relative(process.cwd(), file.path);
        const relativePath = path.relative(SITE_ROOT, relativeRootPath);

        console.log(`Rendering ${relativePath}`);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(`http://localhost:6969/${relativePath}`, {
          waitUntil: "networkidle0",
        });

        let body = await page.evaluate(() => {
          // remove data-post-js script
          const unusedElements = document.querySelectorAll(
            'script[data-post-js="true"]'
          );
          for (let i = 0; i < unusedElements.length; i++) {
            unusedElements[i].parentNode.removeChild(unusedElements[i]);
          }
          return document.documentElement.outerHTML;
        });

        // replace script type text/runtime-javascript to text/javascript
        body = body.replace(
          /type\=\"text\/runtime\-javascript\"/g,
          'type="text/javascript"'
        );
        body = "<!DOCTYPE html>" + body; // DOCTYPE is gone when puppeteer run

        file.contents = Buffer.from(body);

        await browser.close();

        cb(null, file);
      })
    )
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(SITE_ROOT))
    .on("end", () => {
      // TODO: close express server
      console.log("post-js finished");
    });
});

// Generate & Inline Critical-path CSS
gulp.task("critical", () => {
  return gulp
    .src(SITE_ROOT_HTML)
    .pipe(
      // https://github.com/addyosmani/critical#options
      critical({
        // base directory
        base: SITE_ROOT,
        // Inline the generated critical-path CSS
        // - true generates HTML
        // - false generates CSS
        inline: true,
        // Extract inlined styles from referenced stylesheets
        extract: false,
        // ignore CSS rules
        ignore: {},
        // strict true
        strict: true,
        // css files
        css: [path.join(POST_BUILD_STYLES, "style.css")],
        // screen dimensions
        dimensions: [
          {
            width: 876,
            height: 2142,
          }, // vertical max height
          {
            width: 3240,
            height: 2160,
          }, // horizontial max height
        ],
      })
    )
    .on("error", (err) => {
      console.log(err.message);
    })
    .pipe(gulp.dest(SITE_ROOT));
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
    watch: true,
    notify: true,
  });

  gulp.watch(
    [
      "**/*.css",
      "**/*.html",
      "**/*.js",
      "**/*.md",
      "**/*.markdown",
      "!_site/**/*",
      "!_watch/**/*",
      "!node_modules/**/*",
      "_config.yml",
      "!assets/**/*",
    ],
    { interval: 500 },
    buildSite
  );
});

const jekyllSeries = gulp.series("buildJekyll", "processStyles");
const buildSite = gulp.series(jekyllSeries, "uglify", "uglify-sw");

exports.serve = gulp.series(buildSite, "startServer");
exports.default = gulp.series(buildSite, "post-js", "critical");
exports.bustCache = gulp.series("bust-cache");
exports.postJS = gulp.series("post-js", "critical");
