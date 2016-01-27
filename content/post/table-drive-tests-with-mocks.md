+++
comments = true
date = "2016-01-23T13:01:07-05:00"
draft = false
share = true
slug = "post-title"
tags = ["go"]
title = "Table-driven tests with Gomock"
+++

Table-driven tests are a common testing pattern for go tests. Since I recently started working with gomock, I wondered if there was a way to use table-driven tests with gomock mocks. It turns out that this is definitely possible, and that's what this post is about. Before I show how to combine table-driven tests with gomock mocks, I briefly review how gomock and table-driven tests work and I try to show why you might want to combine table-driven tests with mocks in the first place.

### Table-Driven Tests

There are many examples of table-driven tests in the standard library. One example of a table-driven test can be found in the `fmt_test` package:

{{< highlight go "style=default">}}
var fmtTests = []struct {
	fmt string
	val interface{}
	out string
}{
	{"%d", 12345, "12345"},
	{"%v", 12345, "12345"},
	{"%t", true, "true"},
    //...
}
{{< / highlight >}}

As the above code suggests, table-driven tests typically make use of slice literals of anonymous structs. The anonymous struct has fields that support various test cases. In this case, the fields are `fmt`, the actual format specifier used within a format string, `val`, the value formatted according to the format specifier, and `out`, the string that is expected as a result of calling `fmt.Sprintf()` on a formatted string with its specifiers and values.

Within the `Test-` method, the tests are run by ranging over the elements of the slice literal.

{{< highlight go "style=default,hl_lines=3 5">}}
func TestSprintf(t *testing.T) {
	for _, tt := range fmtTests {
		s := Sprintf(tt.fmt, tt.val)
		//...
		if s != tt.out {
			if _, ok := tt.val.(string); ok {
				// Don't requote the already-quoted strings.
				// It's too confusing to read the errors.
				t.Errorf("Sprintf(%q, %q) = <%s> want <%s>", tt.fmt, tt.val, s, tt.out)
			} else {
				t.Errorf("Sprintf(%q, %v) = %q want %q", tt.fmt, tt.val, s, tt.out)
			}
		}
	}
}
{{< / highlight >}}

### Gomock Mocks

Gomock mocks are generated in two steps. The first step is to generate the mock code using the `mockgen` command. The second step is to create the mock for use in your test:

{{< highlight go "style=default">}}
mockCtrl := gomock.NewController(t)
defer mockCtrl.Finish()
mgf := mock_gopher.NewMockGopherFinder(mockCtrl)
{{< / highlight >}}

If this snippet doesn't make sense to you, it might be a good idea to read [my post on gomock](http://www.philosophicalhacker.com/post/getting-started-with-gomock/) before proceeding.

### Why bother?

To see why we might want to use table-driven tests with gomock, suppose we want to write a test for a cache of `Gopher`s. When we ask the cache for a `Gopher`, the cache will first check its own map to see if the `Gopher` is available in memory. If the `Gopher` is unavailable it will call on a `GopherFinder` to fetch the `Gopher` from some remote location:

{{< highlight go "style=default">}}
func (s *lruCache) GetGopher(name string) (Gopher, error) {
	gopher, ok := s.CachedGophers[name]
	if !ok {
		return s.GopherFinder.Find(name)
	}
	return gopher, nil
}
{{< / highlight >}}

Suppose we want to test this behavior. There are two cases we want test:

Here's the first case:

```
Given a Cache that does not contain the Gopher named "andrewgerrand"
When we ask the Cache for the Gopher named "andrewgerrand"
Then the Cache calls `Find()` on its `GopherFinder` to satisfy the request
```

And the second case:

```
Given a Cache that does contain the Gopher named "andrewgerrand"
When we ask the Cache for the Gopher named "andrewgerrand"
Then the Cache doesn't call `Find()` on its `GohperFinder`. Instead, it returns a cached "andrewgerrand" `Gopher`
```

Obviously, these test cases can share some code. Using a table-driven test can help us avoid duplicating the support code we need to execute these two test cases. Moreover, Cache's, as [Martin Fowler points out](http://martinfowler.com/articles/mocksArentStubs.html), are prime candidates for behavior/mock-based testing, so in this case, it doesn't seem crazy to combine mocks with a table-driven test.

### Putting it All Together

The struct that supports the table-driven tests should contain fields for the values that need to change in order to support different, but related test cases. The first difference between our two cache test cases is that the in one case, the cache already contains a cached `Gopher` for the name "andrewgerrand" and in the other case, it does not. So, our slice of anonymous structs should start off looking like this:

{{< highlight go "style=default">}}
var cacheTests = []struct {
	cachedGophers map[string]Gopher
	//...
}{
	{cachedGophers: nil,
		//...
	},
	{cachedGophers: map[string]Gopher{"andrewgerrand": Gopher{}},
		//...
	},
}
{{< / highlight >}}

When we range over the values of `cacheTests`, we can use the value of the `cachedGophers` field to setup our `Cache` appropriately so we can test that it behaves correctly:

{{< highlight go "style=default,hl_lines=7">}}
func TestCache(t *testing.T) {
    con := gomock.NewController(t)
	for _, tt := range cacheTests {

		//...
		cache := NewLRUCache(mc)
		cache.CachedGophers = tt.cachedGophers

		cache.GetGopher("andrewgerrand")
	}
}
{{< / highlight >}}

The second thing that's different about our two test cases is the actual calls we should expect on the `GohperFinder`. Again, when the cache can't find a `Gopher` in memory, it should call on its `GopherFinder`. Otherwise, it shouldn't call the `GopherFinder` at all, and it should simply return the `Gopher` it has in memory. So, we need a field in our struct that captures this difference between the two test cases:

{{< highlight go "style=default">}}
var cacheTests = []struct {
	cachedGophers map[string]Gopher
	Configurer    Configurer
}{
    {cachedGophers: nil,
		Configurer: func(gf *MockGopherFinder) *MockGopherFinder {
			gf.EXPECT().
				Find("andrewgerrand")
			return gf
		},
	},
	{cachedGophers: map[string]Gopher{"andrewgerrand": Gopher{}},
		Configurer: func(gf *MockGopherFinder) *MockGopherFinder {
			return gf
		},
	},
}
{{< / highlight >}}

The `Configurer`, as you probably figured out, is just a function that takes a mock as a parameter, configures it, and returns the configured mock to be used by the test. When `cachedGophers` is nil, the `Cache` created for the test won't have any cached `Gophers` in memory, so we should expect the `Cache` to call `Find()` on its `GopherFinder`. On the other hand, the second struct has a `cachedGohpers` map that should cause the `Cache` to return a cached version of the `Gopher` rather than fetch one from a remote location.

The `TestCache()` function can leverage the fields of this struct to run the two test cases:

{{< highlight go "style=default,hl_lines=4 7 10">}}
func TestCache(t *testing.T) {

	con := gomock.NewController(t)
	for _, tt := range cacheTests {

		mc := mock_gopher.NewMockGopherFinder(con)
		mc = tt.Configurer(mc)

		cache := NewLRUCache(mc)
		cache.CachedGophers = tt.cachedGophers

		cache.GetGopher("andrewgerrand")
	}
	con.Finish()
}
{{< / highlight >}}

### What do you think?

This strikes me as a fairly reasonable way of avoiding duplicating code while using gomock mocks in testing, but it might be silly and/or there might be a better solution. I'm interested in hearing alternative solutions to this problem, so I'd love to hear your thoughts on this. For the reasons I pointed out [here](http://www.philosophicalhacker.com/2016/01/13/should-we-use-mocking-libraries-for-go-testing/), I don't find the typical arguments offered against mocking libraries compelling, so I'm less interested in hearing people repeat those reasons, but if you have a novel reason for why gomock is a bad idea in the first place, I'd definitely like to hear it.
