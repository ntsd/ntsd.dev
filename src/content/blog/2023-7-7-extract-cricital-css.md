---
layout: post
title: "Separate critical CSS and non-critical CSS for faster page load"
date: 2023-7-7
description: "Separate critical CSS for inline HTML and non-critical CSS for asynchronous load for a better performance page load."
catalog: true
categories:
  - Software Development
tags:
  - Programming
  - Frontend
  - Web Development
  - Web Performance
  - CSS
published: true
---

## Why inline Critical CSS?

Critical CSS includes only the styles needed to render the Above the Fold of a webpage.

By delivering these styles inline in the HTML document, the browser can render this content without having to wait for the entire external CSS file to load. Non-critical CSS can load later in Asynchronous without render-blocking.

## Above the fold

"Above the fold" content refers to the portion of a webpage that is visible without scrolling.

To consider Above the Fold Dimension normally we specify the supporting media queries of the CSS framework and Breakpoints.

For example, In a Tailwind page that only has `lg` breakpoints means If the width size is less than `1024` will be considered as Vertical Aspect Ratios (Mobile or Tablet).

To calculate the Above the fold resolution size and Dimension, If the website only scrolls down so we should use the highest height possible.

From my research, the longest aspect ratio in mobile devices is Motorola Razr at `146:357` aspect ratio with a resolution `W 876 x H 2142` in vertical mode.

For Horizontal mode or screen width of more than 1024, we can use Surface Book at `3∶2` aspect ratio with a resolution of `W 3240	 × H 2160`.

## Install Critical on Gulp

Because I am using Gulp for my website so I will show example in Gulp, but you can install it globally as you want.

The Library Github and document: <https://github.com/addyosmani/critical>

Install package

`npm install --save-dev critical`

Create a gulp task

```javascript
import gulp from "gulp";
import path from "path";
import { stream as critical } from "critical";

const SITE_ROOT = isDevelopmentBuild ? "./_watch" : "./_site";
const SITE_ROOT_HTML = `${SITE_ROOT}/**/*.html`;
const POST_BUILD_STYLES = `${SITE_ROOT}/assets/css/`;

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
```

Then change the style load to async load, May consider add `noscript` for non javascript support browser.

```html
<link
  rel="preload"
  href="{{ site.baseurl }}/assets/css/style.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<!-- below is optional -->
<noscript>
  <link rel="stylesheet" href="{{ site.baseurl }}/assets/css/style.css" />
</noscript>
```
