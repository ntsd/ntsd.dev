---
layout: post
title: "How to use Stream Pipe and Transform in Node.js"
date: 2024-11-23
description: "Example use of stream pipe and transform in Node.js. Useful for processing large data and passing it through another process."
catalog: false
categories:
  - Software Development
tags:
  - Node.js
  - Programming
  - Stream
published: true
---

If you want to perform data streaming in Node.js,

for example, to replace all strings using a global RegEx,

reading the entire data and processing it at once will use more memory than processing the data in chunks or partially.

The code below shows you how to replace the string `/Lorem\sipsum/g` with `muspi meroL`.

However, the issue is that it will load the data all at once into memory, then process the replacement, and finally save the replaced data to a new file.

```ts
import fs from "fs";

const reader = fs.readFileSync("./test.txt"); // 190MB lorem ipsum text
const replaced = reader.toString().replace(/Lorem\sipsum/g, "muspi meroL");

fs.writeFileSync("./test.out.txt", replaced);
```

By print the memory use by `process.memoryUsage()` you can see that it use a lot of memory.

```
Memory usage by rss, 884.441088MB
Memory usage by heapTotal, 585.957376MB
Memory usage by heapUsed, 549.476792MB
Memory usage by external, 198.597365MB
Memory usage by arrayBuffers, 196.189773MB
✨  Done in 1.34s.
```

In case you want to process a very big file or have limited memory,

you can process the data using [Node.js stream](https://nodejs.org/api/stream.html),

which means the data will be processed in parts and then passed through another process.

For example,

```ts
import { Transform } from "stream";
import fs from "fs";
import split2 from "split2";

class ReplaceTransformSplit2 extends Transform {
  regex: string | RegExp;
  replacer: string | ((substring: string, ...args: unknown[]) => string);

  constructor(
    regex: string | RegExp,
    replacer: string | ((substring: string, ...args: unknown[]) => string)
  ) {
    super();
    this.regex = regex;
    this.replacer = replacer;
  }

  // you can also use encode to check the data encoding
  _transform(chunk: Buffer, encode: string, cb: () => void) {
    // push to pass the data to the next pipe process
    // add "\n" because split2 will remove the endline so we have to add it
    this.push(chunk.toString().replace(this.regex, this.replacer) + "\n");
    // callback to tell the chunk process success
    cb();
  }
}

const readerStream = fs.createReadStream("./test.txt"); // 190MB lorem ipsum text
const writerStream = fs.createWriteStream("./test.out.txt");
const replaceTransform = new ReplaceTransformSplit2(
  /Lorem\sipsum/g,
  "muspi meroL"
);

// use split2 to make the chunk separate by space
readerStream.pipe(split2()).pipe(replaceTransform).pipe(writerStream);
```

Because we process the chunk line by line, this code does not have the ability to replace text that spans multiple lines.

You can see that the memory usage is much lower because it reads a portion of the file, processes it, and then writes it directly without storing the entire buffer in memory.

```
Memory usage by rss, 220.135424MB
Memory usage by heapTotal, 115.310592MB
Memory usage by heapUsed, 94.128872MB
Memory usage by external, 7.279535MB
Memory usage by arrayBuffers, 4.796103MB
✨  Done in 1.38s.
```

Another case that you can replace the string without split2 is you can store chunk in the buffer incase the chunk split half of the word.

You can see the example from this [stream-replace-string](https://github.com/ChocolateLoverRaj/stream-replace-string/blob/master/index.js) library.
