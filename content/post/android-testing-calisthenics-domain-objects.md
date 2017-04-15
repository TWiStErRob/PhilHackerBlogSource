+++
date = "2017-04-14T23:17:38-04:00"
title = "Android Testing Calisthenics: Domain Objects"
share = true
image = "images/marathon.jpg"
slug = "android-testing-calisthenics-domain-objects"
menu = ""
comments = true
tags = ["android","testing"]
draft = false
author = ""
+++

Imagine that you've never run a single mile in your life. You know that exercising is good for your health, so you decide that you're going to take up running. Strangely, however, you also decide that you're going to begin your journey towards physical fitness by running a marathon tomorrow.

That's obviously a bad idea.

Less obviously, deciding to go from no experience with testing to writing tests for an already existing Android app is also a bad idea. Adding test coverage to an already existing Android application is a marathon-level testing project. It'd be more sensible to start with something smaller and work your way up.

This post invites you to embrace this sensible idea. It's a series of exercises designed slowly introduce you to the challenge of testing Android applications. Before we do that though, I want to say a little about why I think Android testing is one of the hardest kinds of testing you can do.

### Android: A Marathon-Level Testing Project

I've been reading through Gerard Meszaros' *xUnit Testing Patterns*. The other day I stumbled upon this passage:

>Some kinds of tests are harder to write than others. This difficulty arises partly because the techniques are more involved and partly because they are less well known...The following common kinds of tests are listed in approximate order of difficulty, from easiest to most difficult.

>1. Simple entity objects
>1. Stateless service objects
>1. Stateful service objects
>1. User Interface, database, and multi-threaded logic
>1. Object-oriented legacy software (software built without tests)
>1. Non-object-oriented legacy software<sup>1</sup>

I've talked [a]({{<relref "2015-04-17-why-android-unit-testing-is-so-hard-pt-1.markdown">}}) [lot]({{<relref "why-android-testing-is-so-hard-historical-edition.md">}}) about why Android unit testing is so hard, but this passage struck me. As it read it, it occurred to me that testing Android code is combination of the hardest thing on that list with the 3rd hardest thing on that list. Android apps don't tend to be object oriented and they involve a lot of user interface, database, and multi-threaded code. 

So, those who attempt to add tests to already existing Android apps are really doing something difficult. I'm not the only one saying that. Meszaros suggests the same thing (by implication) in the above passage.

### Calisthenics

Instead of starting with the hardest possible target to test, let's work our way up. [This github project](https://github.com/kmdupr33/TestingCalisthenics) has some exercises to get you ready. If you want, you can checkout the project and switch between the challenge and solution branches as you work through them. Throughout the remainder of the post, I'll present a testing challenge and the solution to that challenge. If you really want to ready for testing Android apps, I'd suggest you try to work through the challenge and check your solution with the ones that I suggest.

#### Domain Object

The easiest thing to test, according to Meszaros, is a simple domain object. We don't typically deal with domain objects in Android development since Android apps tend not to be object oriented, but this is still a helpful starting point for learning testing.

To come up with our challenge, we can think back to the business rule we discovered while [we were looking at the google I/O conference app a couple weeks back]({{<relref "what-unit-tests-are-trying-to-tell-us-about-activities-pt-1.md">}}): A user cannot remove the keynote session from her schedule. Instead of encoding this business rule in the UI, suppose we had an actual domain object that enforced it:

{{< highlight java "style=default" >}}
class Schedule {
    void remove(Session session) {
        if (session.isKeynote()) {
            throw new UnsupportedOperationException();
        }
        sessions.remove(session);
    }
}
{{< / highlight >}}

This is a simple, not-so-scary piece of code. Because [the code doesn't scare us]({{<relref "what-should-we-unit-test.md">}}), we might not write a test for it in real life, but we're just getting our feet wet with testing, so let's give it a go. Here's the stubs of the test methods you'll need to fill in:

{{< highlight java "style=default" >}}
public class ScheduleTest {
  @Test public void removesNonKeynoteSession() throws Exception {

  }

  @Test public void throwsOnRemoveKeyNote() throws Exception {
  }
}
{{< / highlight >}}

In the first method, you want to check that `Schedule` actually removes non-keynote sessions. In the second method, you want to check that `Schedule` throws an exception if you try to remove a keynote session. Give it a go! When you scroll down, you'll see how I've filled in these methods.

---

Here's how I wrote `removesNonKeynoteSession`:

{{< highlight java "style=default" >}}
@Test public void removesNonKeynoteSession() throws Exception {
    Schedule schedule = new Schedule();
    final Session session = new Session(false);
    schedule.add(session);
    schedule.remove(session);
    assertFalse(schedule.get().contains(session));
}
{{< / highlight >}}

And here's how I wrote `throwsOnRemoveKeynote`:

{{< highlight java "style=default" >}}
@Test(expected = UnsupportedOperationException.class) public void throwsOnRemoveKeyNote() throws Exception {
    Schedule schedule = new Schedule();
    final Session session = new Session(true);
    schedule.add(session);
    schedule.remove(session);
}
{{< / highlight >}}

Already we're seeing a pattern in these two tests. This pattern turns out to be core to testing. Each test method consists of three stages: arrange, act, assert. In the arrange stage, we get our domain object into the appropriate state for our test. In the case of `throwsOnRemoveKeyNote`, the arrange steps consist of these highlighted lines:

{{< highlight java "style=default, hl_lines=2 3 4" >}}
@Test public void removesNonKeynoteSession() throws Exception {
    Schedule schedule = new Schedule();
    final Session session = new Session(false);
    schedule.add(session);
    schedule.remove(session);
    assertFalse(schedule.get().contains(session));
}
{{< / highlight >}}

Remember: we're trying to test that the `Schedule` allow us to remove a non-keynote session. To test that, we need a `Schedule` that has a non-keynote `Session` added to it, and that's precisely what we're doing in these three lines.

The second stage in our test is the act stage. This is when we actually exercise the code we're trying to test. In this case, we're testing that `schedule.remove` works correctly, so we call that method.

The last stage is "assert," where we're actually making sure that, given the conditions we setup in the arrange stage and given that the target code has actually executed in the act stage, that target code has done what we wanted it to do. In this case, we expect that the `Session` removed should no longer show up in the list of sessions on a certain schedule. This is what we're doing by calling `assertFalse(schedule.get().contains(session))`.

To double check your understanding of the three stages of a test, why not try to identify which lines correspond to which stage in `throwsOnRemoveKeyNote`. Again, scroll down when you're ready.

---

Arrange:

{{< highlight java "style=default, hl_lines=2 3 4" >}}
@Test(expected = UnsupportedOperationException.class) public void throwsOnRemoveKeyNote() throws Exception {
    Schedule schedule = new Schedule();
    final Session session = new Session(true);
    schedule.add(session);
    schedule.remove(session);
}
{{< / highlight >}}

Act is when we call `schedule.remove()`

Assert:

{{< highlight java "style=default, hl_lines=1" >}}
@Test(expected = UnsupportedOperationException.class) public void throwsOnRemoveKeyNote() throws Exception {
    Schedule schedule = new Schedule();
    final Session session = new Session(true);
    schedule.add(session);
    schedule.remove(session);
}
{{< / highlight >}}

(When we pass `UnsupportedOperationException.class` as the value for `expected`)

### Conclusion

Hopefully that wasn't too difficult. Hopefully that was a helpful exercise. Next time, we'll make things a bit more difficult. Until then, feedback and questions are welcome!

### Notes:

1. Gerard Meszaros, *xUnit Test Patterns*, 247-248.
