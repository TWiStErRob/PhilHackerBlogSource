+++
title = "Object Thinking's Intro"
comments = true
tags = ["oo programming","xp", "agile"]
draft = false
author = ""
date = "2017-05-03T08:57:08-04:00"
slug = "object-thinkings-intro"
menu = ""
share = true
+++

*Object Thinking*'s introduction begins with talking about the ongoing crisis in software:

>The time: 1968. A software crisis has been declared. Part of the crisis derives from the fact that more software is needed than there are developers to produce it. The other part of the crisis is the abysmal record of development efforts. More than half of the projects initiated are canceled, and less than 20 percent of projects are successfully completed...

In 2003, things are a bit better because we have more developers, but West seems to think that things are still looking pretty bad. Bad in what way? Well, this:

>It is still the case that almost half of all projects initiated are not completed. Those that are completed almost always incur significant cost overruns. Quality—the lack thereof—is still a major issue. Bloated, inefficient, bug-ridden, user-unfriendly, and marginally useful—these are still common adjectives used to describe software.

So far, so good. Unfortunately, all of this resonates with my limited experience in software.

The rest of the intro goes on to make a few major points:

1. There are two main responses to the software crisis: software engineering and agile. Software engineering is about better process and tools through formalization. XP/Agile is about creating better software developers, which, in turn, leads to better software.

1. Software engineering is the dominant response to the crisis, and its not working to resolve the crisis.

1. Agile -- and more specifically XP -- is inextricably linked with OO thinking and programming.

These points are not obvious, which is fine because that's partially what makes them interesting.

### Two sides

First off, I haven't been in software that long, so its hard for me to take seriously the idea that there is some sort of war going on between formalists and agile folks. West goes on the quote lots of folks that seem to be engaged in said war, and a quick search of Beck's *Extreme Programming* book reveals that it generated quite a stir when it was first published, but I still have a hard time picturing this struggle between the two groups. Its never something that I've heard older programmers talk about in my circles. 

(If you're reading this and you've got personal experience with this struggle, I'd love to hear your experience.)

### Software Engineering is sucking

West seems to paint software engineering as the dominant response to the software crisis. That seems plausible. 

At every job I've held, whenever software quality is poor, someone decides that we need to improve our processes. Ironically, this happens in the form of an agile coach or training session. Agile, according to West, is supposed to be people-focused, but that's definitely not how I've felt when I've attended (and even perpetrated) "agile" training sessions. Although it's ironic, this shouldn't be surprising given the "raspberry jam effect" and the fact Kent Beck has talked about how the whole agile movement has become something he doesn't even recognize.<sup>1</sup>

That software engineering is directly responsible for quality problems is less obvious. I read an article a while back that suggested that, deep down, our leaders don't really care about quality; there just aren't enough economic incentives for them to care about the buggy experiences or inelegant code, for example. That seems plausible to me. If that's true, I'm not really sure what that does to West's project in his book.

### Link between OO and Agile

For West, 

>XP cannot be understood, and those practicing XP will not realize the full potential of the approach, until they understand object thinking and the shared historical and philosophical roots of both object thinking and XP core values and practices.

Its hard to see how this could be true, especially because the link between OO and XP isn't emphasized in any of the seminal texts on XP, a fact that West points out:

>The terms object and object-oriented do not appear in any of the first five books in the Addison-Wesley XP series—except once, and that occasion points to an incorrect page in the text. However, object vocabulary and concepts are abundantly evident. This discrepancy merely confirms that object thinking is presupposed by those advocating XP.

However, I am just at the beginning of the book, so I'll have to revisit this. For now, since I'm not going to go back and read all of those books, I'm just going to have to take West's word for it.

Its a actually bit tricky to just trust West on this because it seems like West's book exists on a island, that is, without the endorsement or mention from any of the founding members of the agile alliance. Contrast this with a book like, *Domain Driven Design*, for example, that is explicitly praised by both Kent Beck and Martin Fowler, even though its written by someone who wasn't at the founding of agile.

### Notes:

1. Its in one of the segments in the "Is TDD Dead" series.