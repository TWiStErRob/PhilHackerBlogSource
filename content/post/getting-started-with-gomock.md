+++
author = ""
comments = true
date = "2016-01-20T10:43:26-05:00"
share = true
tags = ["go"]
title = "Getting started with Gomock"
+++

In [my last post](http://www.philosophicalhacker.com/2016/01/13/should-we-use-mocking-libraries-for-go-testing), I talked about why I started using gomock, a mocking library that facilitates testing in go. If you found what I said in that post at all compelling, you might have decided to give gomock a try and you might have noticed that the documentation isn't as helpful as it could be. This post is meant to supplement the documentation. It's a brief tutorial on how to get started with gomock.

<!--more-->

### Your first mock-utilizing test

To get started using gomock, first follow the installation instructions laid out in the gomock [repo's readme][2]. Once you've installed gomock, you can start generating mocks for your tests. Let's explore how gomock works with an example.

[2]: https://github.com/golang/mock

Suppose you're writing a simple server that allows users to lookup go programmers (gophers) by name. The handler function for that server might look something like this:

{{< highlight go "style=default">}}

func FindHandler(gf GopherFinder) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		gopher, err := gf.Find(r.URL.Path[1:])
		if err != nil {
			w.WriteHeader(500)
			return
		}

		gopherBytes, err := json.Marshal(gopher)
		if err != nil {
			w.WriteHeader(500)
			return
		}

		w.Write(gopherBytes)
	}
}
{{< / highlight >}}

Now, say we want to write a unit test that ensures that this function works properly. The first thing that this function should do is pull the gopher's name data off of the `Request` struct and pass that name into the `Find()` method of the `GopherFinder`. With Gomock, we can create a mock `GopherFinder` that will fail the test if it does not receive a call to `Find()` with the appropriate arguments.

First, we generate the file that will allow us to mock `GopherFinder` by running following command:

```
mockgen -destination mock_gopher_finder.go \
github.com/kmdupr33/philhackerblogcode \
GopherFinder
```

This command takes two arguments. The first argument is an import path leading to the *interfaces* that you want to mock. The second argument is a comma separate list of interfaces to mock.<sup>1</sup>

The command also takes several flags, but the most import flag to pass in is the `-destination` flag. This flag specifies the the file you want the mock source code to live in. Without this flag, the generated mock code is simply printed to standard output.

Now that we've generated the code to support our mock `GopherFinder`, we can create a mock for a test of the `FindHandler`:

{{< highlight go "style=default,hl_lines=17">}}
package philhackerblogcode_test

import (
	//...

	. "github.com/kmdupr33/philhackerblogcode"

	//...
	"github.com/kmdupr33/philhackerblogcode/mock_philhackerblogcode"
)

func TestHandler(t *testing.T) {

	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	mgf := mock_philhackerblogcode.NewMockGopherFinder(mockCtrl)
	mgf.EXPECT().Find("andrewgerrand")

	h := FindHandler(mgf)

	wr := httptest.NewRecorder()
	url, _ := url.Parse("http://gopherfinder.com/andrewgerrand")
	r := &http.Request{URL: url}

	h(wr, r)
}
{{< / highlight >}}

The highlighted line above is the call where you actually specify which methods the mock `GopherFinder` is expecting to receive during the test. Here we tell the mock that we're expecting a call to the `Find()` method with an argument of "andrewgerrand."

# Handling Circular Dependencies

Notice that the package for the above snippet of code is `philhackerblogcode_test` instead of `philhackerblogcode`. Typically, tests are placed in the same package as the code that those tests exercise, but if you do this when using gomock you are probably going to introduce a circular dependency between the package you are testing and the package that contains the generated mock code.

The mockgen commmand generates files that are in the package mock_\<package_containing_interfaces_to_be_mocked\>. The mock package generated by mockgen will likely depend on the package that you're testing and the package you are testing, if the tests live in that package, will depend on the mock package.

The way to avoid this circular dependency is to place your tests in a package that's different from the package you are testing. Next, have your test code import both the package you'd like to test and the mock package that the test depends upon. As Andrew Gerrand points out in his [testing techniques talk](https://www.youtube.com/watch?v=ndmB0bj7eyw), this is a standard way of avoiding circular circular dependencies while testing.

# Stubbing with gomock

The above test ensures that the `HandlerFunc` returned by `GetHandler` calls the `GopherFinder` with the appropriate arguments, but the `HandlerFunc` has more behavior that we can test. One of the things the `HandlerFunc` should do is respond with a 500 if the `GopherFinder` returns an error while finding a gopher. In order to test this additional behavior, we need to force the `GopherFinder` to return an error for the purposes of the test.

Fortunately, Gomock also allows us to do exactly this. It allows the mocks it generates to behave like stubs.<sup>2</sup> You can specify the return value that should be returned by using the `Return()` method on the result of calling `EXPECT()` and the method you are expecting:

{{< highlight go "style=default,hl_lines=4 5 6 16 17 18">}}
func TestHandler(t *testing.T) {
	//...
	mgf := mock_philhackerblogcode.NewMockGopherFinder(mockCtrl)
	mgf.EXPECT().
		Find("andrewgerrand").
		Return(Gopher{}, errors.New("error for test purposes"))

	//...

	wr := httptest.NewRecorder()
	//...
	r := &http.Request{URL: url}

	h(wr, r)

	if wr.Code != 500 {
		t.Errorf("Expected code: %d, actual code: %d", 500, wr.Code)
	}
}
{{< / highlight >}}

Because we've told the mock `GopherFinder` to return an error when its `Find()` method is called, we can test to see that the `HandlerFunc` actually writes out a 500 response code when the `GopherFinder` returns an error.

## Notes

1. The mockgen command can also be run in "source mode." In source mode, you simply pass in the source file containing interfaces to be mocked as an argument. See [the docs](https://github.com/golang/mock#running-mockgen) for more info.

2. For more on the difference between mocks and stubs, see Martin Fowler's [Mocks aren't Stubs](http://martinfowler.com/articles/mocksArentStubs.html)
