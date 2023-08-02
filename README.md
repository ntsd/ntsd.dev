# ntsd.dev

```
{% capture readme %}{%- http_request GET;https://raw.githubusercontent.com/{{ page.github }}/main/README.md;{} -%}{% endcapture %}{{ readme | markdownify }}
```

`{%- http_request GET;https://api.github.com/repos/{{ page.github }}/contents/README.md;{"headers":[{"key":"X-GitHub-Api-Version","value":"2022-11-28"},{"key":"Accept","value":"application/vnd.github+json"}]} -%}`

## Installation

```
sudo apt install ruby-full
sudo apt install rubygems
sudo gem install bundler
bundler install
npm i
```

- If you got an puppeteer errors check <https://gist.github.com/winuxue/cfef08e2f5fe9dfc16a1d67a4ad38a01#file-puppeteer-ubuntu-1804-md>

## Todos

- Fix offline page
- Fix 404 page
- Imporve google tag manager <https://www.analyticsmania.com/post/google-tag-manager-impact-on-page-speed-and-how-to-improve/>
- Use https://minimalanalytics.com/
- Category dev, investment, health, science, journey

## Cloudflare Worker

Read here: <https://github.com/ntsd/ntsd.dev/tree/master/ntsd-dev-worker>

## Pre render JavaScript

using Puppeteer to pre render JavaScript in html file for some Javascript libraries that can pre render.

Pre render JavaScript libraries:

- [PrismJS](https://github.com/PrismJS/prism)
- [AnchorJS](https://github.com/bryanbraun/anchorjs)
- [wordcloud2.js](https://github.com/timdream/wordcloud2.js/)

## Resources

<https://merakiui.com/>

<https://storyset.com/>
