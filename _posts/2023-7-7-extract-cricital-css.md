---
layout: post
title: "Separate critical CSS and non-critical CSS for faster page load"
date: 2023-7-7
subtitle: "Separate critical CSS for inline HTML and non-critical CSS for asynchronous load for a better performance page load."
catalog: true
categories:
  - Software Development
tags:
  - Programming
  - Frontend
  - Web Development
  - Web Performance
  - CSS
published: false
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


