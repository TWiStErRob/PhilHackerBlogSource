---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-04-24T11:44:49Z
slug: why-android-unit-testing-is-so-hard-pt-2
title: Why Android Unit Testing Is So Hard (Pt. 2)
url: /2015/04/24/why-android-unit-testing-is-so-hard-pt-2/
wordpress_id: 301
---

**Edit:** In [the post that concludes this series](http://philosophicalhacker.com/2015/05/22/what-ive-learned-from-trying-to-make-an-android-app-unit-testable/), I point out that making unit testable Android apps does not require us to remove compile-time dependencies on the Android SDK and that attempting to do so is impractical anyway. Ignore anything in this post that suggests otherwise.



* * *





In my [last post](http://philosophicalhacker.com/2015/04/17/why-android-unit-testing-is-so-hard-pt-1/), I showed that even the (intelligent) engineers over at Google have written some Android code that is simply untestable. More specifically, I showed that there’s no way to unit test the `SessionDetailActivity`’s `onStop()` method. I also gave a specific diagnosis for the untestability of `onStop()`: we can’t complete the arrange- and assert-steps of a test against `onStop()` because there is no way to alter the pre-act-state, nor is there a way to access the post-act-state for a test of `onStop()`. I ended the last post by claiming that some properties of the Android SDK, along with the standard way we are encouraged to structure our android apps, encourage us to write code that is difficult/impossible to unit test and by promising that I’d elaborate more on that claim in this post.

Before I do that, let me say again that showing that the difficulty of testing Android applications is caused by the standard structure of android apps is important for the overarching goal of this series of articles. This series is an attempt to argue that we should consider restructuring our applications so that they do not explicitly depend on the Android SDK and its an attempt to present a robust architecture that will enhance the testability of Android applications. You can read the introduction to this series [here](http://philosophicalhacker.com/2015/04/10/against-android-unit-tests/). With that said, I can move on to trying to demonstrate the central claim of this post.

There’s a standard way of developing android applications. Sample code and open source code alike both place an app’s business logic within Android app component classes, namely, Activities, Services, and Fragments. Going forward, I’m going to refer to this practice as “the standard way.” Here’s the central claim of this post: As long as we follow the “standard way”, we’re going to write code that’s either difficult or impossible to unit test. In other words, the untestable code that I pointed out in my last article is not a fluke. The standard way prevents us from unit testing key pieces of our applications.

<!--more-->


# The Standard Way Makes (some) Unit Tests Impossible


To begin to see why the standard way leads to untestable app components, let’s briefly recall some of the points I made in my last post. Unit testing consists of three steps: arrange, act, and assert. In order to complete the arrange step of the process we need to be able to alter the pre-act-state of the code we’re testing, and accessing the post-act-state of our program is required to complete the assert-step of a test.

With those points in mind, we can see that dependency injection, in some cases, is really the only acceptable way to write code whose pre-act-state can be altered and whose post-act-state is accessible. Let’s look at a non-android example of this:

{{< gist kmdupr33 b0e31bfca58e8acb9465 >}}

Dependency injection is really the only way to unit test `doIntenseCalculation()`. `doIntenseCalculation()` doesn’t have a return value. Moreover, there’s no property on `MathNerd` that will allow us to determine the validity of our post-act-state. We could get the post-act-state in a test from the `mCalcCache` like this:

{{< gist kmdupr33 554cc7afe27cdc5e6426 >}}

If we did this, however, we would no longer be writing a unit test for `MathNerd`. We’d be writing an integration test that checks the behavior of a `MathNerd` and whatever class is responsible for updating the `CalcCache` with the results from doIntenseCalculationInBackground().

Dependency injection is really the only way that we can verify our post-act-state for a unit test. We inject mocks and verify that methods are called in the right circumstances:

{{< gist kmdupr33 528c6094c43a74f8c0be >}}

There are many instances in which unit testing an Android class requires the same thing: dependency injection. Here’s the problem: key android classes have dependencies that we cannot inject. The `SessionCalendarService` that’s launched by the `SessionDetailActivity` I talked about last time is an example of this:

{{< gist kmdupr33 02f61591f40f459ae40c >}}

The `SessionCalendarService` has a ContentResolver as a dependency. This dependency, however, is not one that we can inject, so there’s simply no way for us to write a unit test for onHandleIntent(). onHandleIntent() doesn’t have a return method and there’s no property on `SessionCalendarService` that would allow us to check the validity of our post-act-state. To verify our post-act-state, we could actually query the ContentProvider to see if the requested data has been inserted, but then we wouldn’t be writing a unit test for a `SessionCalendarService`. Instead, we’d be writing an integration test that tests both our `SessionCalendarService` and whatever ContentProvider handles session calendar data.

So, if you put business logic into an Android class whose dependencies cannot be injected, then you’re going to wind up with some code that’s impossible to unit test. There are several examples of dependencies like this: An `Activity` and `Fragment`’s `FragmentManager` is one example. An `Activity` and `Fragment`’s `LoaderManager` is another example. Thus, the standard way of building android applications, insofar as that way instructs us to put our business logic in app component classes, encourages us to write untestable code.


# The Standard Way Makes Unit Testing Difficult


In some cases, the standard way will only make it very difficult to unit test your code. If we return to the `onStop()` method within the `SessionDetailActivity` that we examined in the last article, we’ll see this:

{{< gist kmdupr33 4c90e155dcaf6c4e0147 >}}

There is no publically accessible property that will tell us whether the `SessionCalendarService` has been launched with the right parameters. Morover, `onStop()` is a protected method whose return value cannot be modified. Thus, the only way we can access post-act-state is to check the state of a dependency injected into `onStop()`.

At this point, you’ll notice that the code within `onStop()` that launches the `SessionCalendarService` doesn’t actually belong to a single object at all. In other words, there is no dependency to inject into `onStop()` that would allow us to access the post-act-state for a test that checks if the Service has been launched under the right conditions with the right arguments. To put the point a third way, in order to start making `onStop()` testable, it needs to look something like this:

{{< gist kmdupr33 84a4a4c92affc3910536 >}}

This isn’t the cleanest way of refactoring `onStop()`, but something like this is necessary if we want to make the code unit testable while adhering to the standard practice of keeping our business logic in Activities. Now, think for a second about how counter-intuitive this refactor is: Instead of simply calling startService(), a method that belongs to Context and, by extension, the `SessionDetailActivity`, we are using a `ServiceLauncher`, an object that depends on a Context to start the service. The SesionDetailActivity that is-a Context is using an object that has-a Context to launch the `SessionCalendarService`.

Unfortunately, even if we refactored `onStop()` to look like this, we still wouldn’t guarantee that we could write a unit test for it. The problem, of course, is that the `ServiceLauncher` is not injected, so there’s no way to inject a mock `ServiceLauncher` that we can use to verify that the correct method has been called for testing purposes.

Injecting a `ServiceLauncher`, moreover, is complicated by the fact that the `ServiceLauncher` itself depends on a Context, an object that is not Parcelable. Because of this, you can’t inject a `ServiceLauncher` simply by passing one into the intent that launches the `SessionDetailActivity`, so you’ll have to do something clever to inject the `ServiceLauncher` or you could just use a dependency injection library like Dagger.¹ This is a lot of work to make our code unit testable, and, as we’ll see in the next post, even if we use a library like Dagger for dependency injection, unit testing an Activity can still be painful.

In order to make `onStop()` unit testable, the standard way forces us to make a counter-intuitive refactor and then choose between creating clever workarounds to its painful intent-based dependency injection mechanism or using a third-party dependency injection library. By making it difficult and counter-intuitive to write testable code, the standard way makes it more likely that we won’t make our code testable. This is what I mean when I say that the standard way discourages us from writing testable code.


# Conclusion


Throughout this series, I’ve been saying that an examination of why Android unit testing is so difficult will help us see why its a good idea to restructure our applications so that they don’t explicitly depend on the Android SDK. Now we are finally at a point where we can start to see why it might be a good idea to get away from the Android SDK entirely.

I’ve just shown that placing our business logic in application components classes makes it difficult or impossible to unit test our applications. In the next post, I’ll suggest that we start delegating business logic to classes that make proper use of dependency injection. If we’re going to go through the trouble of defining these classes, however, we might as well make these class’s dependencies android-agnostic interfaces. This step in the process of enhancing our application’s testability is trivial compared to the first step, and completing this second step will enable us to write fast unit tests without having to rely on android-specific testing tools (e.g, Roboletric, Instrumented Tests).

**Notes**

1. Of course, you could pass the `ServiceLauncher` in as a Serializable. This is not a particularly robust solution since it only works if you don’t care about the performance hit that results from using Serializable.
