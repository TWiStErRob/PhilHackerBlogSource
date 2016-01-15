---
author: kmdupr33@gmail.com
categories:
- Hacking
comments: true
date: 2015-06-07T13:16:29Z
slug: developer-golf
title: Developer Golf
url: /2015/06/07/developer-golf/
wordpress_id: 421
---

## [![Developer golf](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/Developer-golf.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/Developer-golf.png)




## What is Developer Golf?


Developer golf is a fun way to measure developer performance. It turns our job into a game of producing the most lines of high quality (bug free) code.

<!--more-->


## How do you play?


You win developer golf in the same way that you win any golf game: by having the least amount of **strokes **at the end of** a course**.

A **stroke** in developer golf is a bug that makes it past the developer, whether that bug is found by QA or by users (in production). Once the cause of the bug is found, `git-blame` can be used to determine which developer gains a stroke for the bug.

A **course **in developer golf could be a sprint or a release. **Par** for the course is calculated by averaging out the ratio of story points to bugs for all previous sprints and/or releases and then dividing that number by the number of developers on a team. Here's an example:


<blockquote>Sprint 1: 140 story points/14 bugs

Sprint 2: 160 story points/16 bugs

Sprint 3: 130 story points/ 13 bugs

Average story point to bug ratio: 10

Number of devs on a team: 2

Par for the next course: 5</blockquote>


**Mulligans** can be earned by contributing significantly more code than your team members. Mulligans are earned prior to the start of a course. In order to determine how many mulligans a developer has:



	
  1. For every developer, calculate her average number of contributions (additions and deletions) per week.

	
  2. Calculate the standard deviation for weekly team member contributions.

	
  3. The number of mulligans a developer has earned is equal to the square of the number of standard deviations her average weekly contribution is above the average weekly contribution for all developers. (You can't have negative mulligans.)


Here's an example:


<blockquote>**Average weekly contributions: **

Bob: 1000 contributions

Barbara: 2000 contributions

Billy: 3000 contributions

**Standard deviation: 1000**

Billy gets a mulligan.</blockquote>


**Team play:** You could introduce team play simply by treating teams as you would individuals.

Happy golfing!
