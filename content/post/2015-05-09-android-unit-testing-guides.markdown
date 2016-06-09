---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-05-09T13:20:54Z
slug: android-unit-testing-guides
title: Android Unit Testing Guides
url: /2015/05/09/android-unit-testing-guides/
wordpress_id: 328
tags:
- android
- testing
---

In [my last post](http://philosophicalhacker.com/2015/05/08/how-to-make-our-android-apps-unit-testable-pt-2/), I showed how we can apply The Square Way to UI app component classes. More specifically I showed how The Square Way would have us rewrite the `SessionDetailActivity` so that we could unit test its `onStop()` method. At the end of my last post, I said that I'd be spending this and the next post doing an overall assessment of The Square Way.

I actually won't be doing that this post. I'll be postponing the overall assessment of The Square Way until the next few posts. Instead, what I want to do in this post is simply present a few unit-testability guides. These cheatsheets summarize much of what's been covered in the past few posts and provide you with simplified steps to follow if you are interested in enhancing your application's unit-testability via The Square Way.

<!--more-->

The first guide helps you determine if a class is unit testable in general. It mostly summarizes [Why Android Unit Testing Is So Hard (Pt. 1)](http://philosophicalhacker.com/2015/04/17/why-android-unit-testing-is-so-hard-pt-1/). The ideas expressed by this guide, moreover, form the basis for my argument that the standard way of building android applications makes it difficult/impossible to write unit tests for certain classes, an argument that I articulate in [Why Android Unit Testing is So Hard (Pt. 2)](http://philosophicalhacker.com/2015/04/24/why-android-unit-testing-is-so-hard-pt-2/).

[![AgainstAndroidUnitTestsSeries_UnitTestabilityCheatSheet](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/againstandroidunittestsseries_unittestabilitycheatsheet4.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/againstandroidunittestsseries_unittestabilitycheatsheet4.png)

The second guide gives you the steps to follow if you're interested in following The Square Way of structuring your applications to enhance its unit testability. This guide summarizes How to Make Our Android Appps Unit Testable [part 1](http://philosophicalhacker.com/2015/05/01/how-to-make-our-android-apps-unit-testable-pt-1/) and [part 2](http://philosophicalhacker.com/2015/05/08/how-to-make-our-android-apps-unit-testable-pt-2/). Disclaimer: Just because I've tried to present the The Square Way in a pretty infographic, doesn't mean that I think that its the best way increase an app's unit testability. There's still a lot to say about the disadvantages of The Square Way. Again, I'll talk about those disadvantages in my next post.

[![AgainstAndroidUnitTestsSeries_SquareWayRefactorCheatSheet](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/againstandroidunittestsseries_squarewayrefactorcheatsheet.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/05/againstandroidunittestsseries_squarewayrefactorcheatsheet.png)

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
