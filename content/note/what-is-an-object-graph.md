+++
date = "2017-05-13T16:12:32-04:00"
slug = "what-is-an-object-graph"
share = true
comments = true
image = ""
tags = ["discrete math","dependency injection"]
draft = false
author = ""
menu = ""
title = "What is an Object Graph?"

+++

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

Notice that the Java objects represented in this graph don't have any circular dependencies. This means that there are no cycles in the graph. If you follow the direction of the arrows, there's no way to go backwards. The graph is acyclic.

So, what we have here is a directed acyclic graph or a "DAG," which -- fun fact -- is where the name "Dagger" comes from.<sup>1</sup>