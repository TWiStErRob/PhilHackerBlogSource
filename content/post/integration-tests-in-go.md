+++
comments = true
date = "2016-01-22T19:27:36-05:00"
draft = false
share = true
author = ""
tags = ["go"]
title = "Integration Tests in Go"
+++

Although Go has support for testing built in to its toolchain, certain kinds of testing can be a bit tricky. For example, it may not be immediately obvious how you would go about writing and running *integration tests* in go. This post contains info on how to write and run integration tests for your go code.

### Clarifying Terms

As [I've said before](http://www.philosophicalhacker.com/2016/01/13/should-we-use-mocking-libraries-for-go-testing/), many terms in software are vague or ambiguous. So, before I get into how to write and run integration tests, let's make sure we're referring to the same thing when we use the word "integration" test. Sometimes it seems like people use "integration test" and "acceptance test" interchangeably. I do think, however, that there's a useful distinction to be made between these types of tests, a distinction that's made nicely by Steve Freeman and Nat Pryce in the following quotations:

>Acceptance: Does the whole system work?

>Integration: Does our code work against code we can’t change?<sup>1</sup>

Later on, they elaborate on the definition of an integration test:

>We use the term integration tests to refer to the tests that check how some of our code works with code from outside the team that we can’t change. It might be a public framework, such as a persistence mapper, or a library from another team within our organization. The distinction is that integration tests make sure that any abstractions we build over third-party code work as we expect.<sup>2</sup>

### Integration Testing in Go

Now, that we're clear on what we mean by the terms "acceptance" and "integration tests," let's briefly take a look at how we can write and run integration tests in go.

Suppose you're working with a database in your go code. Many databases have a go client sdk that you can use in your application. Typically, you'll build some kind of abstraction on top of that sdk that your application will use to access and update the data in the database. This abstraction is a prime candidate for integration testing.

Obviously, in order to perform this kind of integration testing, your go code needs to be able to communicate with the database. How can we ensure that there is a database available for our test code to talk to?

#### A naive solution

The `TestMain()` function is a great way to perform the extra setup and teardown of your test database. When there's a `TestMain()` function in any of your test files, that function is called directly by `go test`. The function can then perform any necessary setup, run the tests, and then teardown whatever was needed to support the tests:

{{< highlight go "style=default">}}
func TestMain(m *testing.M) {
    setupDatabase()
    result := m.Run()
    teardownDatabase()
    os.Exit(result)
}
{{< / highlight >}}

The problem with using `TestMain` this way, however, is that integration tests are typically much slower than unit tests, so running our tests this way will make invocations of `go test` take much longer. If we're working on a part of the code that has nothing to do with integrating with 3rd party code, this can be pretty frustrating.

#### A less naive solution

Fortunately, the testing package itself suggests a solution to this problem. The testing package actually has a function called `testing.Short()`. This function returns true if the `-short` flag has been passed into the `go test` command. Tests can check the value of `Short()` to determine whether they should execute code and/or tests that will take a long time. This flag could be leveraged to determine whether the tests should spin up external services for integration tests:

{{< highlight go "style=default,hl_lines=2 3 4 5 7 8 9">}}
func TestMain(m *testing.M) {
    flag.Parse()
    if !testing.Short() {
        setupDatabase()    
    }
    result := m.Run()
    if !testing.Short() {
        teardownDatabase()        
    }    
    os.Exit(result)
}
{{< / highlight >}}

The actual integration tests can check the value of `testing.Short()` to see if they should execute:

{{< highlight go "style=default">}}
func TestDatabaseGet(t *testing.T) {
    if testing.Short() {
        t.Skip()
    }
    //...
}
{{< / highlight >}}

#### A scalable solution

This solution is definitely better than just always setting up and tearing down a database in the `TestMain()` function, but it has a few disadvantages:

1. It requires us to pass in the `-short` flag every time we want to avoid running integration tests.

2. It doesn't scale well to multiple types of integration tests.

Having to pass in the `-short` flag whenever we want to avoid slow integration tests is inconvenient. Most of the time writing an application is probably spend writing code that isn't covered by integration tests, so most of the time you'll have to add the flag `-short` to your `go test` invocations.

This inconvenience can be mitigated if we just tell our text editors to add the flag whenever they usually run `go test` (e.g., on saving a file). However, since most of the time we aren't interested in running integration tests, it seems like it would be better if `go test` didn't run integration tests by default. Instead, it'd be better if we had to explicitly tell `go test` to run the integration tests.

The second problem with using the `-short` flag is that it doesn't scale well to multiple types of integration tests. Suppose, for example, that our code utilized a database and a message queue. We can ensure that both our database and message queues are setup if we're doing both types of integration tests, but if we just want to run the integration tests for our database and not for our message queue, we are again forced to wait longer for our tests to run.

The solution to both of these problems is to use custom flags. You can pass custom flags into the `go test` command and handle them however you like within your tests. We can define a flag for database integration tests and a flag for message queue tests and only run the respective integration tests when those flags are passed in. For example, `go test -database` will only run the database-related integration tests and: `go test -queue` will only run the message-queue-related integration tests.

Briefly, here's how you could support that behavior in `TestMain()`:

{{< highlight go "style=default">}}

var (
    database = flag.Bool("database", false, "run database integration tests")    
    messageQueue = flag.Bool("messageQueue", false, "run message queue integration tests")
)

func TestMain(m *testing.M) {
    flag.Parse()
    if *database {
        setupDatabase()    
    }
    if *messageQueue {
        setupMessageQueue()
    }
    result := m.Run()
    if *database {
        teardownDatabase()        
    }
    if *messageQueue {
        teardownMessageQueue()
    }    
    os.Exit(result)
}
{{< / highlight >}}

Of course, your database and message queue integration tests should also check for these flags and skip if they are not set to true.

### Conclusion

We've just seen three ways of writing and running integration tests in go.

The first way was to simply use the `TestMain()` function to perform whatever setup and teardown you need for your tests. I called this solution "naive" because it dramatically increases the time it takes for `go test` to execute, even if you aren't interested in running integration tests.

The second "less naive" solution was to take advantage of the `-short` flag built in to the testing package. This solution is better because it gives us a way of shortening our test runs when we don't want to run integration tests. However, this solution forces us to pass the `-short` flag whenever we want to shorten our test run, and since we aren't usually interested in running integration tests, this is inconvenient. Moreover, this solution doesn't give us fine-grained control over which kinds of integration tests we want to run, and this again forces us to wait longer for `go test` to complete.

I believe that the last solution we explored is a very scalable way of handling integration testing in go. It gives us fine-grained control over which integration tests we want to run and doesn't run any slow integration tests by default. This allows us to run our tests as quickly as possible. I also suspect that there's another advantage to using custom flags for your integration testing: it makes acceptance testing easier, but this something that I'll have to explore another time.

#### Notes:

1. [Growing Object Oriented Software Guided by Tests](http://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627), pg 40-41
2. Ibid., pg 41-42
