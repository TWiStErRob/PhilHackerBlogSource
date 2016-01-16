---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-05-29T11:23:14Z
slug: making-the-most-of-android-studios-unit-testing-support
title: An Introduction to Unit Testing on Android
url: /2015/05/29/making-the-most-of-android-studios-unit-testing-support/
wordpress_id: 367
---

Yesterday at IO Extended Orlando, I gave a talk on testing. What follows is a written version of the presentation I gave.

[![IO Testing Talk-01](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-01.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-01.png)


Android 1.2 introduced unit testing support. Now, we can run junit tests on the jvm while we're developing our apps. During my talk, we'll discuss the following questions:







  * Why should anyone care about this new feature?


  * What the heck is unit testing anyways?


Briefly, I'll also mention some of the challenges of writing unit tests for Android.

<!--more-->

[![IO Testing Talk-02](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-02.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-02.png)

Before we get into those questions, let me introduce myself. I'm Matt Dupree. I'm a wannabe philosophy professor turned wannabe tech entrepreneur, which is just a fancy way of saying that I studied philosophy as an undergrad and graduate student, decided I didn't want to be poor, and become a software developer about 2 years ago. That's a bit of an oversimplification, but you're not here to hear about my career choices. In case you care to know more, you can check out [this post](http://philosophicalhacker.com/2014/04/21/why-im-glad-my-dream-job-didnt-work-out/).

[![IO Testing Talk-03](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-03.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-03.png)

Many of us don't really do a lot of testing for Android. This is unfortunate because there are plenty of cases where writing tests can be very useful. Writing unit tests, moreover, can be particularly useful for getting targeted info on whether a certain class is working correctly. Here's a little experiment designed to show the value of writing unit tests on Android.

[![IO Testing Talk-04](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-04.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-04.png)

Let's say we were working on Google's IO Sched app from last year. The above screenshot is a shot of the `SessionDetailActivity`. This is where the user can view the details about a session and add that session to their IO schedule. The business logic for what happens when the user presses the plus button on the screen is as follows:




  * If the user taps the plus button before the IO session has happened, the session is added to the user's schedule and a notification is set to remind the user that the IO session is coming up.


  * If the user taps the plus button after the IO session has happened, when the user returns to the screen, they will be presented with a card that asks them for feedback about the session.


  * If the session has already been added to the user's schedule, when they enter the session detail screen, they should see a "check" button instead of a "plus" button, and pressing this button should perform the reverse of one of the two above operations, depending on whether the check button is pressed before or after the IO session.


You could test all of this business logic manually, but its must faster to write unit tests that verify that the `SessionDetailActivity` does all of this correctly. Unit tests that verify this behavior will complete in seconds. Manual testing, on the other hand, takes over a minute to complete:



Now, at this point, some of you make the following argument:


<blockquote>Because unit tests don't actually tell you anything about the overall behavior of the system, there will be bugs that will slip past a unit test. Thus, we should prefer manual testing (or perhaps automated functional UI tests) over unit testing.</blockquote>


This is a tricky argument, but fortunately, I have a lot of experience with those.

[![IO Testing Talk-05](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-05.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-05.png)Here's my response to the above argument: Even if there are bugs that can slip past unit tests, we are better off, all other things being equal, if we have unit tests than if we didn't have unit tests. To see this, let's look at the three possible outcomes for unit testing the functionality I mentioned above.

In the first outcome (on the far left), our unit tests pass and our functional tests pass. Everything works great, so we can celebrate with [a game of slimeball](http://slime.clay.io/game/slime) or something.

In the second outcome, our unit tests fail. In that situation, we know exactly where the problem is, which makes debugging much easier.

In the final outcome (on the far right), our unit tests pass, but our functional tests fail. The above argument against unit testing focuses on this scenario, but even if we find ourselves in this scenario, we're better off having unit tests because we have a good head start on where the problem lies: because our unit test passed, we know that the problem is not within the `SessionDetailActivity`.

So, in any possible scenario where we've run our unit and functional tests, we're better off, all other things being equal, having our unit tests rather than not having them. Astute readers will point out that the "all other things being equal" clause of my claim is almost never satisfied when working on a project because of the time investment we make into writing unit tests. That's true. Technically, I need to make a stronger claim about the general value of unit tests in order to completely convince you that they are worth the time investment (especially on Android), but I think I've said enough to show that its worth exploring whether unit tests would be useful for the project that you're working on.

[![IO Testing Talk-06](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-06.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-06.png)

We just talked a lot about unit tests, but we never did ask a simple question: what exactly is a unit test? Some of us might have a clear definition of a unit test in our mind, but until recently, I was not one of those people. I actually think that there's a good amount of confusion over what unit tests are, especially among android developers. The confusion on the definition of a unit test is, I think, a result of us being pretty vague when we use the term. We can see this if we look at two unit test cases mentioned on developer.android.com that are both called "unit tests," but in fact have very different properties. The first snippet is found on [the android page about unit testing activities](http://developer.android.com/training/activity-testing/activity-unit-testing.html):

This second snippet is found on the android page entitled "[Building Effective Unit Tests](http://developer.android.com/training/testing/unit-testing/local-unit-tests.html)":

In spite of their differences, these two snippets are both called "unit tests." I don't mean to quibble over definitions, but our sloppiness with the word "unit test" is, I think, unhelpful. Here's a more precise definition:


>A unit test is a test that can verify that __all of the code__ in exactly one __non-trivial__ class is working correctly. If this test fails, we know that the problem is located in that class being tested.


On this definition, tests like `MyActivityUnitTestCase` in the first snippet would not count as a unit tests because, as [I've pointed out elsewhere](http://philosophicalhacker.com/2015/04/17/why-android-unit-testing-is-so-hard-pt-1/), when testing activities, we often lack enough control over the pre-act state required to exercise different branches of the methods we want to test. Moreover, [activities often contain dependencies that aren't injected](http://philosophicalhacker.com/2015/04/24/why-android-unit-testing-is-so-hard-pt-2/), so if a test fails, it may fail because of an error in the code of one of the non-mocked dependencies within the activity being tested.

I just talked about dependencies that have been "injected." "Dependency injection" and its related phrases happens to be another term that has some sloppy usage. Here's my understanding of dependency injection:

[![IO Testing Talk-07](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-07.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-07.png)

This definition is a shortened version of the definition that Martin Fowler, the guy who coined the term "dependency injection," offers in his [article on dependency injection](http://martinfowler.com/articles/injection.html).

If we accept my definition of "unit testing" and my interpretation of Martin Fowler's definition of "dependency injection", then we can say that "unit testing" Android component classes (e.g., Activities, Services, Fragments, etc.) turns out to be extremely difficult largely because there's no way to have true dependency injection for our app component class, classes that typically hold much of the business logic that we want to test.

[![IO Testing Talk-08](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-08.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/io-testing-talk-08.png)

I've written extensively about this topic in my series entitled "[Against Android Unit Tests.](http://philosophicalhacker.com/2015/04/10/against-android-unit-tests/)" I've also made some suggestions on how we might write unit tests for android [here](http://www.philosophicalhacker.com/2015/05/01/how-to-make-our-android-apps-unit-testable-pt-1/).
