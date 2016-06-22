+++
comments = true
date = "2016-06-22T13:25:16-04:00"
draft = false
image = ""
share = true
slug = "vice-a-regression-test-generation-library"
tags = ["regression testing"]
title = "Vice: A Regression Test Generation Library"
+++

>Changes in a system can be made in two primary ways. I like to call them Edit and Pray and Cover and Modify...When you use Edit and Pray, you carefully plan the changes you are going to make, you make sure that you understand the code you are going to modify, and then you start to make the changes. When you’re done, you run the system to see if the change was enabled, and then you poke around further to make sure that you didn’t break anything...Cover and Modify is a different way of making changes. The idea behind it is that it is possible to work with a safety net when we change software...**When you have tests around the areas in which you are going to make changes, they act as a software vise. You can keep most of the behavior fixed and know that you are changing only what you intend to.**

>Michael Feathers, *Working Effectively with Legacy Code*, pg. 32-33

The "regression tests" that Feathers refers to in the above quotation are a huge asset to refactoring code. Unfortunately, they can often be time-consuming and soul-sucking to write. Vice is a library that I just started working on that helps to reduce the burden of writing these regression tests.

With Vice, we can simply exercise the code we want regression tests for, and Vice will generate our unit-level regression tests for us. This post sketches how my current proof of concept of this library and suggests some ways I plan to expand the library, with special attention to how this library might aid in generating regression tests for Android applications. You can find the source code [here](https://github.com/kmdupr33/Vice).

### A Trivial Proof of Concept

Suppose we have a simple class that reverses a string:

{{< highlight java "style=default" >}}
public class Reverser {
    public String reverse(String string) {
        return new StringBuilder(string).reverse().toString();
    }
}
{{< / highlight >}}

Suppose further that we don't like the way `Reverser.reverse` is implemented. If we want to be sure that our modifications don't break anything, we would normally write a unit test for this method that looks like this:

{{< highlight java "style=default" >}}
public class ReverserCharacterization {
  @Test
  public void characterizeReverse() {
    Reverser reverser = new Reverser();
    final String result = reverser.reverse("hello");
    assertEquals("olleh", result);
  }
}
{{< / highlight >}}

Vice allows us to generate tests by simply writing code that exercises the classes for which we want tests. Let's look at the Vice code that generates the above test.

First, we create a `ViceMaker` object:

{{< highlight java "style=default" >}}
@ViceFor(Reverser.class)
public class ViceMaker {
    @Clamp
    public void clampReverse(Reverser reverser) {
        reverser.reverse("hello");
    }
}
{{< / highlight >}}

Next, we run `Vice.make`, passing in the class of our `ViceMaker` and the path where we want our generated tests to live:

{{< highlight java "style=default" >}}
final Vice vice = new Vice();
final String pathToGeneratedCharacterizationTest
        = "/Users/mattdupree/Developer/Vice/src/test/java/";
final Path testFilesPath = Paths.get(pathToGeneratedCharacterizationTest);
vice.make(testFilesPath, ViceMaker.class);  
{{< / highlight >}}

Once the above code is run, you'll have regression test generated with code that is identical the code we would have written:

{{< highlight java "style=default" >}}
public class ReverserCharacterization {
  @Test
  public void characterizeReverse() {
    Reverser reverser = new Reverser();
    final String result = reverser.reverse("hello");
    assertEquals("olleh", result);
  }
}
{{< / highlight >}}

Once this code is generated, you can ensure that your refactoring doesn't break `Reverser` simply by running your tests.

In order to accomplish this, I'm using reflection and [bytebuddy](http://bytebuddy.net/#/), a library that lets us rewrite java classes at runtime. With these two tools I'm rewriting the classes we want to generate regressions tests for so that every method on that class records its method invocations. This "recording" captures what method was called, the arguments that were passed in, and the return value of the method. Once I have this information, I use [javapoet](https://github.com/square/javapoet) to write out java test files.

### Limitations and Future Directions

#### Supporting Void Methods

Currently, my proof of concept only supports adding tests for methods with return values. However, I'd like to expand it to test methods that don't return anything. Void methods are typically tested by examining the way in which those methods interact with their dependencies. Using bytebuddy, I can rewrite the dependencies of the methods we want to test so that they record their interactions. Once I have this information, I can generate mockito-powered tests that verify that the method interacts with its dependencies correctly.

#### Supporting Complex Method Parameters

As I said earlier, bytebuddy let's me rewrite the target classes so that they record the parameters that are passed into their methods. However, this is not enough. The tests that are generated will need to know how to construct complex method parameters so that methods can be invoked. To support this, the `ViceMaker` object can contain annotated methods that provide the dependencies of the methods whose interactions we want to record.

#### Supporting Android Test Recording

In the next release of Android Studio, we'll be able to record espresso tests. These tests are great, but they can be slow and flaky, so they need to be augmented with unit tests.

Ideally, I'd like to build upon the functionality of Vice to support Android *unit test* recording. This functionality is less fleshed out in my mind, but it seems doable. The hope here is that you'd be able to launch your Android app, interact with it and your interactions would generate unit tests for your activities and fragments. These unit tests will allow us to move application logic out of our Activities and Fragments without having to spend an inordinate amount of time writing and running regression tests.