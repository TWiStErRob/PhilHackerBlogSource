+++
date = "2017-05-13T18:14:25-04:00"
title = "not needing dagger is a smell pt 2"
draft = true
author = ""
menu = ""
tags = ["android","architecture"]
share = true
comments = true
image = ""
slug = "post-title"

+++

I wanted to give that initial argument because even if the particular story I'm about to tell about problems that the not-needing-dagger-smell points towards turns out to be wrong or unconvincing, you'll still have a reason to think that there is some connection between well-structured applications and needing Dagger.

More specifically, I think not needing Dagger is a smell that points to an object graph that is "too rigid," "too tall," and/or "too skinny." These object-graph problems are in turn symptoms of an application with no dependency injection, bad abstractions, and/or missing abstractions, respectively. 

### The Problems the Smell Points Toward

Contrapositively, if you don't have object-graph-related boilerplate, there's something wrong with how your application structure. If you don't have object-graph-related boilerplate, you don't need Dagger. Here are some possible explanations for your lack of need for Dagger. In other words, here are the problems that the no-need-for-dagger-smell points towards.

#### Narrow Object Graph (missing abstractions)

If we represent an object graph horizontally, then applications and classes that are missing abstractions are likely going to have "skinny" object graphs. Google I/O's `ExploreIOFragment` at whopping 987 lines, [as I've said before]({{< relref "" >}}), is the largest class in the io project, so its likely that there are some missing abstractions. Let's look at what its Object Graph looks like:

![ExploreIOFragment object graph](/images/sessiondetailfragog.svg)

#### Short Object Graph (bad abstractions)

height defined by eliminating repeating subgraphs.

#### Rigid Object Graph (no DI)