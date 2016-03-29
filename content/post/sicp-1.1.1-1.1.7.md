+++
author = ""
comments = true
date = "2016-03-29T18:02:27-04:00"
draft = true
image = ""
menu = ""
share = true
slug = "sicp-111-117"
tags = ["sicp"]
title = "Sicp 1.1.1-1.1.7"
+++

Today was my first work day at [the Recurse Center](recurse.com). Yesterday, I found out that there's an [SICP](https://mitpress.mit.edu/sicp/full-text/book/book.html) study group. I've been wanting to study SICP for a while now, so naturally I joined. What follows are my thoughts and key take-aways from sections 1.1.1-1.1.7.

# Declarative vs. Procedural Knowledge

Abelson et al. open the book with a really interesting distinction between declarative and procedural knowledge. Moreover, they suggest that the most significant achievement of computer science is that it provides a way for us to study procedural knowledge.

>...‘‘computer science’’ is not a science and...its significance has little to do with computers. The computer revolution is a revolution in the way we think and in the way we express what we think. The essence of this change is the emergence of what might best be called procedural epistemology -- the study of the structure of knowledge from an imperative point of view, as opposed to the more declarative point of view taken by classical mathematical subjects. Mathematics provides a framework for dealing precisely with notions of ‘‘what is.’’ Computation provides a framework for dealing precisely with notions of ‘‘how to.’’

This distinction comes out more clearly in section 1.1.7 when they emphasize the difference between a procedure in scheme and a mathematical function. This difference is brought out with an example function definition for the square root:

>sqrt (x) = the y such that y >= 0 and y^2=x

Although this is a perfectly valid function definition for mathematics, it tells us nothing about how to define a procedure that will return the square root of x. After pointing this out, the authors connect the difference between procedures and functions with their distinction between procedural and declarative knowledge:

>The contrast between function and procedure is a reflection of the general distinction between describing properties of things and describing how to do things, or, as it is sometimes referred to, the distinction between declarative knowledge and imperative knowledge. In mathematics we are usually concerned with declarative (what is) descriptions, whereas in computer science we are usually concerned with imperative (how to) descriptions.

There are two main thoughts I have about these passages.

First, the distinction between declarative vs. procedural knowledge is philosophical interesting. It raises interesting questions about the relationship between these types of knowledge. The definitions of these two types of knowledge could probably use some further clarification, but once they are clarified, we can ask: Does procedural knowledge depend on declarative knowledge? Is it possible that procedural knowledge reduces to declarative knowledge? If we acknowledge something like procedural knowledge and it turns out that the knowledge doesn't reduce to declarative knowledge, then are we committed to [Platonism](http://plato.stanford.edu/entries/platonism/) about algorithms? [My philosophy days are over](http://www.philosophicalhacker.com/2014/04/22/why-im-glad-my-dream-job-didnt-work-out/), but it was interesting to briefly think about these questions anyway.

Second, I think that this distinction means that some of our programming languages are misleading. Go, for example, uses the `func` keyword to define a "function" in go. However, many of the functions we define in go are definitely not functions in the mathematical sense of the word, and as the above example points out, mathematical functions often fail to map neatly on to the stuff we put in our `func` bodies.

# A definition of syntax

The authors do a great job of explaining what it means for a language to have a syntax. Crucial to understanding "syntax" is the idea of an "expression." An expression is something that can be evaluated. Each type of expression has an evaluation rule. For example, the expression `42` evaluates to `42` in Lisp. So, the evaluation rule for the type of expression exemplified by `42` must be something like "simply return the expression as is."

A language has different types of expressions, and these other expression types have more complicated evaluation rules. For example, Lisp has expressions called "combinations." Here's an example of a combination:

```
(+ 1 2)
```

This combination evaluates to `3`.

Combinations have a *recursive* evaluation rule:

>1. Evaluate the subexpressions of the combination.
>2. Apply the procedure that is the value of the leftmost subexpression (the operator) to the
arguments that are the values of the other subexpressions (the operands).

Now that we have a decent understanding of expressions, the author's definition of syntax will (hopefully) be clear:

>The various kinds of expressions (each with its associated evaluation rule)
constitute the syntax of the programming language.

From this definition, I suspect that we can infer that there are at least two kinds of syntax errors:

1. Errors that result from using an expression type that is not recognized by the language. (E.g., try to use the keyword `func` to define a method in Java)
1. Errors that result from violating assumptions made by the evaluation rule for an expression. (E.g., try to use a non-final variable within a lamdba in Java)

These two kinds of errors seem to cover the syntax errors I've run into. Maybe there are more.


# Code is data

Early on, the authors make a distinction between procedures and data:

>In programming, we deal with two kinds of elements: procedures and data. (Later we will discover that they are really not so distinct.) Informally, data is ‘‘stuff’’ that we want to manipulate, and procedures are descriptions of the rules for manipulating the data.

As you can see in this quote, however, the authors are quick to point out that the distinction between procedures and data is actually pretty tenuous. I don't think I've made it to the point in the text where they explicitly say why the distinction doesn't hold up, but there are few points in these sections that already suggest some important similarities between the two:

1. It can be helpful to think through the results of both procedures and data by using a substitution model.
1. Defining variables names and procedure names both serve to make our code more abstract, thereby making it more manageable to write more complex programs.
