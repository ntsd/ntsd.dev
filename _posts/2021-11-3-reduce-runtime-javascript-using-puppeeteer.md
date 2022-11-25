---
layout: post
title: "Reduce runtime JavaScript to improve page speed using Puppeteer"
date: 2021-11-3
subtitle: "How I remove some unnecessary JavaScript to make the page loading faster in runtime using Puppeteer"
author: "ntsd"
catalog: false
categories:
  - Software Development
tags:
  - Programming
  - Frontend
  - Web Development
  - Web Performance
published: true
---

The problem is when I am using many JavaScript libraries with big sizes and unnecessary to run in runtime such as [PrismJS](https://github.com/PrismJS/prism), [AnchorJS](https://github.com/bryanbraun/anchorjs), and [Wordcloud2](https://github.com/timdream/wordcloud2.js/). All of these JavaScript libraries will load content from HTML and render it component by adding element classes and styles.

In this example, I will show how to use [PrismJS](https://github.com/PrismJS/prism) without runtime JavaScript because it's the biggest library I'm using. To do that I need [Puppeteer](https://github.com/puppeteer/puppeteer) headless Chrome for NodeAPI.

First of all, I download PrismJS from the [download page](https://prismjs.com/download.html) and just select all languages then download JavaScript and CSS files. Put both on the HTML page. It took 500kb of JavaScript and 14kb of CSS.

```HTML
<script type="text/javascript" src="{{ site.baseurl }}/assets/js/prism.js" data-post-js="true" ></script>
```

I have a custom [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) name `data-post-js` which I'll use to specific JavaScript tag for render before runtime. I call it Post JS because it works like PostCSS that will run on build only.

For JavaScript I want it to run on runtime I use to type `text/runtime-javascript` to avoid running in the Puppeteer.

```HTML
<script type='text/runtime-javascript' async>
</script>
```

To make it work I create a [Gulp](https://github.com/gulpjs/gulp) task when building the page. I want to make Puppeteer run and render the HTML page. Explain below.

```JavaScript
gulp.task("post-js", async () => {
  browserSync.init({
    files: [SITE_ROOT + "/**"],
    open: false,
    port: 7000,
    server: {
      baseDir: SITE_ROOT,
      serveStaticOptions: {
        extensions: ["html"],
      },
    },
  });

  await new Promise(resolve => setTimeout(resolve, 3000)); // wait browserSync run

  return gulp.src(SITE_ROOT_HTML, { base: SITE_ROOT })
    .pipe(through2.obj(async (file, _, cb) => {
      if (!file.isBuffer()) { // not support type
        return cb(null, file);
      }

      const relativeRootPath = path.relative(process.cwd(), file.path);
      const relativePath = path.relative(SITE_ROOT, relativeRootPath);

      console.log(`Rendering ${relativePath}`);

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(`http://localhost:7000/${relativePath}`, { waitUntil: 'networkidle0' });

      let body = await page.evaluate(() => {
        // remove data-post-js script
        const unusedElements = document.querySelectorAll('script[data-post-js="true"]');
        for (let i = 0; i < unusedElements.length; i++) {
          unusedElements[i].parentNode.removeChild(unusedElements[i]);
        }
        return document.documentElement.outerHTML;
      });

      // replace script type type="text/runtime-javascript" to type"text/javascript"
      body = body.replace(/type\=\"text\/runtime\-javascript\"/g, 'type="text/javascript"');

      // DOCTYPE is gone when puppeteer run
      body = '<!DOCTYPE html>' + body;

      file.contents = Buffer.from(body);

      await browser.close();

      cb(null, file);
    }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(SITE_ROOT))
    .on('end', () => {
      browserSync.exit();
      console.log('post-js finished');
    });
});
```
{: .line-numbers}

First, use [BrowserSync](https://github.com/BrowserSync/browser-sync) to serve the whole site. (lines 2-12)

And then use Puppeteer to open the pages and run all of the JavaScript tags. (lines 27-30)

After the page ran, Remove used JavaScript with the `data-post-js` attribute. (lines 32-39)

Then replace `text/runtime-javascript` with `text/javascript` to make it a normal run in runtime. (line 42)

Because `<!DOCTYPE html>` will remove when Puppeteer runs so I need to add it again. (line 45)

Now the page will render PrismJS and remove it from runtime JavaScript. This will make the page faster to not download the 500kb size of PrismJS and no need to wait for the script to render in runtime.

This method will also work with many JavaScript libraries which not need to run in runtime. The concept is basically the same as [Pre-rendering](https://nextjs.org/docs/basic-features/pages#pre-rendering) and [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation) in NextJS.

[See in Github](https://github.com/ntsd/ntsd.dev/blob/e2db2c0f4677b49bb928dcef20ba5b441a67fdbb/gulpfile.babel.js#L132-L188)
