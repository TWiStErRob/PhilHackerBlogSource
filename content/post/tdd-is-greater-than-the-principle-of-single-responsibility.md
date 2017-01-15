+++
comments = true
date = "2017-01-14T10:54:43-05:00"
title = "TDD > The Principle of Single Responsibility"
slug = "tdd-is-greater-than-the-principle-of-single-responsibility"
tags = [
  "architecture",
  "testing"  
]
draft = false
share = true
image = "images/castle.jpg"
menu = ""
author = ""
+++

>The programmer, like the poet, works only slightly removed from pure thought-stuff. He builds his castles in the air, from air, creating by exertion of the imagination. Few media of creation are so flexible, so easy to polish and rework, so readily capable of **realizing grand conceptual structures...**

> Fred Brooks, The Mythical Man-Month

---

Grand structures -- whether they are conceptual, programmatic, or physical -- require strong foundations. This is true in two senses.

In the first, obvious sense, strong foundations are required for a structure to withstand its own weight and the forces that want to knock it down. Structures without strong foundations often collapse.

In the second, less obvious sense, there's another kind of foundation that's crucial to a structure's integrity: the epistemic foundations that guide the architect as she lays the foundation and builds her structure, the architect's first principles. These epistemic foundations are even more fundamental to the structure's integrity than the foundation the structure actually sits upon. An architect that doesn't understand the foundational principles of her craft builds bad foundations, which leads to structures that collapse.

The principle of single responsibility is supposed to be this second kind of strong foundation for those of us that "build castles in the air." Its a principle that's supposed to help us build software with strong foundations, software that won't topple under its own weight and under the weight of forces that want to knock it down.

I think that TDD actually serves as a better foundation for designing robust software. The epigraph I opened this article with actually provides a nice preview of why I think this: building abstractions is a big part of building good software, but without these abstractions, the principle of responsibility isn't very helpful in guiding me. I often need something that pushes me to discover and build abstractions in the first place, and TDD does a better job of this than the principle of single responsibility.

In the rest of this post, I'll unpack and attempt to justify that last statement.

### Abstraction and the PSR

Imagine for a moment that Bill, another engineer shows you an app he's working on. When you take a look at it, you notice that the app consists of a single class that *implements* the entirety of your application. Until recently, if this happened to me, I would have immediately reached for the principle of single responsibility to explain what he did wrong.

**Me:** Have you ever heard of the principle of single responsibility?

**Bill:** Yeah. Actually, that principle was guiding me as I wrote this class.

**Me:** Really? Well, what is this class' responsibility?

**Bill:** Well, this class is responsible for running the app. This class didn't seem to violate the PSR because the class fits Bob Martin's definition of a class that follows the PSR. He says that "a class should only have one reason to change."<sup>1</sup> That's true of this class. There's only one reason it'll change: if the app needs to behave differently, we'll have to change this class. Also, the class passed Steve Freeman and Nat Pryce's test for whether a class follows the PSR: I can state the class's responsibility without any and's, or's, or but's.<sup>2</sup>

This is an absurd conversation, but its an extreme case to demonstrate an important point: whether a class seems to satisfy the principle of single responsibility depends largely on whether we can *identify* other responsibilities that our class is tackling. Bill's position feels absurd because we, as experienced developers, can identify other non-trivial responsibilities that are handled by his God class.

However, here's the kicker: its not always obvious that a class is handling multiple responsibilities. Bob Martin even says this in his chapter on the principle of single responsibility:

>The SRP is one of the simplest of the principles, and one of the hardest to get right. Con-
joining responsibilities is something that we do naturally. **Finding** and separating those responsibilities from one another is much of what software design is really about.<sup>3</sup>

If we keep in mind that the act of *naming* another responsibility is already the first step creating an abstraction,<sup>4</sup> we see that Michael Feathers gives us more evidence that finding and separating responsibilities is not a trivial exercise:

>...one pervasive problem in legacy code bases is that there often aren’t any layers of abstraction; the most important code in the system often sits intermingled with low-level API calls.<sup>5</sup>

To say that there are no layers of abstraction is to say that the programmer has failed to identify and separate responsibilities. In this particular example, the programmer has failed to identify domain-related responsibilities as separate from the responsibility of talking to some library or framework via low-level API calls.<sup>6</sup>

Here's one more piece of evidence that identifying responsibilities is not trivial. Again, I'm trading here on the idea that identifying responsibilities is the beginning of creating abstractions. Creating abstractions, in turn, is a part of creating a higher-level vocabulary with which to write your programs. Apparently, Kent Beck has said something like this recently:

{{< tweet 813931671116451841 >}}

Think about how much careful thought, experience, and discovery goes into creating sensible vocabularies. David West has a great bit about this in his book *Object Thinking*:

>When we discover new things, we invent (or borrow) new words to express our discovery. When we want to make critical distinctions between or among similar notions, we use specialized vocabularies. The use of special vocabularies is common in our professional lives because, as specialists, we need to become familiar with unique ideas and to make important distinctions that as laypersons we might not make.<sup>7</sup>

If we think of programming as naming responsibilities to create abstractions that make up a vocabulary, then the non-triviality of creating vocabularies in general has a direct bearing on the difficulty of identifying responsibilities while writing programs, which, if we take Kent Beck seriously, is just a particular kind of vocabulary construction.

So, whether a class seems to satisfy the principle of single responsibility depends on whether we can identify other responsibilities a class might be tackling. This isn't a trivial task and the PSR doesn't do anything to aid us in accomplishing it.

### Abstraction and TDD

TDD, on the other hand, actually puts pressure on us to identify responsibilities that may be hidden in the object we're trying to test. This happens for two reasons.

One reason is that we can't unit test a class at all if we won't have a way of getting the object into the right state for a test and a way of verifying the object is in the correct state after we've exercised it. Often, doing this requires that we identify an object's dependencies and interactions AS separate objects with separate responsibilities. Steve Freeman and Nat Pryce seem to say something like this without actually using the language of responsibility:

>…to construct an object for a unit test, we have to pass its dependencies to it, which means that we have to know what they are.<sup>8</sup>

There's another quotation that supports my point here, albeit in a less direct way. Freeman and Pryce say, "for a class to be easy to unit-test, the class must…be loosely coupled and **highly cohesive** —in other words, well-designed." Cohesion, in Bob Martin's mind, is closely linked with the idea of a class' responsibility, so this quote is almost a way of saying that unit testable classes are likely to follow the PSR.<sup>9</sup>

The second reason TDD helps us identify responsibilities is that a part of the TDD process is to eliminate duplication. Kent Beck actually has a nice summary of how this creates cohesion:

>The first feature goes in...the second feature, a variation on the first, goes in. **The duplication between the two features is put in one place, whereas the differences tend to go in different places (different methods or even different classes).**<sup>10</sup>

Quotations from famous software engineers aside, if we think for a second about what would happen if Bill tried to unit test his God class, I think we'll find some intuitive support for the idea that TDD exerts pressure to identify responsibilities.

For example, his app likely displays data in a format that's different from how its stored in the database. When writing a test to verify that his God object massages the data into a more presentable format correctly, he'll see that the database needs to have specific data pre-loaded in order for the test to pass. He could solve this problem by creating a sandbox database and pre-loading it with specific data, but it would be *easier* to unit test his class if he identifies "getting data from the database" as a separate responsibility, creates a class for it, and injects that dependency into his God class.

Testing other pieces of functionality of his application will require the same process, which, theoretically, will involve more identifying and separating of responsibilities.<sup>11</sup>

### Conclusion

The PSR is supposed to serve as a foundational principle for helping us write good software. However, the PSR isn't helpful if we fail to identify hidden responsibilities that our class may be assuming. Because identifying these responsibilities isn't trivial and because the PSR does nothing to help us with this non-trivial task, the PSR alone isn't very helpful.

TDD actually does a better job at helping us identify responsibilities. A class won't be easy to unit test unless we've identified and injected its dependencies, and to identify a dependency is to identify a responsibility. Eliminating duplication, moreover, forces us to identify and create abstractions to co-locate common functionality so that it can be reused, and to identify an abstraction is to identify a responsibility.

### Notes

1. Robert Martin, *Agile Software Development: Principles, Patterns, and Practices*, 110. Excerpt [here](https://drive.google.com/file/d/0ByOwmqah_nuGNHEtcU5OekdDMkk/view).

1. Steve Freeman and Nat Pryce, *Growing Object Oriented Software Guided by Tests*, 96-97.

1. Robert Martin, *Agile Software Development: Principles, Patterns, and Practices*, 114. Excerpt [here](https://drive.google.com/file/d/0ByOwmqah_nuGNHEtcU5OekdDMkk/view). Emphasis mine.

1. Michael Feathers, *Working Effectively with Legacy Code*, 350-352.

1. Perhaps this is why "naming things" is one of the two things that are hard about computer science, [according to Phil Karlton](https://martinfowler.com/bliki/TwoHardThings.html).

1. I think that a part of the reason finding responsibilities can be difficult is because we have to think at a level of abstraction that is actually lower than the one we were using when we decided to create the class in the first place. When Bill created the `Application` class, he did so because he thought, "I need a class that'll run my application." When he started writing database-related code in this class, he could continue to think "this code is just helping this class fulfill its responsibility of running the app," and in a sense, he would be right, but he'd be thinking at the wrong level of abstraction. Dropping down a level, he'd see that his Application class displays UI *and* talks to a database *and*...

1. David West, *Object Thinking*, 143-144.

1. Steve Freeman and Nat Pryce, *Growing Object Oriented Software Guided by Tests*, 43.

1. Ibid., 103-104.

1. Robert Martin, *Agile Software Development: Principles, Patterns, and Practices*, 109. Excerpt [here](https://drive.google.com/file/d/0ByOwmqah_nuGNHEtcU5OekdDMkk/view). Martin Actually sees the PSR as being first described using the language of cohesion. Personally, I prefer the vocabulary of cohesion to the PSR because a class can have cohesiveness in degrees. Somehow, the more gradient (vs. binary) way of thinking about class design along this dimension seems to fit better with the idea that identifying responsibilities is related to the level of abstraction we're on when we're thinking about a class, but my thoughts on this aren't well formed enough to say more.

1. Kent Beck, *TDD By Example*, 195.

1. Technically, this doesn't fit the definition of TDD because the tests are written last, but there is a real sense in which the tests are driving the re-design of Bill's app. This is why I say TDD is actually helping him design better classes.
