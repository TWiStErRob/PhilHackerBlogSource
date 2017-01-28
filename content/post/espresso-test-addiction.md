+++
slug = "espresso-test-addiction"
menu = ""
comments = true
date = "2017-01-28T09:19:38-05:00"
tags = [
  "android",  
  "testing",
]
author = ""
title = "Espresso Test Addiction: An Anti-pattern"
share = true
draft = false
image = "images/espresso-beans.jpg"
+++

>More than 1000 apps...they have espresso tests for the first time using the test recorder...espresso adoption has also grown since the introduction of [the espresso test recorder].

>Android Developers Backstage, [Episode 37 Espresso Test Recorder](http://androidbackstage.blogspot.com/2016/10/episode-57-espresso-test-recorder.html), 31:10

---

>Record-playback tools are almost always a bad idea for any kind of automation, since they resist changeability and obstruct useful abstractions. They are only worth having as a tool to generate fragments of scripts which you can then **edit** as a proper programming language...

>Martin Fowler, ["Test Pyramid"](https://martinfowler.com/bliki/TestPyramid.html) (emphasis mine)

---

Espresso tests make a nice addition to our testing tool-belt. The espresso test recorder, moreover, makes getting started with testing and espresso very easy. As I've said before, [getting started with automated testing on Android is hard]({{<ref "2015-04-17-why-android-unit-testing-is-so-hard-pt-1.markdown">}}), so having nice tools and an clear on-boarding ramp for testing is a good thing.

Of course, we all know that its possible to have too much of a good thing, and I sometimes worry that espresso and espresso recorder are contributing to the formation of a UI testing addiction in the Android community. I worry, moreover, that this addiction that will probably lead to less testing in the long-run.

UI tests and test recorders are, of course, not new, so they have well-understood limitations. Moreover, lots of smart programmers have said smart things about how to best use these tools. This post reviews these limitations and best practices in general and suggests how we ought to apply those practices to Android development.

### UI Tests Outside the Android Community

Outside the Android community, the caution around writing too many UI tests is actually surprisingly loud and clear.

Mike Cohn, for example, expresses this caution with [his testing pyramid suggestion](https://www.mountaingoatsoftware.com/blog/the-forgotten-layer-of-the-test-automation-pyramid):

>At the base of the test automation pyramid is unit testing. Unit testing should be the foundation of a solid test automation strategy and as such represents the largest part of the pyramid...Automated user interface testing is placed at the top of the test automation pyramid **because we want to do as little of it as possible.**

Cohn warns us in this article (and the book the article is advertising) that if we don't have a healthy test pyramid, then "all other testing ends up being performed through the user interface, resulting in tests that are expensive to run, expensive to write, and brittle." This test pyramid suggestion is echoed by [Martin Fowler](https://martinfowler.com/bliki/TestPyramid.html) and by [Google](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html).

Michael Feathers, to take another example, also talks about the limitations of large tests, particularly with respect to how useful they are in helping us refactor with confidence:

>Unit testing is one of the most important components in legacy code work. System-level regression tests are great, but small, localized tests are invaluable. They can give you feedback as you develop and allow you to refactor with much more safety.<sup>1</sup>

And later on, contrasting unit tests with larger tests, he says:

>Larger tests tend to take longer to execute. This tends to make test runs rather frustrating. Tests that take too long to run end up not being run.<sup>2</sup>

Finally, Gerard Meszaros in his *xUnit Test Patterns* has an entire section explaining why over-using UI tests isn't a great idea.<sup>3</sup> Here's one specific passage with a strong caution against using recorded UI tests in particular:

>In the last decade [1998-2008], more general-purpose test automation tools have become available for testing applications through their user interfaces. Some of these tools use scripting languages to define the tests; the sexier tools rely on the "robot user" or "record and playback" metaphor for test automation. Unfortunately, many of the early experiences with these latter tools left the testers and test managers less than satisfied. The cause was high test maintenance costs caused by the "fragile test" problem.

The gist of all of these quotes is that writing too many UI tests will likely result in a suite that is a) too slow to support development/refactoring, b) too difficult to maintain, as changes in the UI can break a large amount of tests.<sup>4</sup>

### But what about the "robot pattern?"

At this point, some readers may wonder whether "[the robot pattern](https://realm.io/news/kau-jake-wharton-testing-robots/)" makes writing a ton of UI tests ok. The robot pattern, to refresh your memory, is a way of making your UI tests more resistant to change by hiding the details of view interaction behind "robot" objects. While the robot pattern does *mitigate* the issue of brittle tests, over-relying on UI tests, even with the robot pattern, is still going to result in a sub-par testing suite. Here's why.

Let's start by noting that the robot pattern is not new. The robot pattern is just [Martin Fowler's page object pattern](https://martinfowler.com/bliki/PageObject.html).<sup>5</sup> So, when other software engineers outside the Android community suggest that too much UI testing is a bad idea, its not because they aren't aware of the possibility of "the robot pattern."

Next, we can note something obvious about the robot pattern: it does nothing to improve the *speed* of UI tests. The lack of speed of UI tests is one of the main disadvantages of over-relying on them.

Finally, although the robot pattern does make UI tests resistant to small UI changes, it does not allow tests to gracefully adapt to larger UI changes. Suppose, for example, that a particular piece of functionality is moved to a different screen within our app. If this happens, we'll need to update our tests *and* our robots.

For the reasons, the robot pattern doesn't change the fact that we're often better off trying to find a way of testing functionality at the unit-level or integration-level.

### How to use Espresso Tests and the Recorder

Based on experiences and recommendations of *very* experienced software engineers outside the Android community, here's how I recommend we handle use espresso and recorder for UI tests:

1. If there's a way to test the functionality that you're trying to test at the unit level, do so.
1. If you can't do this, refactor so that you can test the functionality at the unit-level. Use the test recorder to record a UI test to support your refactoring to be sure that you didn't break anything.<sup>6</sup> After you've refactored your code to test the functionality at the unit-level, delete the recorded test.
1. If you're *really* interested in testing how the application works *as a whole*, using a UI test is fine, but, as the epigraph opening this post suggests, *refactor* your recorded tests to use the "robot pattern" to keep your UI tests resistant to small changes in the UI.

### Conclusion

Espresso and the test recorder are great tools, but don't let them suck you into writing too many UI tests. That way lies madness...and slow, fragile tests. These are tests that won't be useful, and as a result, [the fear that's supposed to be alleviated by writing unit tests will return]({{<relref "what-should-we-unit-test.md">}}). I don't want to work with code I'm afraid to change, so selfishly, I hope we'll all do better here.

### Notes:

1. Michael Feathers, *Working Effectively with Legacy Code*, 34-35.

1. Ibid., 35-36.

1. Gerard Meszaros, *xUnit Test Patterns*, 299.

1. Poor defect localization is another disadvantage of UI tests that I'm not covering in detail here. Writing too many UI tests *can* be a way of ignoring the design feedback your tests are trying to give you. ([The same thing can happen when we write robolectric tests.]({{<relref "why-i-dont-use-roboletric.md">}})) Unit testing android applications is hard because our Android apps often have bad architecture. Instead of listening to our tests that are telling us "your classes are tightly coupled and they violate the principle of single responsibility," we just say, "forget unit tests. I'll just test everything through the UI instead."

1. The key idea of this pattern, however, is definitely older than Fowler's page object pattern. Gerard Meszaros talks about it in *xUnit Test Patterns*, for example, which was published in 2007.

1. This strategy is recommended by both Feathers and Meszaros.
