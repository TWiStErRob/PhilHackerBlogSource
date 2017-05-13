+++
slug = "dagger-as-an-object-graph-canary"
draft = true
author = ""
share = true
image = "/images/mine.jpg"
tags = ["android","architecture"]
date = "2017-05-12T08:21:30-04:00"
title = "Dagger as an Object Graph Canary"
menu = ""
comments = true
+++

Miners used to bring canaries with them to work. These canaries served a useful purpose: they'd alert the miners if there were dangerous levels of poisonous gasses building up in the mine. This, of course, is the metaphor behind Square's [Leak Canary library](https://www.google.com/search?q=leak+canary&oq=leak+canary&aqs=chrome..69i57j69i61j69i65j69i60l2j69i61.1094j0j7&sourceid=chrome&ie=UTF-8). 

Lately, I've been exploring how TDD serves as a kind of architectural canary for our Android projects. When we have a hard time testing our android app classes, that's the TDD canary warning us that those classes have [tight coupling]({{< relref "what-unit-tests-are-trying-to-tell-us-about-activities-pt-2.md" >}}) and [low cohesion]({{< relref "test-driving-away-coupling-in-activities.md" >}}).

More recently, I realized that Dagger can actually be seen as a very specific kind of architectural canary: it gives us insight into health of our application's object graph. Some people don't think Dagger is very useful or necessary, but I think at least some of these people only think this because they are ignoring the architectural warning that Dagger is trying to give them: their object graph is messed up.

This post is about why I see Dagger as a kind of object graph canary and the specific warnings that Dagger can give us about our application's object graph.

### What is an Object Graph?

Before we can understand object graphs, we need to briefly talk about graphs. Disclaimer: I'm just getting acquainted with graphs myself, so don't take my explanation here too seriously. 

When I hear the word "graph," I always think of graphs on a cartesian coordinate system. That's not what we're talking about here. Perhaps the easiest way of introducing graphs is to look at a visual representation of one:

![graph](/images/graph.svg)

What are we looking at here? We see a set of objects represented by circles. The set is [6, 4, 5, 1, 3, 2]. 

We also see that a subset of those objects have some relationship to one another, which is represented by the lines. These relationships form another set of the related pairs. 6 and 4 are connected, so that's one pair: (6,4). (4, 3) is another pair, since those two circles are connected. Etc. 

We wind up with this set: [(6, 4), (4, 5), (4, 3), (5, 2), (5, 1), (3, 2)]. 

So, a graph is a set of objects that has at least one subset of objects which are interrelated.

Some graphs are directed graphs. Their visual representation is similar to ordinary, undirected graphs, except that they have arrows instead of lines connected the circles:

![directed graph](/images/directed-graph.svg)

We have our same old set of objects ([6, 4, 5, 1, 3, 2]), but this time the pairs represented by the lines are ordered. (6, 4), not (4, 6) would be in the set of ordered pairs because of the direction of the arrow. (2, 1) wouldn't make the cut, again because of the direction of the arrow. Etc.

We wind up with this set of ordered pairs: [(6, 4), (4, 5), (5, 1), (1, 2), (2, 5), (2, 3), (3, 4)].

Ok. Enough abstract stuff. Let's reel this back in to programming.

I've been saying graphs consist partially of sets of objects. This may be confusing because I don't mean a programmer's object. Sorry. English is messy sometimes. 

Instead, I mean "object" as an abstraction over particular things. You could have a graph of people, tasks, or countries. These are all graphs of "objects."

You could also have a graph whose objects are a programmer's objects. This graph would be directed, and the directed relationships between those objects could between dependency relationships: an arrow pointing from X to Y would signify that in order to build object Y, you first have to construct object X. In that case, you'd have an object graph. 

Consider this piece of code Json parsing code from the [Google I/O app](https://github.com/google/iosched/blob/e8c61e7e23f74aa6786696dad22e5136b423a334/server/src/main/java/com/google/samples/apps/iosched/server/schedule/input/fetcher/RemoteJsonHelper.java):

{{< highlight java "style=default" >}}
JsonReader reader = new JsonReader(
    new InputStreamReader(stream, Charset.forName("UTF-8"))
);
{{< / highlight >}}

There's an object graph here. We have a set of Java objects: [`JsonReader`, `InputStreamReader`, `InputStream`, `Charset`]. We also have a set of directed dependency relationships between these objects. For example, to build an `InputStream`, you have to build a `Charset`. 

We might represent this object graph by placing the class names of the instances of objects in the circles that represent our graph's objects and placing arrows indicating the order in which our Java objects need to be constructed:

![object graph](/images/object-graph.svg)

### Dagger as an Object Graph Canary

### The Canary's Warnings

#### Rigid Object Graph (no DI)

#### Shallow Object Graph (no abstractions)

#### Complex Object Graph (bad abstractions)