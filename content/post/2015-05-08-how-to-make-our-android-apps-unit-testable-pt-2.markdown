---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-05-08T11:46:13Z
slug: how-to-make-our-android-apps-unit-testable-pt-2
title: How to Make Our Android Apps Unit Testable (Pt. 2)
url: /2015/05/08/how-to-make-our-android-apps-unit-testable-pt-2/
wordpress_id: 321
---

In [my last post](http://philosophicalhacker.com/2015/05/01/how-to-make-our-android-apps-unit-testable-pt-1/), I introduced the “The Square Way” of structuring our android code. I said that The Square Way is a generalization of the approach that Square used to make the logic within their `Fragment`s unit testable. I also showed how The Square Way would have us rewrite the `SessionCalendarService` within Google’s IOSched app so that we could unit test the business logic within it. As we’ll see in this post, The Square Way also makes it easier/possible for us to unit test UI app component business logic.

<!--more-->


# This Article has “Dependencies”


Applying The Square Way to UI app components classes like `Activity`s and `Fragment`s is a little more complicated than its corresponding application to non-ui components. The source of this additional complication relates to the importance of structuring our code so that we can alter pre-act-state and verify post-act-state for a unit test. If those terms sound hazy or completely unfamiliar, read [this post](http://philosophicalhacker.com/2015/04/17/why-android-unit-testing-is-so-hard-pt-1/) before continuing. While you’re at it, make sure you understand what the `SessionDetailActivity` does. To see how The Square Way would be applied to UI app component classes, we are going to apply it to rewrite the `SessionDetailActivity` so that we could unit test the business logic within its `onStop()` method.

Understanding how The Square Way is applied to UI app component classes will be easier if you have an understanding of MVP. However, since Square does a decent job of introducing this pattern in [their post about fragments](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html), I won’t rehearse that introduction here. If you find yourself confused about how the View fits within MVP, read [my post](http://philosophicalhacker.com/2015/04/05/dont-call-it-mvp/) that helps clarify the distinction between an Android View and a MVP View. I actually prefer to call the object that everyone calls a “View” a “ViewTranslator” instead because it makes clearer the distinction between an Android View and a “View” within MVP. Going forward, I will use “ViewTranslator” instead of “View” to refer to the object the Presenter uses to update the content on the app’s screen.


# The Square Way for UI App Component Classes


Although applying The Square Way to UI app components classes can be more complicated, the basic strategy is the same: remove all business logic from app component classes (e.g., `Activity`s, `Fragment`s, `Service`s) and place that logic into what I have been calling “business objects,” POJO objects whose dependencies are injected, android-specific implementations of android-agnostic interfaces.

Here’s what `onStop()` looks like currently:

https://gist.github.com/kmdupr33/4c90e155dcaf6c4e0147

One problem with this code, as I’ve mentioned before, is that the code that launches the `SessionCalendarService` does not belong to a method on an dependency that’s been injected into the `SessionDetailActivity`. Following The Square Way fixes this problem. The first step for restructuring this code to follow The Square Way is to move the business logic from the `SessionDetailActivity` to a business object. The folks at Square have a name for a business object that contains the business logic that used to live in an `Activity` (or `Fragment`, etc.): they call it a “Presenter.”

The Presenter is responsible for, among other things, updating the View with data from the Model. In order to make the Presenter unit-testable, this means that the Model and View must both be dependencies that are injected into the Presenter. These three objects together make up the objects of the MVP architectural pattern.

Here’s what the equivalent of `onStop()` would look like within the `SessionDetailPresenter`:

https://gist.github.com/kmdupr33/5e06819aec1694453ff3

The key thing to note here is that the `SessionDetailPresenter`’s dependencies are passed into its constructor. Because these dependencies are injected, we now have a way of verifying the post-act-state of a unit test against `SessionDetailPresenter`’s `onViewTranslatorStopped()` method:

https://gist.github.com/kmdupr33/c2edd738031bb9314268

Although we now have a way of verifying post-act-state for our test, this is not enough. This test, as it’s written, will fail. To see why, let’s take a second look at `onViewTranslatorStopped()`:

https://gist.github.com/kmdupr33/bee17bc98248e662f748

The code within onViewTranslatorStopped() is wrapped in an if-statement. It only executes if the starred button state is different from the state in which it was initialized. Recall that `mInitStarred` is initialized in a Loader callback. IOSched checks the database for whether the session has been added to the user’s calendar and uses information to update the UI appropriately once the user returns to the `SessionDetailActivity`. In the above unit test, `mInitStarred` will have a default value of false and `mStarred` will also have a default value of false, so the code within the if-statement will never execute.

Even if we could make the code within that if-statement execute, however, we still wouldn’t have everything we needed for a unit test. The code that launches the `SessionCalendarService` lives within another if-statement that ensures that it only executes if `System.currentTimeMillis()` is less than `mSessionStart`. Since we have no way of altering the value of `mSessionStart`, there’s no guarantee that the `SessionCalendarService` launching code will ever be run.

Both of these problems are particular examples of a general problem I pointed out with android unit testing: we often lack sufficient control over the pre-act-state of our test. However, because we’ve injected a `SessionRepositoryManager` into the `SessionDetailPresenter`, we can determine the values of `mSessionStart` and `mInitStarred`. `SessionRepositoryManager` is an Android-agnostic interface¹:

https://gist.github.com/kmdupr33/310eee93627547b34c22

However, when we create the `SessionDetailPresenter`, we inject an android-specific implementation of the `SessionRepositoryManager` that wraps a `LoaderManager`:

https://gist.github.com/kmdupr33/f22e6ee78bf4c40901a5

Because `SessionRepositoryManager` is just an interface, we can easily define a MockRepositoryManager to facilitate unit testing:

https://gist.github.com/kmdupr33/54d1b6a42139dcae8c2e

Notice that we can specify which values we’d like the `MockSessionRepositoryManager` to return when there’s a call to `initRepository()` by passing in a `Session` object into its constructor. Values like `mSessionStart` within the `SessionDetailPresenter` will be initialized with the `startTimeStamp` instance var on the `Session` model object. Now that we have control over these values, we almost have what we need to complete the arrange-step of a unit test for `onViewTranslatorStopped()`:

https://gist.github.com/kmdupr33/472d6cd32f935475773d

I say “almost” above because there’s still one part of `onViewTranslatorStopped()` that the above test code doesn’t cover. At the bottom of `onViewTranslatorStopped()` there’s a block of code that will run only if `mStarred` is true. This code launches a service that will remind will remind the user attend and/or rate the session they’ve added to their calendar:

https://gist.github.com/kmdupr33/5e06819aec1694453ff3

To make this code run, we need to make sure that `mStarred` is true. We can do this by calling the `SessionDetailPresenter`’s onSessionStarred() method, a method that’s called by the `SessionDetailViewTranslator` (or, if you like confusing names, you would just call this the “SessionDetailView”) when the user taps the star button:

https://gist.github.com/kmdupr33/144b53d71871e18e4c3e

With all of these pieces in place, we finally have everything we need to write a unit test against `onViewTranslatorStopped()`.


# Conclusion


If you felt like we had to do too much work in the arrange-step of this unit test, you’re probably right. Ultimately, I think that the `SessionDetailActivity`, a class that’s over 1000 lines long, does too much. Because of this, writing unit tests against it is more difficult than it has to be. Since the purpose of this post was just to show the heart of The Square Way, I didn’t discuss further techniques that could be used to facilitate unit testing.²

The Square Way is a significant departure from what I have called the “standard way” of building android applications. We should consider the disadvantages of following it. To that end, the next posts will be a presentation of the potential problems that may arise with The Square Way to developing apps, along with some potential solutions to those problems. The final post of this series, will point out some other advantages of The Square Way, advantages that are broader than the extent to which The Square Way enhances an app’s unit testability.


## Notes:


1. Technically this interface isn’t android agnostic because its main method takes a Bundle as an argument. I suspect that this won’t pose a problem. A Bundle is trivial; it’s not something that we’d ever want to test. Mocking it, moreover, shouldn't be difficult.
2. At Droidcon Montreal, Richa Khandelwal over at Coursera suggested [a cleaner, more testable architecture](https://speakerdeck.com/richk/clean-android-architecture) that would probably make it even easier to write unit tests.
