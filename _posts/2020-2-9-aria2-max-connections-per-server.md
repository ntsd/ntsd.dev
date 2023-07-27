---
layout: post
title:  "Recompile aria2 to increment max connections per server"
date:   2020-2-9 12:30:54
description: "Edit a line of code and re-complie aria2 to unlock aria 2 connections limit"
catalog: true
categories:
    - Software Development
header-img: "../img/in-post/2020-2-9-aria2-max-connections-per-server/header.jpg"
tags:
    - Programming
    - C++
    - aria2
    - Network
published: true
---

There's a maximum number 16 connections hard code in aria2 so when I want to add more connections I need to edit a line of code and recompile it

## Edit max connections per server

Edit number arguments in NumberOptionHandler for MAX_CONNECTION_PER_SERVER in file "OptionHandlerFactory.cc"

from 16 to 64 the number is as you want.

``` c++
OptionHandler* op(new NumberOptionHandler(PREF_MAX_CONNECTION_PER_SERVER,
                                              TEXT_MAX_CONNECTION_PER_SERVER,
                                              "1", 1, 64, 'x'));
```

## Build the aria 2

Install following packages.

- libxml2-dev
- libcppunit-dev
- autoconf (gettext)
- automake
- autotools-dev
- autopoint
- libtool

You can install all of it by running this command.

``` bash
brew install gettext automake autoconf libtool libxml2 cppunit
```

If you install LibXML with brew you also need to link it to `/usr/local/include/`.

``` bash
sudo ln -s /usr/local/opt/libxml2/include/libxml2/libxml /usr/local/include/libxml
```

Add Gettext and libxml2 to your path for me it's `~/.zshrc`.

``` bash
# gettext
export PATH=${PATH}:/usr/local/opt/gettext/bin

# libxml2
export PATH="/usr/local/opt/libxml2/bin:$PATH"
export LDFLAGS="-L/usr/local/opt/libxml2/lib"
export CPPFLAGS="-I/usr/local/opt/libxml2/include"
```

Generate configs.

``` bash
autoreconf -i
```

Run config that you just create.

``` bash
./configure
```

I'll just use the default configuration.

If you want more details of it you can just copy steps from the homebrew script here <https://github.com/Homebrew/homebrew-core/blob/master/Formula/aria2.rb>.

Use make file to compile the code

``` bash
make
```

Test all code (you can skip this step).

``` bash
make check
```

Run make install to generate the binary file.

``` bash
make install
```

Then you'll get a new aria2c binary file complied in `/usr/local/bin/` directory.

You can check by the command.

``` bash
ls -latr /usr/local/bin/
```

## Test the compiled aria2 binary file

Make sure `/usr/local/bin/` is in your path.

Now you can test the aria2c binary file that you just compile.

`aria2c -k 1M -s 64 -x 64 http://ipv4.download.thinkbroadband.com/1GB.zip`

Basic Options

-k, --min-split-size=\<SIZE>

- minimum split size

-s, --split=\<N>

- split file to N part

-x, --max-connection-per-server=\<NUM>

- maximum number of connections to one server.

You'll see the number of connections is 64.

![the number of connections is 64](/img/in-post/2020-2-9-aria2-max-connections-per-server/aria.png)

Done, Now you can use the binary file and unlock the aria 2 connections limit.

## references

- <https://github.com/aria2/aria2>
- <https://github.com/aria2/aria2/issues/580>
- <https://github.com/aria2/aria2/issues/810>
- <https://aria2.github.io/manual/en/html/README.html#how-to-build>
