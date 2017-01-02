+++
slug = "what-should-we-unit-test"
title = "What Should we Unit Test?"
author = ""
tags = [
  "android",
  "testing",
]
menu = ""
comments = true
draft = false
image = "images/the-scream.jpg"
share = true
date = "2017-01-01T16:41:45-05:00"
+++

When I go to work, I'm afraid of three things. I worry that

* the new feature I'm implementing won't work as expected
* the code I'm tweaking will break functionality that used to work
* the application isn't architected in a way that makes it easy for me to adapt it to ever-changing business requirements

Automated testing is supposed to help alleviate all three of these fears, but when we're first getting started with automated testing, it can be difficult to know where to start. We might look at a piece of code and wonder to ourselves, "Should I write a test for this code?"

Cursory research on the question yields platitudes like "unit test your business logic," but when I first got started, that didn't really mean much to me<sup>1</sup> and now that I have a bit more experience writing android unit tests, I find that answer to be too simplistic.

Over-zealous testing enthusiasts may shout a different answer at us: "YOU SHOULD TEST (ALMOST) EVERYTHING!" They may be right. They're not over-zealous because of how much they want us to test. Rather, they're over-zealous because that's a very unhelpful answer to the question "Where should I *start* testing?" Its simply not true that all tests are equally helpful, a fact that Kent Beck, the guy who popularized TDD, recently tweeted about:

{{< tweet 812703192437981184 >}}

I think that if we keep in mind the fears that lead us to write tests in the first place, we'll have a much easier time figuring out what to test. This should come as no surprise. After all, Kent Beck's answer to the question of what to test is this:

>Write tests until fear is transformed into boredom.<sup>1</sup>

This post is about the tests that fear drives us to write, tests that we should be spending most of our time writing.

### When new functionality is complicated

Sometimes we write complicated code when simpler code could have done the trick. Sometimes, however, we can't make our code any simpler. The problem we're solving or the domain/rule we're modeling is just complicated. When this happens, I get a little anxious. For example, suppose you had to implement the following functionality:

> Show a "rate dialog" to a user if they've used the app three times. The user can opt to rate the app, request to be reminded to rate the app, or decline to rate the app. If the user opts to rate the app, take them to the google play store and don't show the rate dialog again. If the user opts to be reminded to rate the app, reshow the dialog after three days have passed. If the user declines to rate the app, never show the dialog again.

This isn't terribly complicated, but its enough to make me anxious that I've covered all my bases as I'm writing the code. This is the kind of thing I'd write a unit test for.

### When you've got old code that breaks often

Sometimes there are parts of a code base that are very brittle. I typically dread having to make changes in these parts of a codebase. Even worse: some brittle parts of the code base have to change often and this causes lots of bugs. Making changes in this kind of code is like leaving food and dirty dishes out a crappy apartment: it invites bugs.

Working on code that changes often and is often the source of bugs is maybe the scariest part of being a software engineer. You watch your co-workers trudge through the scary code and then they eventually find out the code that they changed introduced a bug. When you get assigned a ticket in that area, you have to pretend that you didn't just see your co-worker get pwned by the code there. The fear is strong, so this is a great place to write tests.<sup>3</sup>

Unfortunately, brittle code isn't typically code that going to be easily unit testable, so you may have to settle for a functional-level test. Alternatively, you could employ some very conservative refactoring to get the brittle code into a unit-testable state.<sup>4</sup>

### When you think your code will change

If you think you're code will change, you've got a few reasons to write tests for it:

1. Tested code can be changed without introducing bugs.
1. Tested code has a more flexible architecture that makes it is easier to change.

For some of us, all the code we write is susceptible to change. That's why test zealots aren't crazy in my mind. However, we can and should prioritize code that we think it is more likely to change in the near feature and make sure that we have tests around that code.

### Conclusion

If you let fear by your guide, you'll write the tests you need to write. We're writing tests because we're afraid that if we don't, new functionality won't work as expected, that we'll break stuff that used to work, or that we won't be able to cope with changing business requirements. Keeping these fears in mind will lead us to write tests when we're writing complicated new features, when we're finding that our old code breaks often, and when we suspect that our code will need to change.

### Notes:

1. I think this is partially because many of us in the android community don't have a firm grasp of the meaning of the phrase "business logic." People often give hand-wavy definitions of business logic during their presentations. (I've been guilty of giving such definitions myself.) Sometimes I'll even hear someone give an example of business logic and I'll think to myself, "That's not really business logic." (I thought this when I heard Jake Wharton's example of business logic in [Fragmented Episode 7 on testing](fragmentedpodcast.com/episodes/7/).) Another reason I think this platitude is unhelpful is that business logic, on whatever definition you fancy, is often mixed in with all other types of code in Android applications. This makes its hard to tease out the subset of the Android code that is properly called "business logic."

1. *TDD By Example*, Kent Beck, 194. On this same page, Beck also reluctantly gives us a list of things to test: conditionals, loops, operations, and polymorphism.

1. I'd love it if there was a tool that looked through my jira bug tickets, found the associated commits for addressing those tickets, and told me the classes and packages that needed to be changed to fix those bugs. I'd focus my efforts on writing tests for these buggy classes.

1. Michael Feathers talks about these conservative refactoring techniques in *Working Effectively with Legacy Code*.
