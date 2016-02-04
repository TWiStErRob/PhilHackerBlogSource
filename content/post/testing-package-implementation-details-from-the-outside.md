+++
comments = true
date = "2016-02-03T21:30:42-05:00"
draft = false
share = true
slug = "testing-package-implmentation-details-from-the-outside"
tags = ["go"]
title = "Testing Package Implementation from 'the Outside'"
+++

Sometimes you need to test a package's implementation from outside of the package containing the implementation you'd like to test. This post briefly covers why this need arises and how we can meet  that need. Much of the information here is already covered in Andrew Gerrand's [testing techniques talk](https://www.youtube.com/watch?v=ndmB0bj7eyw), so if you've watched that, you'll probably only think the last section of this post is interesting.

### Why?

Like I just said, sometimes you need to test a package's implementation from outside of the package containing the implementation you'd like to test. Typically, this situation happens because of circular dependency.

For example, because the testing package depends on the fmt package, the standard library authors couldn't place the tests for the fmt package within the fmt package itself without introducing a circular dependency. To avoid this circular dependency, the fmt tests are actually located in the fmt_test package.

Don't believe me? Have [a look](https://github.com/golang/go/blob/master/src/fmt/fmt_test.go).

Here's another example: as I said in [my post on gomock](http://www.philosophicalhacker.com/post/getting-started-with-gomock/), you can often wind up with circular dependencies while using gomock. You're tests will depend on the package containing your mocks and your mocks will depend on the package containing the interfaces it mocks. If your tests are in the same package as the code you're mocking, then you'll introduce a circular dependency between package containing the code you want to test and the package containing your mocks. Again, the solution here is to move your tests outside of the package containing the code you want to test.

Although the tests are outside of the package you are testing, you may still want to test the implementation details of that package. In other words, you may want to test parts of that package's un-exported interface. For example, the authors of the standard library wanted to test the `isSpace()` function from the fmt package.

### How

In order to test the `isSpace()` function from outside of the fmt package, the standard lib authors created a export_test.go file in the fmt package. This file simply exports the parts of the un-exported interface that they wanted to test:

{{< highlight go "style=default">}}
//export_test.go
package fmt

var IsSpace = isSpace
{{< / highlight >}}

This file ensures that the `isSpace()` function is available to the fmt tests as `IsSpace()`. Importantly, because this file has a \_test.go prefix, it is only compiled when the `go test` command is run, thereby ensuring that no clients outside of the testing package can access the `isSpace()` function.

Sometimes, however, we want to test more than just an un-exported function from a package. Sometimes, we may want to test the methods of an un-exported struct. Say you've got a struct like `lruCache`:

{{< highlight go "style=default">}}
//cache.go

type lruCache struct {
	//...
}

func (s *lruCache) GetGopher(name string) (Gopher, error) {
	gopher, ok := s.CachedGophers[name]
	if !ok {
		return s.GopherFinder.Find(name)
	}
	return gopher, nil
}

Now, suppose you wanted to test the `GetGopher()` method. This can be accomplished by combining the above technique with struct embedding:

{{< / highlight >}}

{{< highlight go "style=default">}}
//export_test.go

type LRUCache struct {
	lruCache
}
{{< / highlight >}}

Now, in order for this to work, the `GetGopher()` method has to be exported. This doesn't break encapsulation, however, because an exported method on an un-exported type will still be unaccessible to clients outside of the package.

### Conclusion

You just learned how to test package implementation details from "the outside." This will come in handy when you break a circular dependency between your test code and the package you're testing by placing the test code outside of the package you're testing.

You're welcome.
