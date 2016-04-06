+++
author = ""
comments = true
date = "2016-04-06T07:47:43-04:00"
draft = false
image = ""
menu = ""
share = true
slug = "abstraction-scope-and-bound-variables"
title = "Abstraction, Scope, and Bound Variables"

+++

Here's my big take away from sicp section 1.1.8:

# Abstraction requires Scope and Bound Variables

Procedures (or functions or methods) let us abstract our code. Abstraction is about dividing our program into identifiable tasks that can be reused in the construction of other (identifiable) tasks in our program, which can in turn be used to construct more complex identifiable tasks, etc.

In order for procedures to enable us to abstract our code, parameter names of a procedure must only have meaning within body of that procedure. To see this, suppose the opposite is true. Suppose, in other words, that parameter names of a procedure can have meaning outside the body of the procedure. If that's the case, then the following code is problematic:

```
(defn square [x] (* x x))
(defn good-enough? [guess x]
  (< (abs (- (square guess) x)) 0.001))
(good-enough? 1 2)
```

Using applicative-order evaluation, the last line of the above code simplifies to this:

```
(< (abs (- (square 1) 2)) 0.001)
```

Now, typically, the next step of substitution is results in (A):

```
(< (abs (- (* 1 1) 2)) 0.001)
```

However, if the `x` in `(defn square [x] (* x x))` can refer to an x that is outside the body of the method, then this `x`, in this case, could refer to the value passed in as the parameter named "x" for the `good-enough?` procedure call. In this case, the next step of the substitution would be (B):

```
; 2 is the value for x passed in to (good-enough? 1 2)
(< (abs (- (* 2 2) 2)) 0.001)
```

Clearly, (A) would evaluate differently than (B).
More importantly, if the above code evaluated to the result of evaluating (B), then the `square` procedure wouldn't actually serve as an *effective* abstraction, it would not be a piece of code that identifies a task that could be *effectively* reused in `good-enough?`. Why? Because we could break `square` simply by choosing the wrong name for the parameters of the procedure that uses `square`.

Because parameters of procedures only have meaning within the body of a procedure, they are said to be "bound" variables. Presumably, they are called this because their meaning is *bound* to the body of the procedure definitions for which they are arguments. The names have no meaning outside the procedure definition body. Free variables, on the other hand, have meaning outside of the procedure definition.

Abelson et. al haven't yet said that Scope and Bound variables are necessary for abstracting data, but I suspect that they will when I get to that chapter.

>From Sicp pgs. 34-35
