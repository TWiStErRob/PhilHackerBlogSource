---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-06-12T12:34:53Z
slug: an-introduction-to-rxjava-for-android
title: An Introduction to RxJava for Android (Pt. 1)
url: /2015/06/12/an-introduction-to-rxjava-for-android/
wordpress_id: 427
---

I'm taking a brief break from talking about testing. I'll resume my discussion of how [I'm making Google's IOSched app unit testable](http://www.philosophicalhacker.com/2015/05/31/towards-a-unit-testable-fork-of-googles-iosched-app/) after I've posted the content from [my upcoming talk on RxJava](http://www.meetup.com/University-Android/events/222048562/).


 [![rxjava_prezi_rxjava_def](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_rxjava_def-1024x791.jpg)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_rxjava_def.jpg)


<!--more-->

RxJava is a library that let's you represent anything as an asynchronous data-stream that can be created on any thread, functionally transformed, and consumed by everyone on any thread.

[![rxjava_prezi_outline_talk](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_outline_talk-1024x791.jpg)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_outline_talk.jpg)

I don't expect that definition to mean much to you at this point, but don't worry. During this presentation, we're going to break down each piece of the statement I just made, and by the time we're through, you'll understand what RxJava is and why its awesome.

[![rxjava_prezi_teaser](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_teaser-1024x791.jpg)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_teaser.jpg)





Before we start trying to understand what RxJava is, let me give you a small teaser that will give you some idea of what RxJava can do. This screenshot is from Google's IOSched app. On this screen, you can search through the various IO sessions. Whenever users type in text into the the `SearchWidget` in the `Actionbar`, the database is re-queried using the entered text and the results are displayed in a list below the `Actionbar`.

Now, suppose that you're supposed to implement something like this for an app you're building, but suppose that there are some further requirements, namely, that the query should only execute if:



	
  * there are at least three characters entered into the `SearchWidget`

	
  * there has been at least a 100 millisecond delay before any other characters have been entered into the `SearchWidget`


How many lines of code do you think it would take to implement something like this? If you look at the [IOSched source code](https://github.com/kmdupr33/iosched/blob/master/android/src/main/java/com/google/samples/apps/iosched/ui/SearchActivity.java), you'll get an idea of what it would take. If you followed the strategy in the IOSched app, you'd probably set a listener on the `SearchWidget` text and use an if-statement to check to see if the text is at least three characters long. If it is, you'd call a method that uses a `Handler` to remove any messages that have been scheduled to execute in the last 100 milliseconds and that schedules a new message to be sent at the end of a 100 millisecond delay.

Here's what's awesome about RxJava: Once you have an RxJava `Observable` that's set up to report events about text changes in the SearchWidget, you can do the equivalent of all of this in three lines of code. The RxJava way of doing this, moreover, will provide you with more flexibility that will help you cope with any subsequent changes you'll need to make to this portion of the code.

Hopefully, that's enough to keep you interested in learning about RxJava in case I've failed to make my introduction to it easy to understand.

[![rxjava_prezi_async_data](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_async_data-1024x791.jpg)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_async_data.jpg)

Let's start with something that's familiar. RxJava let's you deliver asynchronous data to anyone who's interested in receiving it. Of course, RxJava does more than that, but, this is definitely something that you can do with RxJava. This is something that you do all the time without RxJava. Here's a snippet that shows how how changes in the search query string for an IO session are delivered to a `OnQueryTextListener`, a consumer of asynchronous data.[
](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_async_data_code.jpg)

[![rxjava_prezi_async_data_code](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_async_data_code1-1024x791.jpg)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_async_data_code1.jpg)

Here's what this would look like with RxJava:

[![rxjava_prezi_async_data_rxjava_code](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_async_data_rxjava_code-1024x791.jpg)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_async_data_rxjava_code.jpg)

In this snippet, we have an `Observable` that represents the data stream produced by changes in the text of the `SearchWidget`. We also have a `Subscriber` (created from the `Action1` passed into the `subscribe()` method) who's interested in any changes in the text of the `SearchWidget`. Let's get a little clearer on the definitions of `Observable`s and `Subscriber`s.

[![rxjava_prezi_define_observer_subscriber](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_define_observer_subscriber-1024x791.jpg)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_define_observer_subscriber.jpg)

Notice that an `Observable` represents a _data stream_ and that there can be _multiple Subscribers_ who are interested in consuming this asynchronous data stream. I'll say more about what I mean by the phrase "data stream" later. For now, let's focus on the fact that RxJava let's multiple `Subscribers` consume asynchronous data.

By itself, this fact isn't really a big deal. Its basically just the observer pattern. You work with objects that leverage the observer pattern to deliver asynchronous data to multiple recipients all the time. Anytime you call `RecyclerView.Adapter.notifyDatasetChanged()` (or the `ListView` equivalent), you're taking advantage of the observer pattern.

The `RecyclerView` is an observer of any changes to the `Adapter`'s data, but you could have more than one observer. Any object that wants to be an observer of the `Adapter`'s data would just have to call `registerDatasetObserver()` just like the `RecyclerView` does.



If you want to use RxJava to deliver asynchronous data to multiple `Subscribers` here's what that might look like:

[![Screen Shot 2015-06-12 at 7.18.56 AM](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/Screen-Shot-2015-06-12-at-7.18.56-AM-e1434108030545-1024x397.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/Screen-Shot-2015-06-12-at-7.18.56-AM.png)

Ignore the `publish()` and `connect()` method calls for a moment. We'll talk about those later. The important thing here is that there are multiple `Subscribers` set up to be notified of any changes in the `SearchWidget`'s query string text. (By the way, if you're not familiar with [lambda expressions](https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html#syntax), you should probably get familiar before continuing.)

[![RxJavaTalk-02](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/RxJavaTalk-02-e1434108825723-300x72.png)](http://www.philosophicalhacker.com/?attachment_id=440)

Alright, so we've just established that RxJava let's you deliver asynchronous data to everyone who's interested. The data delivered to `Subscriber`'s, however, has a specific structure. "Data stream" is the phrase that I've been using to refer to that specific structure. We're now in a position to see precisely what I've meant by this phrase.

A data stream, as Im defining it, is just ordered data that has a well-defined stopping point and a way of notifying processors of the data that an error has occurred.  Java's `Reader` would count as a data stream in the sense that I'm defining it here because its `read()` method returns -1 once its reached the end of a byte[] and because it throws exceptions if there's an error with processing the data.

I admit that this is might be an unnatural definition of the phrase "data stream," but my primary goal here is to have a succinct phrase for referring to the structured data delivered by Observables rather than to come up with a definition for the phrase "data stream" that fits our ordinary usage, so don't get philosophical on me. Just know that when I say "data stream," I mean an ordered data that has a well-defined stopping point and a way of notifying processors of the data that an error has occurred.

The fact that RxJava deals with data streams rather than just data is reflected in their use of marble diagrams to represent Observables. I've been using these diagrams throughout the presentation. Let me briefly explain them:

[![RxJavaTalk_as a data stream](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/RxJavaTalk_as-a-data-stream-300x58.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/RxJavaTalk_as-a-data-stream.png)



Each circle along this line represents a piece of data emitted by an Observable. The arrow at the end of the line represents the fact that the data is ordered. The solid line following the word "stream" indicates that the Observable stream has successfully emitted all of its items. An "X" at any point along the line, however, indicates that an error has occurred while attempting to emit the asynchronous data:

[![RxJavaTalk_wtf is he saying](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/RxJavaTalk_wtf-is-he-saying-300x58.png)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/RxJavaTalk_wtf-is-he-saying.png)

You saw this digram earlier. Its was a (bad) joke that represented your stream of consciousness as an Observable sequence that's experienced an error because your mind was just blown by my initial summary of RxJava. Terrible jokes aside, that's how you represent errors on a marble diagram.

Technically, these marble diagrams could represent synchronous data streams, but RxJava is really all about _asynchronous_ data streams. Asynchronous data streams are just data streams that are processed by consumers who aren't going to just wait around for all of the data to be available. Consumers of a synchronous data stream say, "I'm not going anywhere until you give me that data!" Consumers of asynchronous data say, "Fetching the data sounds like it could take a while. I'm going to go about my day. Why don't you notify me when you get that data for me."

Let's recap. We started off with this statement of what RxJava does:

[![rxjava_prezi_rxjava_def](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_rxjava_def-1024x791.jpg)](http://www.philosophicalhacker.com/wp-content/uploads/2015/06/rxjava_prezi_rxjava_def.jpg)

We now know what an asynchronous data stream is and we know that RxJava uses the Observer pattern to deliver these streams to everyone that's interested. We still don't know, however, what it means for a data stream to be "functionally transformed" nor do we know how RxJava allows us to represent anything as an asynchronous data stream that can be created and consumed on any thread. These are questions I'll have to tackle in [the second part](http://www.philosophicalhacker.com/2015/06/19/introduction-to-rxjava-for-android-pt-2/) of this written version of [my upcoming RxJava talk](http://www.philosophicalhacker.com/2015/06/16/introduction-to-rxjava-for-android-the-talk/).




