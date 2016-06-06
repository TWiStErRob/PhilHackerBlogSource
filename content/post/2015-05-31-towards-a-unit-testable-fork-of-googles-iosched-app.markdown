---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-05-31T20:11:16Z
slug: towards-a-unit-testable-fork-of-googles-iosched-app
title: Towards A Unit Testable Fork of Google's IOSched App
url: /2015/05/31/towards-a-unit-testable-fork-of-googles-iosched-app/
wordpress_id: 391
---

In my recent [Against Android Unit Tests](http://www.philosophicalhacker.com/2015/04/10/against-android-unit-tests/) series, I discussed the difficulties of unit testing android applications and proposed a different way of building applications that would enhance their unit testability. My proposal in that series was really largely a rough sketch of what it would take to make parts of Google's IOSched app unit testable.

More recently, I've started to fill in the details of that proposal by forking the IOSched repo and refactoring it to make it unit testable. In the next few posts, I'll be discussing some of the challenges that arose when attempting to make the `SessionDetailActivity` unit testable within the IOSched app. In this post, I want to provide a broad overview of the challenges I'll be discussing.

<!--more-->


## Unit Testing Dynamically Constructed Views


Some of the views within the `SessionDetailActivity` are built dynamically. The tags that appear below the session's description are a good example of this:

[![Screenshot (06:46AM, Apr 17, 2015)](http://www.philosophicalhacker.com/wp-content/uploads/2015/04/screenshot-0646am-apr-17-2015-169x300.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/04/screenshot-0646am-apr-17-2015.png)

It wasn't immediately obvious to me how to leverage the "MVP" pattern to maintain the class's unit testability in the face of dynamically built views. I'll discuss how I solved this problem in [the first post of this series](http://www.philosophicalhacker.com/2015/06/06/unit-testing-dynamically-constructed-views/).


## Circular Dependencies between ViewTranslators and Presenters


"ViewTranslator" is just the name that I prefer for what is traditionally called the "View" within the MVP pattern. In [Square's description of the MVP pattern](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html), we can see that there's a circular dependency between the ViewTranslator and Presenter. For reasons that will be clear after I've discussed my solution to the problem of creating unit testable dynamically constructed views, this circular dependency is not ideal. In the second post, I'll discuss how I resolved this circular dependency.


## Static Methods


As [Google's testing blog points out](http://googletesting.blogspot.com/2008/12/static-methods-are-death-to-testability.html), static methods spell trouble for your app's unit testability. Unfortunately, there are several static methods within `SessionDetailActivity` that needed to remove to make unit testing possible. In the third post, I discuss how I removed those static methods.


## Towards a Unit Testable Fork of Google's IOSched App


My hope is to eventually have [a fork of Google's IOSched app](https://github.com/kmdupr33/iosched) that allows us to unit test all of its business logic. Making a non-trivial app like IOSched unit testable will tell us a lot about what it really takes to unit test Android apps. We might find out that unit testing Android apps is just too impractical. Either way, I look forward to exploring how we might pull this off.

You can check out my progress towards this goal by looking at the aforementioned fork of the IOSched repo. I'll try to make sure the master branch always has something that is semi-polished in it. I make no guarantees about other branches. I'd love to work with others toward this goal. If people are interested in contributing to the repo, I'll put together some code standards and guidelines for contributing.

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
