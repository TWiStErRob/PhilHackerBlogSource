---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-05-01T11:30:24Z
slug: how-to-make-our-android-apps-unit-testable-pt-1
title: How to Make Our Android Apps Unit Testable (Pt. 1)
url: /2015/05/01/how-to-make-our-android-apps-unit-testable-pt-1/
wordpress_id: 307
---

Unit testing Android apps is hard, and sometimes it can be impossible. For [the past two posts](http://philosophicalhacker.com/2015/04/17/why-android-unit-testing-is-so-hard-pt-1/), I’ve been explaining why android unit testing is so difficult. The main conclusion from [the last post](http://philosophicalhacker.com/2015/04/24/why-android-unit-testing-is-so-hard-pt-2/) is that it is difficult/impossible to unit test our Android applications because of the way we are encouraged to structure them. Google seems to want us to put our business logic in app component classes (e.g., `Activity`s, `Fragment`s, `Service`s, etc.). This approach to writing Android applications is what I have been calling the “standard way.”

In this post, I outline an alternative approach to structuring Android applications that will make it easier to unit test them. As I pointed out in [the introduction to this series](http://philosophicalhacker.com/2015/04/10/against-android-unit-tests/), the approach that I suggest is a generalization of the approach that Square uses to [remove Fragments from their applications](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html). Since this approach is inspired by the folks at Square, I will call it “the square way.”

The heart of the square way way is this: remove all business logic from app component classes (e.g., `Activity`s, `Fragment`s, `Service`s) and place that logic into “business objects,” POJO objects whose dependencies are injected, android-specific implementations of android-agnostic interfaces. If we follow the square way of developing our apps, we will be in a better position to unit test them. In this post, I explain how the square way would have us refactor non-UI app components like the `SessionCalendarService` I’ve been discussing for the past few posts.

<!--more-->


# The Square Way For Non-UI App Components


Following the square way for non-ui app components like `Service`s, Content-Providers, and BroadcastReceivers is relatively straightforward. Again, the basic approach is remove the business logic within these classes and place that logic into a business object.

Since “business logic” is one of those tricky phrases that seems to have multiple meanings, let clarify what I mean. When I say “business logic,” I’m using it in the same way that Wikipedia does: I’m referring to the “part of the program that encodes the real-world business rules that determine how data can be created, displayed, stored, and changed.” Now, that we’re clear about the meaning of “business logic,” we can see start to see what the square way looks like in action.

Let’s look at how the square way would have us write the `SessionCalendarService` that I introduced in the last post. Right now, the `SessionCalendarService` looks like this:

{{< gist kmdupr33 f56c957a4fd57eefb064 >}}

As you can see, the `SessionCalendarService` calls on helper methods that it defines later on. Once we tally up these helper methods and the class’ field declarations, the `Service` is 400+ lines long. Its certainly not a trivial task to get a handle on what’s happening in the class, and, as we already saw last post, there’s no way to unit test `SessionCalendarService`.
Let’s see how the square way would have us write this. Again, the square way requires us to move the business logic out of android classes and move them into a business object. The business object for the `SessionCalendarService` is a `SessionCalendarUpdater`, and this is what it looks like:

{{< gist kmdupr33 8dd6bc35033415c7f383 >}}

I want to highlight a few things about this gist. First, notice that you don’t see the new keyword at all. Because a business object’s dependencies are injected, it never uses the new keyword. This is key for keeping the class unit testable. Second, you’ll notice that the class does not explicitly depend on the Android SDK. Because a business object’s dependencies are android-specific implementations of android-agnostic interfaces, it does not need to depend on the Android SDK.

How do these dependencies get into the `SessionCalendarUpdater`? They are injected by the `SessionCalendarService`:

{{< gist kmdupr33 bfc68c1e4cc60172bc86 >}}

Notice that this revised `SessionCalendarService` is full of new keywords. The presence of new keywords, however, in this class is not a problem. We can see this if we make a second observation about this gist: it contains no business logic. Because of this, there isn’t really a need to unit test this class. As long as we’re sure that we’ve called updateCalendar() on the `SessionCalendarUpdater`, the only errors that are likely to happen in this class are compile-time errors. There’s no need to write a test to check for conditions that the compiler already guards against.

For the reasons that I mentioned in my last post two posts, breaking up our `Service` like this will allow us to more easily unit test our business logic. A test for the `SessionCalendarUpdater` might look like this:

{{< gist kmdupr33 e03771c0a6582741ee7e >}}


# Conclusion


In addition to being unit testable, I think that this code is also easier to read and maintain. To be sure, there’s probably more that could be done to make it better, but I wanted to keep it as close to the old implementation as possible while also making the code unit testable. In [the next post](http://www.philosophicalhacker.com/2015/05/08/how-to-make-our-android-apps-unit-testable-pt-2/), I’ll explore what it looks like to apply the square way of structuring UI app component classes like `Fragment`s and `Activity`s.

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
