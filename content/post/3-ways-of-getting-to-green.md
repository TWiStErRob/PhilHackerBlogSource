+++
slug = "3-ways-of-getting-to-green"
comments = true
author = ""
date = "2016-10-16T22:38:44-04:00"
title = "3 Ways of 'Getting to Green'"
draft = false
share = true
menu = ""
tags = [
  "testing",
  "TDD",
]
+++

A part of the TDD work flow is getting a failing test to pass as quickly as possible. This makes sense if we think about how [TDD is supposed to help us take smaller steps when we're writing programs](http://www.philosophicalhacker.com/post/the-goal-of-refactoring-during-tdd/). Beck goes over three ways of getting a test to pass quickly in the fist part of *TDD By Example*.

The first method is to fake it. Just hard code whatever values you need to to get the tests to pass.

The second method is try for the simplest possible implementation.

The third method is something Beck calls "triangulation", and its only used if you're not sure how to proceed. When you triangulate on an implementation, you start by writing a second test. This second test will force you to generalize the hard-coded implementation you wrote to get your test to pass. Writing this second test, moreover, is supposed to help you think through how to generalize your implementation:

>...Triangulation provides a chance to think about the problem from a slightly different direction. What axes of variability are you trying to support in your design? Make some of them vary, and the answer [i.e., the general implementation] may become clearer.
