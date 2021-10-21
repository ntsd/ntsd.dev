---
layout: post
title:  "Apache Cassandra with Spring Boot tutorial"
date:   2019-09-19 12:30:54
subtitle: "learn how to use Apache Cassandra and Spring Data Cassandra"
author: "ntsd"
catalog: true
categories:
    - Programming
header-img: "../img/in-post/LegendsofCodeandMagic.png"
tags:
    - Programming
    - Database
    - Cassandra
published: false
---

### "What is Apache Cassandra ?"

Apache Cassandra is a NoSQL database that's good for Performance, [Fault tolerance](#FaultTolerance), High availability and [Linear scalability](#LinearScalability).

### "Why use Cassandra ?"

Cassandra is fast as writes and okay with reads.

#### When to use Cassandra

- Distributed
- [Linear scalability](#LinearScalability)
- Writes over reads
- Fast read by primary key

##### When to not use Cassandra

- Many secondary indexes
- ACID
- Updates or Delete

### Glossary

<a name="LinearScalability"></a> **Linear scalability** - scalability by resource per throughput in a linear graph 
ex. pay 5\$ per month for 50 op/s and when pay 10\$ per month it can get 100 op/s

<a name="FaultTolerance"></a> **Fault tolerance** - the property that prevents operating failure when some of the components is failing that could be a problem from hardware or software.

### Reference

- [https://cassandra.apache.org](https://cassandra.apache.org)

- [https://www.datastax.com/why-datastax/apache-cassandra](https://www.datastax.com/why-datastax/apache-cassandra)

- [https://blog.pythian.com/cassandra-use-cases/](https://blog.pythian.com/cassandra-use-cases/)
