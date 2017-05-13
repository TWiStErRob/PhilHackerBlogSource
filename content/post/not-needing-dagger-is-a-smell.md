+++
slug = "not-needing-dagger-is-a-smell"
draft = true
author = ""
share = true
image = "/images/trash.jpg"
tags = ["android","architecture"]
date = "2017-05-12T08:21:30-04:00"
title = "Not Needing Dagger is a Code Smell"
menu = ""
comments = true
+++

>A code smell is a surface indication that usually corresponds to a deeper problem in the system...smells don't always indicate a problem...You have to look deeper to see if there is an underlying problem there.

>--Martin Fowler

Some people don't think Dagger is very useful. I'm a bit suspicious of these people. An application that doesn't need Dagger smells. It suggests that there *might* be something wrong with the application's architecture. More specifically, it suggests there's something wrong with its object graph.<sup>1</sup> 

Notice -- in keeping with Fowler's definition of a code smell -- I emphasized "might" in the previous sentence. It's perfectly possible to have a well-structured application that doesn't need Dagger. Not needing Dagger is a smell that "doesn't always indicate a problem." 

For example, you might have an application that's so small, you don't really have any object-graph-related boilerplate. If you don't have any of that boiler-plate, why add a library whose purpose is to reduce that boilerplate?

Still, I think there's a fair amount of applications that don't need Dagger *because* there are problems with the application's object graph. More specifically, I think not needing Dagger is a smell that points to an object graph that is "too rigid," "too tall," and/or "too skinny." These object-graph problems are in turn symptoms of an application with no dependency injection, bad abstractions, and/or missing abstractions, respectively. 

Before I talk about these problems, I want to provide an initial argument for thinking that there's a connection between object-graph-related boiler-plate and good application architecture. 

I want to give this initial argument because even if the particular story I tell about problems that the not-needing-dagger-smell points towards turns out to be wrong or unconvincing, you'll still have a reason to think that there is some connection between well-structured applications and needing Dagger.

### An Initial Argument

Let's think for a second about why Dagger exists. Smart engineers at Google said to themselves, 

>If my application is well-structured, I wind up with a lot of boiler-plate code that's concerned with constructing the object-graph. Let me build a library so that I don't have a bunch of boiler-plate.

Guice was the first crack at a solution to this problem. The problem that it addressed must have been well-recognized by many other engineers, as it won [a Jolt Award](http://www.drdobbs.com/joltawards).

Next, some smart engineers at Square --- some of whom worked previously at Google --- said basically the same thing to themselves:

>If my application is well-structured, I wind up with a lot of boiler-plate code that's concerned with constructing the object-graph. Guice is neat, but its a bit heavy on the reflection. Let me build a library so that I don't have a bunch of boiler-plate without having to rely heavily on reflection.

So, these engineers build Dagger 1. Again, the library was met with lots of love.

Finally, some other engineers --- mostly from Google, but some from Square, and some from Square that used to be a Google --- built Dagger 2 to further reduce the use of reflection in their object-graph related boiler-plate destruction library.

All of these efforts and all of the love for the various iterations of Java DI libraries reinforce this conditional:

>If my application is well-structured, I wind up with a lot of boiler-plate code that's concerned with constructing the object-graph.

This is remarkable because the contrapositive of the conditional that expresses the problem that Dagger solves is this:

>If I don't have a lot of boiler-plate code that's concerned with constructing the object-graph, then my application is not well-structured.

Obviously, there's going to be applications where the initial conditional is false. Like I said before, it's possible that small, well-structured applications won't lead to lots of boiler-plate, so there will also be cases where the contrapositive is false.<sup>2</sup> 

Still, I think that all of this suggests that for many non-trivial applications, written in Java, there's a connection here between object-graph related boilerplate and the quality of an application's architecture: If your application is well-structured, you're going to have some object-graph related boiler plate.

### The Problems the Smell Points Toward

Contrapositively, if you don't have object-graph-related boilerplate, there's something wrong with how your application structure. If you don't have object-graph-related boilerplate, you don't need Dagger. Here are some possible explanations for your lack of need for Dagger. In other words, here are the problems that the no-need-for-dagger-smell points towards.

#### Narrow Object Graph (no abstractions)

If we represent an object graph horizontally, then applications and classes that are missing abstractions are likely going to have "skinny" object graphs. Google I/O's `ExploreIOFragment` at whopping 987 lines, [as I've said before]({{< relref "" >}}), is the largest class in the io project, so its likely that there are some missing abstractions. Let's look at what its Object Graph looks like:

![ExploreIOFragment object graph](/images/)

Weight defined by number of objects from leaves to roots.

#### Rigid Object Graph (no DI)

#### Short Object Graph (bad abstractions)

height defined by eliminating repeating subgraphs.

### Notes: 

1. If you want a needlessly detailed and possibly incorrect explanation of what an object graph is, checkout [my note on the subject]({{< ref "what-is-an-object-graph.md" >}}).

1. Its also completely possible that the object-graph related boiler-plate has to do with the fact that Java is not a sufficiently powerful language for us to get our work done without boiler-plate.