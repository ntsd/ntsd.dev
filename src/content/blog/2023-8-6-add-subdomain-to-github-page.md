---
layout: post
title: "Add subdomain for Github Pages"
date: 2023-8-6
description: "Tutorial how to add Subdomain for Github Pages on Cloudflare or other DNS"
catalog: true
categories:
  - Software Development
tags:
  - Programming
  - Frontend
  - DNS
  - Github
  - Cloudflare
  - Github Pages
published: false
---

Since the DNS can't add a CNAME record to github page path such as `<username>.github.io/<path>` when it's not a user Github page. You can only add a CNAME record to `<username>.github.io`.

This tutorial show how to tell the DNS to point to the path.

## Verify Domain on Github

This tutorial might require to verify the DNS or Domain to Github.

Following the steps

1. Go to <https://github.com/settings/pages>
2. Click Add Domain
3. Enter your Domain without protocal `ntsd.dev` for example
