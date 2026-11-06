---
layout: post
title: "Explain Full Text Search in PostgreSQL"
date: 2021-10-10
description: "Explain index types in PostgreSQL how it work and compare between Hash and B-Tree index"
catalog: true
categories:
  - Software Development
tags:
  - Programming
  - Database
  - PostgreSQL
  - Backend
  - Performance
published: false
---


```SQL
CREATE TABLE persons (
  id int PRIMARY KEY,
  first_name text,
  last_name text
);

CREATE INDEX fts_idx ON persons USING gin (to_tsvector('english', first_name || ' ' || last_name));
                                                       
INSERT INTO persons VALUES (1, 'john', 'doe');
INSERT INTO persons VALUES (2, 'jane', 'doe');
INSERT INTO persons VALUES (3, 'jack', 'doe');
INSERT INTO persons VALUES (4, 'john', 'connor');
INSERT INTO persons VALUES (5, 'don', 'john');
```

```SQL
SELECT * FROM persons WHERE to_tsvector('english', first_name || ' ' || last_name) @@ to_tsquery('english', 'john');
```
