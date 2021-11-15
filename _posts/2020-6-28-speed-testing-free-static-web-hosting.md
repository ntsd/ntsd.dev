---
layout: post
title:  "Speed testing and compare free static web hosting (Netlify vs Github Page vs Fast.io)"
date:   2020-05-30 15:14:54
subtitle: ""
author: "ntsd"
categories: Hosting
tags:
    - Hosting
    - Website
    - Web Performance
    - Frontend
published: true
catalog: true
---

Edit: Since Fast.io Archive and Cloudflare Page come I did tested it and it worked well so now I moved to Cloudflare Page.

I did create a website from Jekyll and I'm looking for static web hosting to store it. What's the fastest and lowest latency for free web hosting\? Here is a topic that I testing about it.

## Static Web Hosting

I'll deploy the site to a different web hosting to check what's the best. My choices are following here.

### Github Page

Github Page is a free web hosting that supports to build Jekyll static web. It standalone running in Github repository so you can't use it with Gitlab or other git platforms.

![Github Page Panel](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/github-page-panel.png)

### Netlify

Netlify also a free web hosting but there's a build limit for free user Netlify is supporting a lot of Static web generators.
Netlify also allows to use their DNS for a faster routes.

![Netlify Panel](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/netlify-panel.png)

### Fast.io

Fast.io is super fast file hosting. but I use it as a static web storage. Fast.io provide many features such as Auto minify, Mirage (help speed up loading depend on device), Polish (automate compress image), Scrape Shield (protect site from scraping).

![Fast.io Panel](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/fast.io-panel.png)

## Testing Tools

Because of every hosting have Global CDN and The result can be difference in difference tools so I need to test every host on every tools for the best estimate result as I can.

### Dotcom-Monitor website speed test

Dotcom-Monitor allow to test website multiple locations worldwide. I think this is the best tool testing because it has testing server around the world.

Site: <https://www.dotcom-tools.com/website-speed-test.aspx>

#### Config locations

![Dotcom-Monitor config](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/dotcom-monitor-config.png)

#### Dotcom-Monitor Github Page Result

![Dotcom-Monitor Github Page Result](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/dotcom-monitor-github.png)

#### Dotcom-Monitor Netlify Result

![Dotcom-Monitor Netlify Result](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/dotcom-monitor-netlify.png)

#### Dotcom-Monitor Fast.io Result

![Dotcom-Monitor Fast.io Result](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/dotcom-monitor-imfast.png)

### Google PageSpeed Insights

Google PageSpeed Insights will analyze a web page. It can simulate screen size, 3G/4G mobile connection, and CPU speed the check that your site is working well on mobile devices. it can generate suggestions to make the page faster. but there's no server location config so we don't know the location of the testing server.

Site: <https://developers.google.com/speed/pagespeed/insights/>

![Google PageSpeed Insights](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/pagespeed-insights-panel.png)

#### PageSpeed Insights Github Page Result

![PageSpeed Insights Github Page Mobile Result](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/pagespeed-insights-github-mobile.png)

![PageSpeed Insights Github Page Desktop Result](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/pagespeed-insights-github-desktop.png)

#### PageSpeed Insights Netlify Result

![PageSpeed Insights Netlify Mobile Result](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/pagespeed-insights-netlify-mobile.png)

![PageSpeed Insights Netlify Desktop Result](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/pagespeed-insights-netlify-desktop.png)

#### PageSpeed Insights Fast.io Result

![PageSpeed Insights Fast.io Mobile Result](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/pagespeed-insights-imfast-mobile.png)

![PageSpeed Insights Fast.io Desktop Result](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/pagespeed-insights-imfast-desktop.png)

### GTmetrix

GTmetrix is a testing tool that has rich features and comparison graphs to show you what site is loading faster.

Site: <https://gtmetrix.com/>

![GTmetrix](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/gtmetrix-panel.png)

To compare these site I'll set the server location to Australia because It's closet to my country.

### GTmetrix Results

![GTmetrix Compare](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/gtmetrix-compare-1.png)

![GTmetrix Compare](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/gtmetrix-compare-4.png)

![GTmetrix Compare](/img/in-post/2020-6-28-speed-test-free-static-web-hosting/gtmetrix-compare-5.png)

## Conclusion

After tests all hosting services with all tools. I think Fast.io is clearly the winner as performance static file hosting. This test might not the optimal test because I haven't tuned the web enough as you see Fast.io minify and compress feature can still reduce data size. For Netlify, I forgot to set response headers and cache policy and Github Page still can't config header response. By the way, Fast.io is just a static hosting service you can't build your static site on it like Github Page or Netlify so You need to build before push to the git.

For the rich features, CICD, and build function, I think Netlify is still the best for me.
