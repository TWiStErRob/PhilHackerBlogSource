+++
share = true
draft = false
title = "Some Resources for Learning how to Test Android Apps"
date = "2017-03-03T08:34:09-05:00"
comments = true
image = ""
menu = ""
author = ""
slug = "some-resources-for-learning-how-to-test-android-apps"
tags = [
  "android",
  "testing",
]

+++

Someone recently asked me how I "know so much" about testing android apps. After disabusing them of the notion that I know a lot about testing, I said that I'd write up a blog post of some helpful resources I've found and send it to them. This is that blog post.

The resources are divided into books, articles, talks, and podcasts. I've marked resources that I think are essential with a "\*".

## Books:

### Working Effectively with Legacy Code *

If you're working on already existing Android app and you're trying to figure out how to get tests in place, I can't recommend this book enough. [The book](https://www.amazon.com/Working-Effectively-Legacy-Michael-Feathers/dp/0131177052) has a lot of fantastic theory on [what makes code testable in general](www.philosophicalhacker.com/post/what-makes-android-apps-testable/). It also has a bunch of great tips for conservative refactorings you can do to safely get your codebase to a more testable state.

### Growing Object Oriented Software Guided by Tests

If you're working on a greenfield project, [this book](https://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627) is a great way to see how tests positively influence the architecture of your application and help you move towards more object oriented code. It also has some very practical tips on some trickier cases like testing persistence, etc.

There's also a nice appendix in the book that talks about the history of "mocking" and what Fowler would call the "mockist" style of TDD. The underlying philosophy behind Mockito makes a lot more sense once you've read this.

### TDD By Example *

This is [the book by the guy popularized TDD](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530/ref=pd_sbs_14_t_1?_encoding=UTF8&psc=1&refRID=GBD9CHYJGZ7Y5YEB07CH). Since I had already read *Working Effectively with Legacy Code* and *Growing Object Oriented Software Guided by Tests* before picking this up, there wasn't a ton new for me to glean. However, since this is written by Kent Beck, I consider it essential reading. One thing I found interesting was how non-dogmatic Beck was in advocating for TDD. I also did learn [a neat heuristic for determining when I should be writing tests or doing TDD]({{<relref "what-should-we-unit-test.md">}}).

### xUnit Test Patterns

I'm nearly finished with [this one](https://www.amazon.com/xUnit-Test-Patterns-Refactoring-Code/dp/0131495054). Some of it feels a bit repetitive, but there are some great insights about writing readable tests. There's also a really nice discussion about the tradeoff between easy fixture management and test performance.

## Articles:

### Mocks Aren't Stubs *

[Great Martin Fowler article](https://martinfowler.com/articles/mocksArentStubs.html) that gives a taxonomy of test doubles. Mockito has us all confused about this, but Fowler does a great job of teasing apart the various concepts that are mingled in Mockito's "mocks." It also contains a wonderful discussion of two different styles of TDD, with special attention paid to the influence the styles have on the architecture that emerges from doing that particular style of TDD.

### Page Object Pattern

[Martin Fowler](https://martinfowler.com/bliki/PageObject.html) named a neat pattern for ensuring that your UI tests aren't brittle. Its identical with Jake Wharton's "robot pattern" linked below.

### Misko Hevery's Testability Guide

Misko Hevery, in case you don't know, is a Google engineer and the father of Angular. He's also the author of an excellent [Testability Guide](http://misko.hevery.com/code-reviewers-guide/). In the guide, you learn why GOF Singletons and static access in general aren't great for tests or your architecture. This guide actually inspired my post ["Why Static References to Application Contexts Aren't the Best Idea"](https://www.philosophicalhacker.com/2015/07/14/why-static-references-to-application-contexts-are-probably-not-the-best-idea/). You'll also see some good rules about constructors and scope and how they relate to testability.

## Talks:

#### Dagger and Testing *

[Great talk on Dagger](http://jakewharton.com/android-apps-with-dagger-devoxx/), which is arguably essential for UI-level testing. A great highlight here is Jake's discussion of "mock mode" in his u2020 app.

#### Increasing App Quality with Testing and Monitoring

[This](https://www.youtube.com/watch?v=4fyhgHQYG1U&list=PLOU2XLYxmsILe6_eGvDN3GyiodoV3qNSC&index=48) is a nice panel-like talk with developers from companies like Shazam and American Express. It was mostly useful for getting an idea of how testing works in the real world and at scale.

#### Jake Wharton on The Robot Pattern *

Jake Wharton basically renamed Fowler's Page Object Pattern and [he has a nice talk](https://realm.io/news/kau-jake-wharton-testing-robots/) explaining how to apply the pattern to espresso tests.

## Podcasts:

### Is TDD Dead? *

This is [a fantastic five part discussion](https://martinfowler.com/articles/is-tdd-dead/) between Martin Fowler, Kent Beck, and DHH. Highlights include a discussion of what we should test, the role of QA in a TDD world, the role of mocks in writing tests, and, of course, whether TDD leads to better code.

### Fragmented episode 7

[Great episode of Fragmented](http://fragmentedpodcast.com/episodes/7) with Jake Wharton. The discussion around Roboelectric and what we should test is good. That discussion partially inspired ["Why I Don't Use Roboelectric."]({{<relref "why-i-dont-use-roboletric.md">}})
