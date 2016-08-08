+++
comments = true
date = "2016-08-08T08:34:46-04:00"
draft = false
share = true
slug = "unit-testable-recycler-views"
tags = ["android", "testing"]
title = "Unit Testable RecyclerViews"
+++

When building our Android apps, we can often wind up with a decent amount of code in our `RecyclerView.Adapter`s that we want to test. In this article, I briefly suggest two ways of structuring our `RecyclerView`-related classes so that we can accomplish this.

First, let's look at a simple list that'll serve as a working example:

![Simple RecyclerView](/images/simple-list.png)

Here's the code that creates this list:

{{< highlight java "style=default" >}}
public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        final RecyclerView recyclerView = (RecyclerView) findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(new RecyclerView.Adapter() {
            @Override
            public RecyclerView.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
                return new RecyclerView.ViewHolder(new TextView(parent.getContext())) {};
            }

            @Override
            public void onBindViewHolder(RecyclerView.ViewHolder holder, int position) {
                ((TextView) holder.itemView).setText(String.valueOf(position));
            }

            @Override
            public int getItemCount() {
                return 100;
            }
        });
    }
}
{{< / highlight >}}

Now that we've introduced a working example, let's look at two ways of making RecyclerView-related code unit testable. 

### An Obvious Way: MVP

One of the oft-cited benefits of using MVP in Android apps is that it enhances testability. So, a natural way of structuring our `RecyclerView` related classes so that we can enhance testability is to apply MVP to those classes. To do this, we make the `ViewHolder` sublcass implement an MVP `View`. 

{{< highlight java "style=default" >}}
private static class SimpleListItemViewHolder extends RecyclerView.ViewHolder implements SimpleListItemView {

    SimpleListItemViewHolder(View itemView) {
        super(itemView);
    }

    @Override // From SimpleListItemView interface
    public void setText(String text) {
        ((TextView) itemView).setText(text);
    }
}
{{< / highlight >}}

Next, we setup our RecyclerView.Adapter to create Presenters for each ViewHolder and we delegate the presentation logic to those presenters in `onBindViewHolder`:

{{< highlight java "style=default, hl_lines=7 13" >}}
private static class MyAdapter extends RecyclerView.Adapter<SimpleListItemViewHolder> {

    @Override
    public SimpleListItemViewHolder onCreateViewHolder(ViewGroup parent,
                                                        int viewType) {
        final TextView itemView = new TextView(parent.getContext());
        itemView.setTag(new Presenter());
        return new SimpleListItemViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(SimpleListItemViewHolder holder, int position) {
        ((Presenter) holder.itemView.getTag()).presentListItem(holder, position);
    }

    //...
}
{{< / highlight >}}

Notice here that we set the `Presenter` as a tag on the `ViewHolder`'s itemView. When it's time to bind the ViewHolder, we can grab the `Presenter` from the tag delegate the presentation logic to it. Here's what the `Presenter` looks like:

{{< highlight java "style=default" >}}
private static class Presenter {
    void presentListItem(SimpleListItemView view, int position) {
        view.setText(String.valueOf(position));
    }
}
{{< / highlight >}}

Because the logic we want to test now lives inside of the `Presenter`, a simple POJO, unit testing the presentation logic for our `RecyclerView`s becomes much easier. We simply instantiate a `Presenter`, call its main presentation method, and verify that it interacts properly with its MVP View.

{{< highlight java "style=default" >}}
public class PresenterTest {
    //...
    @Test
    public void presentListItemShouldSetViewTextToPosition() throws Exception {
        MainActivity.Presenter presenter = new MainActivity.Presenter();

        presenter.presentListItem(mSimpleListItemView, 0);

        verify(mSimpleListItemView).setText("0");
    }
}
{{< / highlight >}}

### A Lighter Way: Reusing a Presenter

Let's look at another way of making our `RecyclerView` related classes unit testable. While the above approach works fine, I sometimes find that having to create an extra presenter class that is stored and retrieved as a tag on a `ViewHolder`'s item view a bit much, especially if I already have a `Presenter` that is simply responsible for fetching items to display in the list. 

Let's alter our working example a bit to suppose we had such a presenter. Instead of simply displaying the position of a ViewHolder in our `RecyclerView`, let's display numbers we have to fetch from somewhere else. In this case, we'll probably want a (unit-testable)`Presenter` that looks like this:

{{< highlight java "style=default, hl_lines=15" >}}
static class Presenter {
    private final NumberFetcher mNumberFetcher;
    private final NumberListView mNumberListView;

    Presenter(NumberFetcher numberFetcher, NumberListView numberListView) {
        mNumberFetcher = numberFetcher;
        mNumberListView = numberListView;
    }

    public void onViewReady() {
        mNumberFetcher.getNumbers(new Callback() {

            @Override
            public void onSuccess(List<Integer> numbers) {
                mNumberListView.displayNumbers(numbers);
            }

            @Override
            public void onFailure(Throwable err) {
                mNumberListView.displayErrorMessage();
            }
        });
    }
}
{{< / highlight >}}

Now, if we were simply using MVP for a RecyclerView-related classes, the highlighted `displayNumbers` method is where we'd have to create our `Adapter` that would creat and use a separate `Presenter` class that would hold our presentation logic. Since we already have a `Presenter`, however, we can simply reuse it by passing it to the `RecyclerView.Adapter` via our MVP View method: 

{{< highlight java "style=default, hl_lines=7" >}}
static class Presenter {
    //...
    public void onViewReady() {
        mNumberFetcher.getNumbers(new Callback() {
            @Override
            public void onSuccess(List<Integer> numbers) {
                mNumberListView.displayNumbers(numbers, this);
            }
            //...
        });
    }
}
{{< / highlight >}}

Here's the implementation of the `displayNumbers` view:

{{< highlight java "style=default" >}}
public class MainActivity extends AppCompatActivity implements NumberListView {
    //...
    @Override
    public void displayNumbers(List<Integer> numbers, Presenter presenter) {
        final RecyclerView recyclerView = (RecyclerView) findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(new MyAdapter(numbers, presenter));
    }
}
{{< / highlight >}}

And here's the adapter delegating to the same `Presenter` that's responsible for loading the items in the list:

{{< highlight java "style=default" >}}
private static class MyAdapter extends RecyclerView.Adapter<SimpleListItemViewHolder> {

        private final List<Integer> mNumbers;
        private final Presenter mPresenter;

        MyAdapter(List<Integer> numbers, Presenter presenter) {
            mNumbers = numbers;
            mPresenter = presenter;
        }

        @Override
        public SimpleListItemViewHolder onCreateViewHolder(ViewGroup parent,
                                                           int viewType) {
            final TextView itemView = new TextView(parent.getContext());
            return new SimpleListItemViewHolder(itemView);
        }

        @Override
        public void onBindViewHolder(SimpleListItemViewHolder holder, int position) {
            mPresenter.presentListItem(holder, position);
        }

        @Override
        public int getItemCount() {
            return mNumbers.size();
        }
    }
{{< / highlight >}}