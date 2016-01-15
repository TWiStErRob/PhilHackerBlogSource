---
author: kmdupr33@gmail.com
categories:
- Android
comments: true
date: 2015-04-06T03:39:02Z
slug: dont-call-it-mvp
tags:
- android
title: Don't call it "MVP"
url: /2015/04/06/dont-call-it-mvp/
wordpress_id: 273
---

Lately there's been a lot of discussion about an alternative architectural pattern for Android development. The acronym that's being used to denote this alternative pattern is "MVP." I think that "MVP" is an inaccurate and confusing designation for this pattern. In this post, I will say why I think "MVP" is a bad name for the pattern, and I'll suggest a different name for referring to it.


# What is "MVP?"


There are plenty of blog posts out there that describe the "MVP" pattern, so I'm not going to do that here. If you're not familiar with MVP, then I suggest checking out S[quare's tirade against fragments](https://corner.squareup.com/2014/10/advocating-against-android-fragments.html) or [Hannes Dorfmann's post about his library that's supposed to help with implementing MVP](http://hannesdorfmann.com/android/mosby/).


# Why "MVP" is an Unhelpful Name


The problem with the name "MVP" is that the `View`s in the MVP triad are actually quite different from the `View`s in Android SDK. They each have fundamentally different responsibilities, so we need a way to mark the difference between Android `View`s and MVP `View`s. Without clearly marking the difference between them, we make it more difficult to understand the "MVP" pattern and we run the risk of conflating the two object's responsibilities when we start trying to follow the MVP pattern.

Let me try to clearly distinguish an Android `View` from an MVP `View`.

Traditionally, an Android `View` is generic; it is not application specific. There is no `RedditPostTitleView` in the Android SDK. Instead, we just have something generic like a `TextView`. There is no `onRedditPostTitleClicked()`, but there is a generic `onClick()` method.

An MVP `View`, on the other hand, is application specific. The MVP `View` responds to application-specific messages from the `Presenter`. It responds to messages like `showRedditPosts()`. An MVP `View` also sends application-specific event messages to its `Presenter`, messages like `onRedditPostTitleClicked()`.

So, Android `View`s and MVP `View`s are fundamentally different, but both are present in any Android application that follows the "MVP" pattern. The name "MVP" obscures the difference between these two `View`s. That's why I think its unhelpful.


# An Alternative Name


Here's the new name I think we should use instead of "MVP": MVVTP

The "VT" in the above acronym stands for "ViewTranslator."

To see why this acronym is more accurate than "MVP," let's look a little closer at the responsibilities of Android `View`s and MVP `View`s. Remember that Android `View`s are generic. They're generic because they need to be reusable. A `RedditPostTitleView` can only be used in a Reddit client app, so instead we have a generic `TextView`.

An MVP `View`, on the other hand, has a different responsibility. It lets the `Presenter` manipulate what gets drawn on the screen on a more abstract, application-specific level. In other words, an MVP `View` translates a higher level, application-specific request from the `Presenter` into code that Android `View`s can "understand."

For example, there is no `showRedditPosts()` method on a `RecyclerView`, but an MVP View takes a `showRedditPosts()` message and "says" to an Android `View`, "Hey. What the `Presenter` really wants when he says '`showRedditPosts()`' is '`recyclerView.setAdapter(redditPostsAdapter)`'.

That's why I think we should call MVP `View`s "ViewTranslators." That name more accurately captures their responsibility.

If we recall that MVP `View`s also forward UI events to their `Presenter`, we can see another reason why "ViewTranslator" is a better name for an MVP `View`. When an MVP `View` forwards a UI event to its `Presenter`, it is also translating that generic event into an application-specific one. It converts a generic `onClick()` event from a `TextView` to an application-specific `onRedditTitleClicked()` event.


# Conclusion


"MVP" is a bad name for the new architectural pattern that Android devs are talking about because it obscures the difference between MVP `View`s and Android `View`s. "MVVTP," where VT stands for "ViewTranslator" is a better name for this pattern because it explicitly marks a difference between Android `View`s and `ViewTranslators`. Android `View`s know how to draw stuff, and they don't need any application-specific knowledge to do that. `ViewTranslators` translate application-specific requests from the `Presenter` into generic messages that Android `View`s can understand and they translate generic UI events from `View`s to application-specific events that the `Presenter `can act on.
