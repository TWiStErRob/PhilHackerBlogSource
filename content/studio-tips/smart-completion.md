# Smart Completion

You can invoke auto completion by pressing Ctrl + Space. This will display a list of possible ways to complete the line of code your typing by, for example, suggesting method calls or variable names. You can further refine the list of completion options displayed to you by using smart completion, which can be invoked by pressing Ctrl + Shift + Space.

I want to point out one really neat thing about the way in which the list is refined. Smart autocomplete actually contains suggests that involve methods on the variables that are in the current scope. This means that you can use smart completion to ask Android Studio a key question: given the variables in the local scope, how can I get an object of type X, where X is any type. This is demoed below.

{{< youtube PDEPuOUA6aM >}}