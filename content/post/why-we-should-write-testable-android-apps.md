+++
draft = false
comments = true
menu = ""
date = "2016-11-07T07:36:45-05:00"
title = "Why we Should Probably Write More Tests for Our Android Apps"
slug = "why-we-should-probably-write-more-tests-for-our-android-apps"
author = ""
tags = [
  "android",
  "testing",
]
image = ""
share = true
+++

This past weekend, I had the privilege of speaking about writing testable Android apps [at Florida DevFest](https://devfestflorida.org/speakers/12/). This post is a written version of one of the major points I made in my presentation.

Let's start off with two descriptions of attitudes towards testing. The first comes from Kaushik Goupal (he's describing an attitude, not endorsing it):

> Testing seems to be like going to gym. Everyone feels like "yeah. I should be testing. I should be going to the gym everyday."

> Koushik Goupal, Fragmented Episode 13 12:01

The second comes from *Pragmatic Programmer*:

> Your signature should come to be recognized as an indicator of quality. People should see your name on a piece of code and expect it to be solid, well written, tested, and documented. A really professional job. Written by a real professional. A Pragmatic Programmer.

> Andrew Hunt and Dave Thomas, Pragmatic Programmer

Which attitude is right? Is automated testing a nice-to-have or is it an integral part of a software engineer's work. I think that its the latter. Here's why.

### For most of us, Good Code is Changeable Code

Dan North, the "BDD" creator and core contributor of rspec, has an interesting perspective on what we're doing as software engineers. He says,

>goal of software delivery is to minimise the lead time to business impact. Everything else is detail.

This view is a bit too strong in my opinion, but it does get one thing right: good code is changeable code. Suppose you ship an app that is performant and beautiful and that many of your users love it. Your boss says, "this is great, but lets add a feature and change this other behavior." If you're response is, "Well, the code is spaghetti. Its hard to understand and I'm not confident that I won't break things when I make changes," you're boss is going to be disappointed.<sup>1</sup>

For most of us, I don't think that claim will seem controversial. If you're working on a pet project or a prototype that isn't going to need to survive multiple iterations, I'm not really including you in the "us" here.  

### For most of us, Changeable Code is Tested Code

Say you agree that good code is changeable code. What does that have to do with tests? Well, for most of us, tests are the only practical way of minimizing the time it takes to change our software.

When I say "us" here, I'm talking about professional software engineers of average intelligence who are working on fairly large projects. I'm not that smart, so I make mistakes when I write code, especially if the codebase I'm working on is large. If you're much smarter than me and/or you're working on a smaller project, this argument doesn't really apply.

There's two reasons why changeable code is tested code.

First, writing unit tests for your code actually helps you write better code. I think this is an under-appreciated benefit of writing unit tests for your code. Steve Freeman and Nat Pryce have a nice way of explaining why this is true:

> for a class to be easy to unit-test, the class must…be loosely coupled and highly cohesive —in other words, well-designed.

> Steve Freeman and Nat Pryce, Growing Object Oriented Software Guided by Tests

I think its uncontroversial that loose coupling and high cohesion are properties that make it easier to change code.

Second, writing tests (unit or otherwise) allow us to make changes without having to worry that we've broken something. Mark Zuckerberg painted a really powerful picture of this in his recent "How to build the Future Interview:"

>We invest in this huge testing framework…engineers here have the power to try out an idea and ship it to maybe 10,000 people or 100,000 people.

Imagine that. Engineers can build a feature and ship it with confidence.<sup>2</sup> That's possible because of automated testing.

### Conclusion

If good code is changeable code and if changeable code is tested code, then we should probably write more automated tests for our Android apps. Automated tests aren't a nice to have. They're integral to writing good apps.

One quick caveat: A lot of folks seem to think that there's less reason to write tests when you're working with a startup because you're trying to move quickly. I can imagine extreme circumstances where that might make sense, but once you get the hang of writing tests and writing testable software, writing tests don't take that long. Because of this, I think that refraining from writing tests as a startup can often be an exercise in short-term thinking. In fact, I [think the argument for automated testing in a startup](http://www.philosophicalhacker.com/post/tdd-and-startups/) is even more compelling than it is for developers working on an established product.

### Notes:

1. I actually suspect that the business value of writing well-architected, readable code ultimately reduces to the value of being able to change code in response to users needs, but that point isn't essential to the argument I'm making.

1. The context of this quote actually has more to do with a/b testing that regression testing, but regression testing plays a big role in Facebook's ability to move quickly. Facebook has invested heavily in automated testing by, for example, employing Kent Beck, the guy who popularized TDD.
