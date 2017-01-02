+++
title = "Preface"
slug = "preface"
draft = false
image = ""
author = ""
date = "2017-01-02T14:01:26-05:00"
next = "why-android-unit-testing-is-so-hard"
+++

Almost a year and a half ago now, I wrote a series of blog posts about Android testing. The posts I wrote were received enthusiastically, and several people told me directly that they found my posts very insightful. Naturally, I was stoked about this.

To make things even better -- or so I thought -- I saw that my blog posts were getting traffic from *Fragmented*, a newish (at the time) Android developer podcast. I quickly went to their site and raced to the end of the episode, the part where I figured the hosts would be talking about my posts.

Don Felker, one of the hosts, struggled a bit to pronounce the name of my site, which served to build up my anticipation of what he'd say about my posts. "Maybe he'll have the same reaction as everyone else, and he'll say they're really insightful", I hoped to myself. What I heard next dashed those hopes and made me doubt whether I'd written anything that I should be proud of:

>The topic is why is Android Unit Testing so Hard...and I'm posting this here because the topics he brings up are arrange, act, assert...[and] how to organize a unit test...what I noticed is that when I read this, I felt like I was taking a step 10 years back. A lot of these discussion are discussions that other languages had 10 years ago. So, its interesting to me to see how Android is finally catching up.<sup>1</sup>

Ouch. Hearing that didn't feel great, but sometimes the truth hurts.

Here's the truth: Even though we've made some strides since that episode was recorded, Don Felker's remark is still right on. We're behind on our testing game.

After hearing Felker make this comment, I starting looking for those 10 year old conversations about testing. Since then, the books I've read and the talks and podcasts I've listened to do indeed show that we're behind, and those resources -- along the experiments I've engaged in on making apps testable -- have given me some ideas about how we can up our testing game. This book is a distillation of the things that I learned about testing as they relate to Android development.

Here's the gist of what I've learned, a gist that is also a preview of the contents of this book:

Writing android tests is hard because of the way we structure our code. We'll see exactly why this is true in the first chapter of this book, and I'll speculate a bit about the historical reasons we've been writing untestable code. In the second chapter, we'll see that if we introduce seams into our code, testing becomes possible. If our code isn't testable, there is specific, conservative refactorings we should do to introduce seams and get tests in place. That's the topic of the third chapter, and it finishes off the first part of the book, which focuses around the theme of making testing possible.

The second part of the book is about how to make effective use of tests once you're code allows you to write them. Keeping in mind the reasons we want to write tests in the first place will help us discover what tests we should write first. I'll show how in the 4th chapter. Chapter 5 is about how writing tests gives us valuable feedback on the design on of our code. If ignored, this feedback will make our tests less ineffective. Finally, we'll explore some of the patterns and principles used to maintain the test code itself.

I still have *a lot* to learn<sup>2</sup>, but my hope in writing this book is that by sharing some of the lessons I've learned, we'll be able to catch up on best practices for testing software. More than that: I'd love it if we led the way on innovating in the automated testing space.

Maybe someday we'll have the pleasure of hearing some other host of some other programming language podcast say this:

>I found this interesting link on testing, but to be honest, it made me feel like our community is behind. **The Android community** has been saying this for a long a time.

--Matt Dupree, a philosophical hacker

## Notes:

1. [*Fragmented*, Episode 7](http://fragmentedpodcast.com/episodes/7/), 1:20:10

1. In fact, that's actually a part of the reason I'm writing this book.
