---
layout: post
title:  "Add Facebook comments to a website in 5 minutes"
date:   2020-3-23 12:30:54
subtitle: "A tutorial to add Facebook comments to a website"
catalog: true
categories:
    - Software Development
tags:
    - Programming
    - Facebook Developer
    - Frontend
published: true
---

## Create a Facebook App

before creating the Facebook comments you need to have your Facebook App first if you already have you just skip this step.

1. Go to <https://developers.facebook.com/apps/>

2. click `Add a New App`

3. fill `Display Name` and `Contact Email`

4. click `Create App ID`

![Create a Facebook App](/img/in-post/2020-3-23-add-facebook-comments-to-your-website/0.png)

## Generate Comments Plugin Code

Generate code and import Facebook SDK from the Facebook developer page

1. go to <https://developers.facebook.com/docs/plugins/comments>

2. add initial URL at field `URL to comment on` don't worry you can change it later

3. set the width to 100%

4. set number of posts mean number of posts will show immediately and for other user need to click show more for it

5. click get code
![get Facebook comment code](/img/in-post/2020-3-23-add-facebook-comments-to-your-website/1.png)

6. select your app ID you need to use the API for and select language you want for the SDK
![select your app ID you need to use the API for and select language you want for the SDK](/img/in-post/2020-3-23-add-facebook-comments-to-your-website/2.png)

7. copy these code and drop to your page

8. change `data-herf` to your page URL
