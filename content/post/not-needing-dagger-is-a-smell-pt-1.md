+++
slug = "not-needing-dagger-is-a-smell-pt-1"
draft = false
author = ""
share = true
image = "/images/trash.jpg"
tags = ["android","architecture"]
date = "2017-05-12T08:21:30-04:00"
title = "Not Needing Dagger is a Code Smell (Pt. 1)"
menu = ""
comments = true
+++

>A code smell is a surface indication that usually corresponds to a deeper problem in the system...smells don't always indicate a problem...You have to look deeper to see if there is an underlying problem there.

>--Martin Fowler

Some people don't think Dagger is very useful. I'm a bit suspicious of these people. An application that doesn't need Dagger smells. It suggests that there *might* be something wrong with the application's architecture. More specifically, it suggests there are problems its object graph.

Before I talk about these problems, I want to provide an initial argument for thinking that there's a connection between object-graph-related boilerplate and good application architecture. That's what this first post is about.

### A Quick Qualifier

Notice -- in keeping with Fowler's definition of a code smell -- I said that not needing dagger "suggests there *might* be something wrong with the application's architecture." It's perfectly possible to have a well-structured application that doesn't need Dagger. Not needing Dagger is a smell that "doesn't always indicate a problem." 

For example, you might have an application that's so small you don't really have any object-graph-related boilerplate. If you don't have any of that boilerplate, why add a library whose purpose is to reduce that boilerplate?

Still, I think there's a fair amount of applications that don't need Dagger *because* there are problems with the application's object graph.

### What's an Object Graph?

Its not very meaningful to say that an application has a problematic object graph if we don't know what an object graph is. Let's try to fix that now.

An object graph is a directed acyclic graph whose nodes are objects and whose arrows are dependency relationships. (Fun fact: directed acyclic graphs are also known as DAGs, which is where the name "Dagger" comes from.<sup>1</sup>) Let's look at an example.

Consider this piece of code Json parsing code from the `RemoteJsonHelper` class in the [Google I/O app](https://github.com/google/iosched/blob/e8c61e7e23f74aa6786696dad22e5136b423a334/server/src/main/java/com/google/samples/apps/iosched/server/schedule/input/fetcher/RemoteJsonHelper.java):

{{< highlight java "style=default" >}}
JsonReader reader = new JsonReader(
    new InputStreamReader(stream, Charset.forName("UTF-8"))
);
{{< / highlight >}}

There's an object graph here. We have a set of Java objects: [`JsonReader`, `InputStreamReader`, `InputStream`, `Charset`]. We also have a set of directed dependency relationships between these objects. For example, to build an `InputStream`, you have to build a `Charset`. 

We represent this object graph by placing the class names of the instances of objects in the circles that represent our graph's objects and placing arrows indicating the order in which our Java objects need to be constructed:

![object graph](/images/object-graph.svg) 

This object graph, translated to prose, says:

1. To build a `JsonReader`, build an `InputStreamReader`.
1. To build an `InputStreamReader`, build a `Charset` and an `InputStream`

So, that's a quick and dirty explanation of an object graph.<sup>2</sup>

### What's Object-Graph-Related Boilerplate?

Let's look at our example code again:

{{< highlight java "style=default" >}}
JsonReader reader = new JsonReader(
    new InputStreamReader(stream, Charset.forName("UTF-8"))
);
{{< / highlight >}}

If we have to create a `JsonReader` multiple times, we're stuck with some boilerplate. The only dependency that really needs to change from time to time is the `InputStream` dependency. We'll always need a utf-8 `Charset` and an `InputStreamReader`. Unfortunately, we're stuck writing some extra code to wire up our objects to give us a `JsonReader`.

"But can't we write a Factory?," you might protest? Sure we can. This reduces the duplication of the boilerplate, but we still have to write some pretty uninteresting code to make this happen, and as the Dagger docs say:

>the worst classes in any application are the ones that take up space without doing much at all: the BarcodeDecoderFactory, the CameraServiceLoader, and the MutableContextWrapper. These classes are the clumsy duct tape that wires the interesting stuff together.

This is a pretty tame example of boilerplate. I'll leave it to you to think about more intense examples of object-graph-related boilerplate.

### The Initial Argument

Alright. Now that we know what an object graph is, let's sketch out my argument. Remember: what we're trying to show here is that not needing Dagger is a smell.

To start off the argument, let's think for a second about why Dagger exists. Smart engineers at Google said to themselves, 

>If my application is well-structured, I wind up with a lot of boilerplate code that's concerned with constructing the object-graph. Let me build a library so that I don't have a bunch of boilerplate.

Guice was the first crack at a solution to this problem. The problem that it addressed must have been well-recognized by many other engineers, as it won [a Jolt Award](http://www.drdobbs.com/joltawards).

Next, some smart engineers at Square --- some of whom worked previously at Google --- said basically the same thing to themselves:

>If my application is well-structured, I wind up with a lot of boilerplate code that's concerned with constructing the object-graph. Guice is neat, but its a bit heavy on the reflection. Let me build a library so that I don't have a bunch of boilerplate without having to rely heavily on reflection.

So, these engineers build Dagger 1. Again, the library was met with lots of love.

Finally, some other engineers --- mostly from Google, but some from Square, and some from Square that used to be at Google --- built Dagger 2 to further reduce the use of reflection in their object-graph related boilerplate destruction library.

All of these efforts and all of the love for the various iterations of Java DI libraries reinforce this conditional:

>If my application is well-structured, I wind up with a lot of boilerplate code that's concerned with constructing the object-graph.

This is remarkable because the contrapositive of the conditional that expresses the problem that Dagger solves is this:

>If I don't have a lot of boilerplate code that's concerned with constructing the object-graph, then my application is not well-structured.

Obviously, there's going to be applications where the initial conditional is false. Like I said before, it's possible that small, well-structured applications won't lead to lots of boilerplate, so there will also be cases where the contrapositive is false.<sup>3</sup> 

Still, I think that all of this suggests that for many non-trivial applications, written in Java, there's a connection here between object-graph-related boilerplate and the quality of an application's architecture: If your application is well-structured, you're going to have some object-graph-related boiler plate.

### Conclusion

Admittedly, this is a pretty hand-wavy argument. Its just a sketch. Thinking about it a little more, it basically an appeal to the authority of expert developers at Google, Square, and the Jolt Award committee, along with a simple logic trick. 

If you don't buy that the devs at Google and Square know what they're doing, you won't find this compelling. I think there's probably a better argument for the claim that well-structured code leads to object-graph-related boilerplate, but the appeal to authority is easier to make. Hopefully, that's enough to convince some people.

### Notes: 

1. Don't believe me? Watch [Jake Wharton's talk on Dagger 1.](http://jakewharton.com/android-apps-with-dagger-devoxx/)

1. If you want a more detailed and possibly incorrect explanation of what an object graph is, checkout [my note on the subject]({{< ref "what-is-an-object-graph.md" >}}).

1. Its also completely possible that the object-graph related boilerplate has to do with the fact that Java is not a sufficiently powerful language for us to get our work done without boilerplate.