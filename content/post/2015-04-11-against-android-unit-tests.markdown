---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-04-11T03:35:55Z
slug: against-android-unit-tests
title: Against Android Unit Tests
url: /2015/04/11/against-android-unit-tests/
wordpress_id: 277
---

**Edit: **Since I've written this, I've come to realize that making unit testable Android apps does not require us to remove compile-time dependencies on the Android SDK. I talk about this realization in [the post that concludes this series](http://philosophicalhacker.com/2015/05/22/what-ive-learned-from-trying-to-make-an-android-app-unit-testable/).



* * *



Even the best among us admit that they struggle with testing their Android apps. Jake Wharton has said explicitly that the Android platform has traditionally been very difficult to test.¹ [In the inaugural episode of their (excellent) podcast](http://fragmentedpodcast.com/episodes/1/), Don Felker and Kaushik Gopal have echoed similar sentiments. They also pointed out that [Google’s IOSched app](https://github.com/google/iosched), an app that supposedly demonstrates some of the best practices in Android development², doesn’t even have tests. IOSched’s lack of tests either a) calls into question Google’s belief that testing is an integral to effective Android development or b) suggests that Google's own Android devs recognize that testing Android applications is too difficult to be worth their time. Either way, if the best Android devs at Google and elsewhere are struggling to test their applications, then the rest of us are in deep trouble.

Over the years, developers have tried to develop methods for coping with the inherent difficulty in testing the Android platform. [Roboletric](http://robolectric.org/), a tool that allows you to run Android tests on a JVM, is one of those methods. More recently, in their [blog post/tirade against Fragments](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html), the folks at Square have proposed another method: they are moving the business logic of their applications into Presenters, pure java objects that have no Android dependencies. These Presenters, of course, are easily tested using standard Java tools.

I believe that the folks at Square are on to something. I think that their attempt to enhance the testability of their application by pulling UI-related business logic into pure java Presenters can be generalized. In other words, I think we can stop trying to do Android unit tests; we can stop writing tests that depend on the Android SDK. I think we can restructure our applications so that we can write pure Java unit tests for all of our application code, and I think its worth exploring whether this restructuring would both enhance testability and the overall robustness of Android applications.

I realize that this is a radical suggestion. I’m basically asking us to take a stack that looks like this:

****![AndroidStack-01](http://www.philosophicalhacker.com/wp-content/uploads/2015/04/androidstack-01.png)****

And make it look like this:

****[![AndroidStack-02](http://www.philosophicalhacker.com/wp-content/uploads/2015/04/androidstack-02.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/04/androidstack-02.png)****

Although this suggestion is radical and although it might seem like a long shot, I think its worth exploring since it will free developers from the unfortunate features of writing Android unit tests without forcing them to rely on third-party libraries that will invariably lag behind the newest updates to the Android ecosystem. Moreover, if Kent Beck is right in claiming that testable code is well structured code, we might also discover better ways of designing our applications.

In the next few posts, I’ll be exploring the viability of restructuring Android applications so that they are easily testable using standard java tools.

In the first two posts, I’ll say more about [why testing on Android is a pain](http://philosophicalhacker.com/2015/04/17/why-android-unit-testing-is-so-hard-pt-1/). I think that slow Android instrumentation tests is only one shallow reason that Android testing is difficult. I think that the lack of proper dependency injection for Activities and Fragments is a key cause of the difficulty of testing our applications, and I think that understanding this is necessary to designing a new application structure that will enhance testability.

In the third and fourth posts, I’ll discuss in detail [a general strategy for decoupling application code from the Android SDK](http://www.philosophicalhacker.com/2015/05/01/how-to-make-our-android-apps-unit-testable-pt-1/). Briefly, that general strategy is this: delegate all application specific behavior to POJO objects whose dependencies are Android-specific implementations of Android-agnostic interfaces.

In the fourth post, I’ll discuss some challenges with the general strategy I propose in the second post, and try to discuss possible solutions to those challenges. The main challenges that I see at this point are memory leaks and boiler plate code.

In the final post, I try to provide further incentive for enhancing the testability of our application by showing how the architecture I propose has some nice benefits aside from testability.[
](http://www.philosophicalhacker.com/wp-content/uploads/2015/04/androidstack-01.png)

Notes:



	
  1. He said this during [his 2013 talk on Dagger at DevOxx](https://www.parleys.com/tutorial/529bde2ce4b0e619540cc3ae)

	
  2. In [an android developers blog post](http://android-developers.blogspot.com/2014/07/google-io-2014-app-source-code-now.html), Bruno Oliveira presents the app as a model for us to follow.


