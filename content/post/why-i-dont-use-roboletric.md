+++
share = true
comments = true
title = "Why I Don't use Robolectric"
tags = [
  "android",
  "testing",
]
image = ""
draft = false
slug = "why-i-dont-use-roboletric"
menu = ""
author = ""
date = "2017-01-06T22:01:04-05:00"
+++

The more that I learn about testing, the more suspicious of Robolectric I get. I'm honestly starting to think that many of the heros of unit testing (e.g., Kent Beck, Michael Feathers, Steve Freeman, and Nat Pryce) would be pretty suspicious of Robolectric. Here are my concerns:

1. Robolectric is *largely*<sup>1</sup> a set of mocks for a set of types we don't own. Mocking types we don't own is not recommended by the folks who invented mocks.

1. Robolectric turns TDD on its head by allowing us to ignore something our standard unit tests are trying to tell us: our logic is tightly coupled and muddled with Android-SDK-related implementation details. That's why we have such a hard time writing standard unit tests. Instead of listening to the design feedback of standard unit tests, Robolectric asks us to use a giant mock instead.

These concerns lead me to believe that Robolectric should be used sparingly, if at all. Let's look at the concerns in detail. Along the way, I'll be pulling in quotes from Feathers, Freeman, and Pryce to bolster my claim that the folks who are largely responsible for our practices of unit testing today would be suspicious of Robolectric.

### Mocking Types We Don't Own

I've already talked about how mocking types we don't own can be a problem in [my post on how we misuse mocks for Android development](http://www.philosophicalhacker.com/post/how-we-misuse-mocks-for-android-tests/), so I won't repeat those points in detail here. The gist of this worry is twofold:

1. According to Steve Freeman and Nat Pryce, the folks who really popularized mocks, mocking types we don't own partially defeats the purpose of mocking and testing because the process of testing is supposed to tell us something about the design of the code we're mocking. Because we don't own the types, we can't actually do anything with the design feedback our tests are giving us.

1. Secondly, and perhaps more importantly, mocking types we don't own forces us to ensure that the mocked versions of the types our tests depend on actually match the behavior of their un-mocked counterparts. This is a concern that's shared both by Freeman and Pryce and by Jake Wharton.

### Robolectric turns TDD on its head

Obviously, Android developers aren't the first ones who have tried testing code that relies on a framework. Typically, when folks outside the Android community are test driving code that depends on a framework, TDD encourages them to add a layer of abstraction between the framework and their code. This keeps the code loosely coupled and highly cohesive. The framework code stays at a layer below the application code.

Here's Freeman and Pryce on this:

>...we grow our systems a slice of functionality at a time. As the code scales up...we use two principal heuristics to guide this structuring: Separation of Concerns...[and] Higher Levels of Abstraction...Applied consistently, these two forces will push the structure of an application towards something like Cockburn’s “ports and adapters” architecture [Cockburn08] , in which the code for the business domain is isolated from its dependencies on technical infrastructure, such as databases and user interfaces.<sup>2</sup>

Higher levels of abstraction make our code more understandable and maintainable, and in order to achieve this in our design, we need to make sure our objects are "Context Independent," which means that "each object has no build-in knowledge of the system in which it executes."<sup>3</sup> A few pages later in the next chapter, they go on to talk about how TDD specifically helps them drive towards this goal:

>...to construct an object for a unit test, we have to pass its dependencies to it, which means that we have to know what they are. This encourages context independence, since we have to be able to set up the target object’s environment before we can unit-test it—a unit test is just another context. We’ll notice that an object with implicit (or just too many) dependencies is painful to prepare for testing—and make a point of cleaning it up.<sup>4</sup>

Many of the difficulties we have as Android developers in testing (and otherwise) arise because our systems don't exhibit separation of concerns and higher levels of abstraction. Freeman and Pryce are saying that there's a direct link between these properties and testability, a link that Feathers echos in his book:

>one pervasive problem in legacy code bases is that there often aren’t any layers of abstraction; the most important code in the system often sits intermingled with low-level API calls. We’ve already seen how this can make testing difficult, but the problems go beyond testing. **Code is harder to understand when it is littered with wide interfaces containing dozens of unused methods.**<sup>5</sup>

The emphasis on the last sentence is mine. It's meant to highlight that Feathers and Freeman and Pryce are in agreement on the link between testability, abstraction, and understandable code.

So, outside the Android community, its widely recognized that writing tests without any layers of abstraction between our application code and a framework is often impossible, so TDD exerts a positive influence on us to create layers of abstraction and because of this, we wind up with cleaner code.

Hopefully, now we can start to see why Robolectric actually turns TDD on its head. Let's start by remembering something I noted at the outset of this post: unfortunately, most Android apps are written in a way that muddles and couples application code with Android-SDK-related implementation details. The natural direction TDD with pure unit tests is pushing us in is to **move the code we want to test OUT of Android framework classes like Activities, Fragments, and Services;** its pushing us in a cleaner direction of separating our application-specific logic from the Android SDK.<sup>6</sup>

Robolectric, on the other hand, allows us to test our apps while leaving our application code mixed in with the Android SDK. Robolectric does this by "defanging the Android SDK" by mocking types we don't own to make testing easier, but if we take traditional TDD seriously, **this is exactly backwards**.

We don't need to make testing easier by leaving our app code the same and changing the way we do testing. Instead, we need to make testing easier by listening to the tests and moving our application specific logic to a layer that's higher than the Android SDK.

### Conclusion

So, there you have it. Those are the biggest reasons why I don't use robolectric. If you've got some ideas on where robolectric may be appropriate, I'd love to hear them.

### Notes:

1. Jake Wharton has pointed out [here](https://www.reddit.com/r/androiddev/comments/5mimhe/why_i_dont_use_roboletric_philosophical_hacker/dc40feu/) and [here](fragmentedpodcast.com/episodes/7/) that some parts of Robolectric actually use real Android code, so I guess these parts wouldn't really count as mocks.

1. *Growing Object Oriented Software Guided by Tests*, Steve Freeman and Nat Pryce, 93-94.

1. Ibid., 99-100.

1. Ibid., 103-104.

1. *Working Effectively with Legacy Code*, Michael Feathers, 350-352. Emphasis mine.

1. To some extent, I've been hitting on this at various points. See [Against Android Unit Tests]({{<relref "2015-04-11-against-android-unit-tests.markdown">}}), [Why we shouldn't put logic in Activities]({{<relref "post/why-we-should-stop-putting-logic-in-activities.md">}}) and [Object Seams and MVP](post/object-seams-and-mvp-for-testability.md).
