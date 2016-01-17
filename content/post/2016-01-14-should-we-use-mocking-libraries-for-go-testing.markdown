---
author: kmdupr33@gmail.com
categories:
- Go
comments: true
date: 2016-01-14T02:20:53Z
slug: should-we-use-mocking-libraries-for-go-testing
title: Should we use mocking libraries for go testing?
url: /2016/01/14/should-we-use-mocking-libraries-for-go-testing/
wordpress_id: 734
---

A few weeks ago, I started learning go. Since I'm a wannabe TDD-er, I took a look at some resources on testing go code. I stumbled upon [Andrew Gerrand's excellent Testing Techniques talk](https://talks.golang.org/2014/testing.slide#1) in which he says this:


<blockquote>Go eschews a lot of things, including mocks and fakes.</blockquote>


"Alright cool," I thought to myself. I'm down to "do as the gophers do" and eschew mocks. Later on during his talk, Andrew Gerrand mentions [gomock](https://github.com/golang/mock), a mocking library, and reluctantly says


<blockquote>[mocking libraries like gomock] are fine, but I find that on balance the hand-written fakes tend be easier to reason about and clearer to see what's going on, but I'm not an enterprise go programmer so maybe people do need that so I don't know, but that's my advice.</blockquote>


Of course, after hearing that, I felt a little confused and unsure whether I should refrain from using mocking libraries in go. To make matters worse, I took a look at gomock and was surprised to find that its written by two engineers at Google.

At that point, it seemed that the question of whether we should use a mocking library while testing go code is a bit of a contentious question, even within Google. I found the seeming contentious nature of this question pretty unhelpful and confusing when I was trying to get a handle on how to write good go code. However, it led me to do some research on the pros and cons of mocking libraries vs hand-written mocks, and in this post, I present the conclusions I came to based on my research:

1. The apparent contentiousness about whether to use use a mocking library if probably partially due to vague terminology.

2. If we are clear about our terms, the argument against using mocking libraries is not very compelling.

<!--more-->


# Vague Terms


I think the terms "mock" and "fake," like many terms in software, are vague. I think, moreover, that the vagueness of the terms makes the question of whether to use a mocking library more difficult and more apparently contentious than it actually is.

Before I say more, let me start by giving a clear definition of a "mock." I like Martin Fowler's definition of mocks, a definition that he takes from Gerard Meszaros, the author of [xUnit Test Patterns](http://www.amazon.com/xUnit-Test-Patterns-Refactoring-Code/dp/0131495054):


<blockquote>objects pre-programmed with expectations which form a specification of the calls they are expected to receive [during the test]</blockquote>


Here's what a quick and dirty (hand-rolled) mock might look like in go:


{{< highlight go "style=default">}}
type mockEmailSender struct {
	test        *testing.T
	sendCalled  bool
	sendSubject string
	sendBody    string
}

func (m *mockEmailSender) Send(subject string, body string) {
	m.sendCalled = true
	m.sendSubject = subject
	m.sendBody = body
}

func (m mockEmailSender) verifyExpectation() {
	if !m.sendCalled {
		m.test.Error("Expected call to Send()")
	}

	if m.sendSubject != "Should we use mocking libraries?" {
		m.test.Errorf("Expeced Send() with subject: %s, received: %s", "Should we use mocking libraries?", m.sendSubject)
	}

	if m.sendBody != "Probably" {
		m.test.Errorf("Expected Send() with body: %s, received: %s", "Probably", m.sendBody)
	}

}

func TestEmailSender(t *testing.T) {
	m := mockEmailSender{test: t}
	defer m.verifyExpectation()
}
{{< / highlight >}}

Of course, this is a contrived example, but its enough to help convey the idea of a mock. As you can see, the test will fail if the mock doesn't receive a call with the appropriate arguments. The mock has been "pre-programmed" to expect a call to Send() with specify arguments and that expectation must be fulfilled in order for the test to pass.

Let's quickly define another word: "test double." Test doubles are objects that are used instead of a "real object" to facilitate testing. A mock is a test double, but not all test doubles are mocks.

Now that I've clarified the terms "mock" and "test double," let me say a little about why I think these terms are confused in Gerrand's testing techniques talk. I think that Gerrand is using the terms "mock" and "fake" to refer to test doubles in general rather than mocks in Fowler's sense of the word. If people are using the word "mock" to talk about different things, then we have to be careful about how we interpret their arguments for or against "mocking" libraries.

A part of the reason I think that Gerrand is using the term "mock" and "fake" differently from mock enthusiasts is that there's been some confusion about the term "mock" in the past, even among seasoned, intelligent software engineers like Andrew Gerrand. For example, Martin Fowler wrote ["Mocks aren't Stubs"](http://martinfowler.com/articles/mocksArentStubs.html) to clear up some confusion about the distinction between "mocks" and "stubs." Moreover, Steve Freeman, the author of [Growing Object Oriented Software Guided by Tests](http://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627), accuses Robert Martin of conflating mocks with stubs in his ["Manual Mocking: Resisting the Invasion of Dots and Parentheses."¹](https://sites.google.com/site/unclebobconsultingllc/blogs-by-robert-martin/manual-mocking-resisting-the-invasion-of-dots-and-parentheses)

Another reason I think that Gerrand uses the word "mock" or "fake," to refer to what Fowler would call a "test double," is that he says,


<blockquote>We just have small fakes like the [httptest.]ResponseRecorder that allow us to inspect how they were used. There are frameworks that generate those kinds of fakes. One of them is called "gomock..."</blockquote>


However, the "fakes" generated by gomock are importantly different from ResponseRecorder. Gomock generates mocks in Fowler's sense of the word, which means that the test that contains the mock will only pass if the the object being tested _calls the expected methods of the mock object_. (Think back to above "hand-rolled" mock.)

This isn't how tests with a ResponseRecorder work out of the box. In fact, the ResponseRecorder is basically a Recorder with some "getters" that allow us to perform state-based verification for our testing, a verification technique that, according to Martin Fowler, is a verification technique that's used when you _aren't_ working with a mock.


# The Argument against Gomock


Regardless of whether there's any confusion of terms in Gerrand's remarks about mocking, if we're clear about what we mean by mocks, I think we can see that his reasons against using a mocking library aren't very compelling. Recall that his reason to write hand-written mocks is that they tend to be:




  1. easier to reason about


  2. easier to read


This argument raises two questions. First, is it really the case the handwritten mocks are easier to read and reason about? Second, even if they are easier to read and reason about, is it worth hand writing the mocks when they can generated by a library?

The first question raises hard questions about how you would "objectively" measure the readability and "reasonableness" of code. I'm not prepared to answer those questions here. I can say, however, that, in my experience, mocks whose expectations can be set within the test body are easier to read and reason about. Gomock lets you generate these kinds of mocks, so that's a point for gomock in my book.

The second question is easier for me to answer. Of all the test doubles, mocks are probably the most tedious to write. Its not implausible that increased readability might justify hand-rolling other kinds of test doubles, but mocks aren't completely trivial to write, so I'd rather have a library that does that for me, _even if the library mocks are a little less readable._


# Conclusion


So, that's where I stand for now. I think that if you're going to use mocks for your tests, using a mocking library is probably a good idea. Moreover, I think that a part of the reason why it can be difficult to come to this conclusion is that we often aren't very clear about how we use words like "mock" and "fake."


## Notes






  1. Steve Freeman claims that Robert Martin conflates mocks with stubs in the comments of Robert Martin's article.
