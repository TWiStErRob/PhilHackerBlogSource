---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-05-22T12:29:28Z
slug: what-ive-learned-from-trying-to-make-an-android-app-unit-testable
title: What I've Learned From Trying to Make An Android App Unit Testable
url: /2015/05/22/what-ive-learned-from-trying-to-make-an-android-app-unit-testable/
wordpress_id: 349
---

For the past few posts, I've introduced and showed how we would apply The Square Way of building Android applications. The primary motivation for The Square Way was to increase the unit testability of our applications. As I stated in the [introduction to this series](http://philosophicalhacker.com/2015/04/10/against-android-unit-tests/), most tests in Android are slow, instrumentation tests and/or tests that rely on third-party frameworks like Roboletric. The Square Way was supposed to help us write fast unit tests that didn't rely on any third-party frameworks.

Now that we've discussed [why unit testing in Android is so difficult](http://philosophicalhacker.com/2015/04/17/why-android-unit-testing-is-so-hard-pt-1/) and seen how [The Square Way resolves those difficulties](http://philosophicalhacker.com/2015/05/01/how-to-make-our-android-apps-unit-testable-pt-1/), we are finally in a position to assess The Square Way as a whole as a method of creating unit testable Android applications. That assessment is the subject of this article. My assessment consists of the following three claims:




  1. Removing all compile time dependencies on the Android SDK is not necessary for us write fast unit tests for Android. (Its also not really a practical thing to try to do anyway.)


  2. Provided that we redefine The Square Way so that it does not require us to remove compile-time dependencies on the Android SDK, the only problem that arises when trying to apply The Square Way is simply writing all of boilerplate code. Fortunately, much of this boilerplate can be written for us by Android Studio.


  3. Dependency Injection is really the main "active ingredient" that allows The Square Way enhance the unit testability of our applications.


<!--more-->


## Removing Compile-Time Dependency on the Android SDK is neither practical nor necessary


The idea that started off this entire series was to make Android apps more unit testable by making our app stack look like this:

[![AndroidStack-02](http://www.philosophicalhacker.com/wp-content/uploads/2015/04/androidstack-02.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/04/androidstack-02.png)

As we'll see later in this post, this idea is fundamentally misguided. Making our applications unit testable has more to do with making proper use of dependency injection than it does with decoupling from the Android SDK. The primary reason for this is that an object's Android dependencies can be mocked out using something like Mockito, and in cases where Mocktio alone fails to give us clean control over the pre-act-state of test, we can replace those android dependencies with interfaces that have mock implementations. This is what we did with the `SessionRepositoryManager` I discussed in [my post on how to make UI app component classes unit testable](http://philosophicalhacker.com/2015/05/08/how-to-make-our-android-apps-unit-testable-pt-2/):

{{< gist kmdupr33 54d1b6a42139dcae8c2e >}}

In addition to being unnecessary, completely decoupling from the Android SDK is impractical. The problems that arise when you attempt to this are, in retrospect, obvious and uninteresting, so I will only briefly state them here. Attempting to remove all compile-time dependencies on the Android SDK from your application will likely result in:




  1. An unacceptably dramatic increase in the number of methods and classes your application has to define.


  2. Interfaces that are near copies of already existing Android interfaces


  3. Constructors bloated with dependencies that would not otherwise needed to be injected into an object.


In spite of this flawed aspect of The Square Way as I've been defining up until now, much of what I've said in the past few posts is still true and useful. Unit testing in Android is hard because the SDK gives us app component classes whose dependencies are not injected. The Square Way, insofar as it has us delegate business logic to POJOs whose dependencies have been injected, will make it easier/possible to unit test Android applications. Since "The Square Way," minus its requirement to remove dependencies on the Android SDK, still provides a useful way of enhancing the Unit testability of our applications, I'd like to _redefine The Square Way so that it no longer includes this requirement_. In other words, if I ever refer to The Square Way after this point, I will be referring to a method of structuring our Android applications that does not require us to remove all dependencies on the Android SDK.


## Tedious Boilerplate is the Only Thing Stopping us From Unit Testable Android Apps


If we redefine The Square Way so that it does not require us to remove dependencies on the Android SDK, then there doesn't seem to be any serious disadvantages of adopting The Square Way. The POJO objects to which we are delegating business logic are referenced by app component classes, and because of this, they can have access to all of the callbacks and properties contained within those component classes. Therefore, simply moving business logic to POJO objects whose dependencies have been injected shouldn't preclude those objects from having the data they need to fulfill their responsibilities.

If this is true, then the only thing that prevents us from adopting The Square Way is having to write a bunch of boilerplate code. Fortunately, Android Studio provides us with a refactoring option that helps in making the transition to The Square Way: the `Extract Delegate` option. With this option, you can automatically move a class's methods and instance variables to a delegate class and have the original class call on this newly created delegate instead of relying on its own methods:

{{< youtube N0F7w4wEnQ8 >}}

This video demonstrates how to make use of the Extract Delegate option to do some of the refactoring necessary to make the SessionDetailActivity's onStop() method unit testable. I discuss why this kind of refactor is necessary [in an earlier post](http://philosophicalhacker.com/2015/05/08/how-to-make-our-android-apps-unit-testable-pt-2/). Obviously, this mechanical option isn't going to cover all cases, and you may need to rework some methods to separate out the business logic from the statements that update an Activity's view, but the option is definitely helpful.


## Dependency Injection is the Active Ingredient in The Square Way




##




{{< tweet 599232312492982273 >}}



Chris nailed it here. The Square Way is effective because it allows us make use of _true dependency injection_ for the classes the hold our business logic. I emphasize "true" in the previous sentence because "dependency injection," in the minds of many Android developers is synonymous with Dagger. Dagger, however, will not make it as easy to unit test our code.

This is because Dagger, as it turns out, is really a Service Locator library, and as such, it forces us to write modules that provide mock dependencies for the object that we want to unit test. In order to make use of these modules, moreover, we must make sure that the `ObjectGraph` constructed from these mock-providing modules is the same `ObjectGraph` used by the object we're trying to unit test.

This is not as simple as using true dependency injection to get dependencies into the object we want to test. Fully explaining why Dagger alone isn't enough to make unit testing Android apps simple could easily be a blog post on its own, so for now, all I can do is point out that, if we follow [Martin Fowler's definition of "dependency injection"](http://martinfowler.com/articles/injection.html#InversionOfControl) (and we should because he actually coined the term), Dagger is actually a Service Locator library and Google's own testing blog has an article on [why Service Locators make unit testing difficult](http://misko.hevery.com/code-reviewers-guide/flaw-brittle-global-state-singletons/).


## Conclusion


I think the Square Way is the way to go if we want to make our apps unit testable. Of course, I'm open to other alternative proposals. I have not shown that all other ways of enhancing an app's testability are inferior to the Square Way.

Since this is the end of the series, I also wanted to say thanks to everyone for their support as I wrote these articles. I appreciate all of the feedback -- positive and otherwise, the retweets, and the general social media love. The positive response has helped me realize how sorely we need to think and talk about testing for Android, and because of this realization, I've decided to spend the foreseeable future discussing Android testing on this blog. I'll be posting new posts every Friday. I look forward to continuing the conversation.

---

Against Android Unit Tests:

 * [Introduction](http://www.philosophicalhacker.com/2015/04/10/against-android-unit-tests/)
 * Why Android Unit Testing is so Hard: [part 1](http://www.philosophicalhacker.com/2015/04/17/why-android-unit-testing-is-so-hard-pt-1/), [part 2](http://www.philosophicalhacker.com/2015/04/24/why-android-unit-testing-is-so-hard-pt-2/)
 * How to Make Our Android Apps Unit Testable: [part 1](http://www.philosophicalhacker.com/2015/05/01/how-to-make-our-android-apps-unit-testable-pt-1/), [part 2](http://www.philosophicalhacker.com/2015/05/08/how-to-make-our-android-apps-unit-testable-pt-2/)
 * [Quick Summary](http://www.philosophicalhacker.com/2015/05/09/android-unit-testing-guides/)
 * [Conclusion](http://www.philosophicalhacker.com/2015/05/22/what-ive-learned-from-trying-to-make-an-android-app-unit-testable/)
 * [Followup: Summary](http://www.philosophicalhacker.com/2015/05/31/towards-a-unit-testable-fork-of-googles-iosched-app/)
 * [Followup: Unit Testing Dynamically Constructed Views](http://www.philosophicalhacker.com/2015/06/06/unit-testing-dynamically-constructed-views/)
 * [Followup: Testing in Android Studio 1.2](http://www.philosophicalhacker.com/2015/05/29/making-the-most-of-android-studios-unit-testing-support/)

---
