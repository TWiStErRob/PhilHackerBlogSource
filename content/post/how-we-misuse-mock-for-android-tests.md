+++
share = true
draft = false
title = "How we Misuse Mocks for Android Tests"
tags = [
  "android",
  "testing",
]
menu = ""
date = "2016-12-27T08:21:42-05:00"
slug = "how-we-misuse-mocks-for-android-tests"
image = "/images/tools.jpg"
comments = true
author = ""
+++

Mocks are a pretty standard tool in our android developer tool belt. The extent to which we should use this tool for unit testing is a complicated and controversial issue.<sup>1</sup> Within the Android community specifically, I think that a part of the controversy is due to confusion over the intended use of mocks. More specifically, some android developers seem intent on mocking types they don't own and on verifying all interactions of a target class with a collaborator.

It turns out that these two practices are not recommended by the folks who invented mocks because they have well-known have disadvantages. These disadvantages are precisely the ones that people seem to cite when they argue against mocks. There may be good arguments against mocks, but citing disadvantages of using them in a way that they aren't meant to be used is about as compelling as arguing that we shouldn't use hammers because they aren't good for fastening screws.

In this post, we'll look at two ways I've seen mocks misused. Hopefully, by pointing out the intended use of mocks, we'll find them more useful for unit testing android applications.

### Too many verifications

A common complaint about mocks is that they tie tests too closely with the implementation details of the target code. Since we want our tests to help us refactor those implementation details with confidence, this coupling ruins one of the major advantages of writing tests.

There are two things we can say in response to this complaint.

First, Steve Freeman and Nat Pryce, the folks who really pioneered the use of mocks in testing, are well aware that this can occur when using mocks. This is why they recommend that we "write few expectations" in our tests using mocks:

>A colleague, Romilly Cocking, when he first started working with us, was surprised by how few expectations we usually write in a unit test. Just like “everyone” has now learned to avoid too many assertions in a test, we try to avoid too many expectations. If we have more than a few, then either we’re trying to test too large a unit, or we’re locking down too many of the object’s interactions.<sup>2</sup>

Second, whether a particular object's interaction with a collaborator is an implementation detail depends on how we think about object-oriented programming and on the most compelling interpretation of OO I'm aware of, some interactions with collaborators aren't really implementation details. Freeman puts this nicely [here](http://higherorderlogic.com/2013/01/some-mocks/):

>Some of us think about objects in terms of Alan Kay’s emphasis on message passing, others don’t. In my world, I’m interested in the protocols of how objects communicate, not what’s inside them, so testing based on interactions is a natural fit.

I think a compelling example of an object interacting with a collaborator in a way that isn't an implementation detail is actually a `Presenter` interacting with a `View` in MVP. Take, for example, this `Presenter` that we talked about in [my post on MVP and object seams]({{<relref "post/object-seams-and-mvp-for-testability.md  ">}})

{{< highlight java "style=default, hl_lines=9" >}}
class Presenter {

  public void presentCards() {

    if (mIsAttendeeAtVenue) {

      if (!mMsgSettings.hasAnsweredMessagePrompt()) {

        mExploreView.addMessageOptInCard();

      }
    }
  }
}
{{< / highlight >}}

In this snippet, the `Presenter`'s responsibility is to display the appropriate cards depending on various factors. When we write a test that includes the line `verify(mExploreView).addMessageOptInCard()`, we're merely making sure that the `Presenter` does its job. We're concerned with the "what," not with the "how." If `mExploreView` wants to change how it actually adds a message opt in card, we don't care. If the implementation of `MessageSettings.hasAnsweredMessagePrompt` changes, again, we don't care.

### Mocking Types We Don't Own

Although the exceptions thrown by running android unit tests that exercise unmocked android dependencies suggests otherwise, we shouldn't be in the business of mocking types we don't own. Again, Freeman and Pryce are explicit about the disadvantages of doing this:

>We find that tests that mock external libraries often need to be complex to get the code into the right state for the functionality we need to exercise. The mess in such tests is telling us that the design isn’t right but, instead of fixing the problem by improving the code, we have to carry the extra complexity in both code and test. A second risk is that we have to be sure that the behavior we stub or mock matches what the external library will actually do.

This second risk is actually something that Jake Wharton has commented on explicitly in the context of using robolectric for Android testing:

>[With robolectric], you end up testing the wrong thing...your test is testing the robolectric implementation of these lifecycles and these mechanisms...the fact that you're relying on those behaviors...it's going to devalue the actual test itself.

>-Jake Wharton, Fragmented Podcast Episode 7 4:10

The approach recommended by Freeman and Pryce -- and the approach that I strive to follow when writing tests for my code -- is to instead write an adapter layer that translates requests from our application to the third party library, which in this case is the Android SDK. The `View` in MVP is often a part of this adapter layer, as it translates requests made in the language of our application into code that talks directly to the Android SDK.

### Conclusion

So, don't make too many verifications on your mocks and don't mock types you don't own. Following this advice -- advice that's given by the inventors of mocks -- will make your tests simpler and less tied to implementation details of the class you're trying to test.<sup>3</sup> If we follow this advice, I think we'll find that mocks are a very apt tool for unit testing android applications.

### Notes

1. See ["Mocks Aren't Stubs"](http://martinfowler.com/articles/mocksArentStubs.html) and ["Some Mocks"](http://higherorderlogic.com/2013/01/some-mocks/) for example.

1. "Growing Object Oriented Software Guided by Tests," 319.

1. I actually think following these two pieces of advice leads to a virtuous circle: if you only mock types you own, then you have to define types in the language of your application. This makes your test less coupled to implementation details, as stubbing these types in the arrange step of your unit test will actually just feel like you're declaratively specifying preconditions in the language of your application. Conversely, there's a vicious cycle caused by mocking types you don't own. You're tests are going to be more tied to implementation details and because mocking types we don't own winds up being complicated, its especially painful to change tests when implementation details need to change.
