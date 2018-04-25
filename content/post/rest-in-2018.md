+++
share = true
comments = true
image = ""
slug = "rest-in-2018"
date = "2018-04-24T18:17:23-04:00"
menu = ""
tags = ["rest","graphql", "SPAs"]
draft = false
author = ""
title = "The so-called 'RESTful' web in 2018 and beyond"
+++

Recently, I've been wondering,

>Should new APIs created in 2018 be RESTful or be built using graphql or be something else entirely?

While pondering and researching this question, I've stumbled upon some broader realizations like,

* Most web APIs and SPAs aren't actually RESTful. 😨 In fact, I've never worked with a completely RESTful API.
* We're reinventing the wheel and making our lives harder --- on the server and on the client --- by ignoring the standards around REST APIs 😞
* The same force that explains our half-ass adoption of REST (i.e., crappy internet) also explains the popularity of graphql and this force is actually what often makes REST a bad trade-off (I've actually stumbled upon the part of Roy Fielding's dissertation that recognizes this trade-off!)
* There's a way to capture the compelling and still unfulfilled promises of REST in graphql (viz., by embedding hypermedia controls in our graphql APIs) 👍️

I thought these realizations were pretty interesting and worth sharing. Here I go.

### "RESTful" 😒 APIs

I'm not going to give a complete definition of REST here, but one thing that most so-called RESTful APIs are missing is "hypermedia." It turns out that Roy Fielding, the creator of REST, has actually explicitly complained about this:

>What needs to be done to make the REST architectural style clear on the notion that hypertext is a constraint? In other words, if the engine of application state (and hence the API) is not being driven by hypertext, then it cannot be RESTful and cannot be a REST API. Period. Is there some broken manual somewhere that needs to be fixed?[^1]

That was written in 2008, but Leonard Richardson et. al. basically have said they same thing in their excellent 2013 book _RESTful Web APIs_,[^2] and reflecting on my experience of _consuming_ "RESTful APIs" and the REST constraint of "hypermedia as the engine of application state," (HATEOS) it seems like Fielding's complaint is just as valid today as it was 8 years ago.

Let me lift Richardson et. al.'s explanation of the HATEOS constraint out of their book, just so you can do a mental check yourself to see if you've ever worked with a RESTful API:

>1. All application state is kept on the client side. Changes to application state are the client's responsibility.
>
>1. The client can only change its application state by making an HTTP request and processing the response.
>
>1. How does the client know which requests it can make next? By looking at the hypermedia controls in the representations it's received so far.
>
>1. Therefore, hypermedia controls are the driving force behind changes in application state.[^3]

Looking at each point here, my checklist on typical projects looks like this:

1. ✅ 😎
1. 🚫 Application state changes without talking to the server in both mobile apps and web SPAs
1. 🚫 Nope. The client knows which requests to make next becuase I've hardcoded those requests into my client based on the docs of an API.
1. 🚫 No one even talks about hypermedia.

### We're reinventing the wheel

Fielding and his REST folks aren't being pedantic in pointing out that we're missing hypermedia in our "REST" APIs. Richardson et. al. actually call hypermedia "the single most important aspect of REST,"[^4] and they make a pretty compelling case that hypermedia matters.

Richardson et. al. give us a nice example of why hypermedia and standards matter by spending quite a bit of time spelling out how we could save a lot of code and time on the server and on the client if we stopped inventing fiat standards for how collections work in our APIs. What if all JSON payloads for all APIs that wanted to talk about collections of resources had some _the same way of telling clients_:

1. How to fetch additional details about an item in a collection?
1. How to fetch the next or previous page of items in a collection?
1. How to add an additional item to a collection?[^5]

There are a bunch of standards that try to add hypermedia to collections. Here's one called "collection+json" (modified from [the original example](http://amundsen.com/media-types/collection/examples/)) just so you can get an idea:

```json
{
  "href" : "http://example.org/friends/",
  "links": [
    {
      "name": "next_page",
      "rel":"next",
      "href":"/friends/page/2",
      "render":"link"
    }      
  ],
  "items" : [
    {
      "href" : "http://example.org/friends/jdoe",
      "data" : [
        {"name" : "full-name", "value" : "J. Doe", "prompt" : "Full Name"},
        {"name" : "email", "value" : "jdoe@example.org", "prompt" : "Email"}
      ],
    }      
  ],          
  "template" : {
    "data" : [
      {"name" : "full-name", "value" : "", "prompt" : "Full Name"},
      {"name" : "email", "value" : "", "prompt" : "Email"},
      {"name" : "blog", "value" : "", "prompt" : "Blog"},
      {"name" : "avatar", "value" : "", "prompt" : "Avatar"}
    ]
  }
} 
```

Here's how a payload like this would enable standard client state transitions:

1. If you want get more info about an item in a collection, you make a GET request to that item's `href` property.
1. If you want to get the next page, you make a GET request to the `href` property belonging to the `link` whose `rel` property is "next."
1. If you want to add an item to a collection, you make a POST request at the top-level `href` and pass in a json body that has a structure suggested by the top-level `template` property.

API designers wouldn't have to think about how to structure their collection JSON or about how to structure pagination or about the structure of HTTP request needed to add a new item to the collection.

Programmers working on clients could use client libraries that make implementing paging through data much simpler. The client library would know how to find the API call to make to display data for the next page in the collection. Or, they could use a library that makes it easy to navigate from a list to an item. The client library would know and could make the request for an item within a collection automatically once a user taps a button.

### Why the half-ass adoption of REST and why graphql?

Obligatory P&R reference:

!["Never half-ass two things. Whole ass one thing. Ron Swanson"](/images/swanson-wisdom.jpg)

Anyway, with all of the lip service being paid to the RESTful web, how is it that we find ourselves in a situation where most of our services aren't RESTful and we're reinventing the wheel? Why has our adoption of REST been mostly[^6] half-assed?

The relevant force here is "crappy internet."[^7] Even with the improvements brought on by SPDY and HTTP 2,[^8] crappy internet --- especially on phones --- makes it hard to create software that

1. feels fast
1. works with limited connectivity

The "feels fast" constraint drives the push towards SPAs. With SPA's, the whole point is to avoid talking to server for every application state transition, which runs directly counter to REST. This makes the idea of hypermedia in particular an anathema. Hypermedia gives the client the resource and application state transitions it can make "just in time." It turns out that REST's "just in time" delivery of hypermedia controls takes too damn long.

This wouldn't be so bad if it weren't for the "limited connectivity" issue. Hypermedia increases the size of resource representations. The above collection+json friends collection payload could look like this:

```json
{
  "items" : [
    {
      "fullName": "J. Doe",
      "email":"jdoe@exmaple.org"      
    }      
  ]  
} 
```

This is much more compact than the JSON payload with hypermedia controls. If we're working with spotty connections and limited data, the more compact our messages, the better.

It turns out this same force --- crappy internet --- is what's driving adoption of graphql, and if we look specifically at what what people want out of graphql, we'll find that they're just making a different trade-off than the one that the pioneers of REST --- _with eyes wide open_ --- made when it was being formulated. 

In his dissertation, Fielding recognizes that RESTful APIs could result in extra calls _and_ more information than is needed for certain clients:

>Implementations are decoupled from the services they provide, which encourages independent evolvability. The trade-off though, is that a uniform interface degrades efficiency, since information is transferred in a standardized form rather than one which is specific to an application's needs. The REST interface is designed to be efficient for large-grain hypermedia data transfer, optimizing for the common case of the Web, but resulting in an interface that is not optimal for other forms of architectural interaction.[^9]

By including a "uniform interface" as a part of REST, Fielding traded client efficiency for independent evolvability. 

Because of the issues with the internet connectivity, for some companies, _this has actually turned out to be a bad trade-off_. If you look at why companies are adopting graphql, it looks like the more urgent problem is actually client efficiency.

Both facebook and github --- probably the two biggest adopters of graphql --- mention how important it is that their clients can ask for many resources in one request and they talk about how useful it is for their clients to get exactly what they've asked for and nothing more.[^10] 

Facebook's need for client efficiency is so strong that they've basically just _given up on independent evolvability._ In [his 2016 GraphQL Summit keynote](https://www.youtube.com/watch?v=zVNrqo9XGOs), Lee Byron noted that facebook just hasn't made a breaking change to their API in four years.

### GraphQL + REST, the good parts

Even if we decide that in 2018 graphql is often a way of building web APIs, we don't _have_ to give up on all of the benefits that come along with RESTful APIs. Specifically, we don't have to give up on the still unrealized benefit of hypermedia: standardized Web API interfaces that enable smarter clients which will save API designers and client programmers design and coding time.

Marc-André Giroux over at Github has already started thinking about this, and has [a neat post on how we can include hypermedia-esque info in graphql mutation](https://medium.com/@__xuorig__/graphql-mutation-design-hypermedia-graphql-api-faf03f3a898a) responses to inform the client which mutation it can perform next. Graphql has a concept of interfaces which can be adopted by the types we define, so there's no reason why we can't agree on a standard set of interfaces that have hypermedia controls describing which queries and mutations a client could make at a certain point.

Phil Sturgeon takes the other side on this issue in his ["Representing State in REST and GraphQL."](https://blog.apisyouwonthate.com/representing-state-in-rest-and-graphql-9194b291d127) He thinks that trying to include hypermedia in a graphql would be "a bit of a mess" because he thinks Graphql was "designed to exclude [hypermedia]." The documentation for graphql doesn't mention hypermedia at all, and hypermedia isn't discussed in the couple of Lee Byron introductions to graphql that I've watched, so I don't think graphql is at all intentional about excluding hypermedia. 

I think that Graphql --- like JSON --- can be a vehicle for hypermedia. It just depends on whether we want to start spending the time to invest in standard hypermedia-esque controls that work with Graphql.

### Conclusion

Of course, I could be wrong about all this. I haven't spent much time with graphql, but it definitely looks like in 2018 with our crappy internet issues, its worth looking into. Setting aside crappy internet, the convenience of having an application-specific interface make graphql worth considering. 

Both Fielding and Richardson et. al. are trying to support independent evolvability with REST, but it seems perfectly reasonable that we may find ourselves in situations where independent evolvability isn't the biggest problem we face.[^11] Having a convenient interface to work with on clients that are probably going to be updated that mitigate issues caused by spotty and slow internet connections with the option of adding hypermedia-esque controls seems like a pretty sweet stop to be in. 

As long as there are other big issues aside from extensibility of APIs and the desire for smarter clients, the missing feature of most APIs that would make them truly RESTful (hypermedia) may only live on in a as an optional add on in REST-ish graphql APIs. 

---

## Footnotes

[^1]: ["Rest APIs must be Hyper-text Driven,"](http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven) Roy Fielding.

[^2]: Not to be confused with their 2008 _RESTful Web Services_, which, given its raving review by DHH, seems to be _the book_ on RESTful APIs.

[^3]: _RESTful Web APIs: Services for a changing world_, "Appendix C: An API Designer's Guide to Fielding's Dissertation."

[^4]: Ibid., "Hypermedia is Hard."

[^5]: Notice that these are all _hypermedia controls_; they all are ways of the server telling the client how to change its state my making an appropriate http request.

[^6]: Interestingly, it seems like Google has been more aggressive in adopting some of the RESTful standards that most of us have ignored. (I'm thinking specifically of JSON-LD, which is used in their page [data types for providing special UI around search results](https://developers.google.com/search/docs/guides/search-features).) This makes sense. Search engines have a vested interest in having us structure the web in such a way that a standard, non-human client can navigate the web using hypermedia controls. 

[^7]: I do wonder, however, how much more RESTful things would be if Mobile hadn't started its hype-train right in 2007, which, according to Richardson et. al. is the same time that REST was really getting its solid footing against SOAP. Just as REST was trying to capture our imaginations, mobile came along and stole the show, storming on to the scene with 0 affinity towards REST.

[^8]: It looks like Facebook was actually an early adopter of SPDY and Http 2. Apparently, the performance improvements from this weren't good enough.

[^9]: _Architectural Styles and the Design of Network-based Software Architectures_, "5.1.5 Uniform Interface," Roy Thomas Fielding. 

[^10]: Facebook mentions these things directly on [graphql.org](http://graphql.org). Github mentions them in [their docs on why they're using graphql for v4 of their api](https://developer.github.com/v4/#why-is-github-using-graphql).

[^11]: Richardson et. al. summarize the tradeoffs with REST and hypermedia nicely towards the end of their book. They say, "If you have some way of forcing all your clients to upgrade in lockstep, you can give up 'Internet-scale.' Then you can have a 'low entry-barrier' and 'extensibility' without needing to use 'distributed hypermedia'." We can't force clients to upgrade, but automated browser and app updates definitely help us live without hypermedia.