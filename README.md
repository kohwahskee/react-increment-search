# **[Google Increment Search Tool (GIST)](https://kohwahskee.github.io/react-increment-search/)**

### A search tool (powered by Google) that helps you search for incrementing numbers without having to search for them one by one.

---

## Table of contents

- [Why Gist?](#why-gist)
- [How to use](#how-to-use)
- [Search Operators](#search-operators)
- [Options](#options)
- [Results and bookmarking](#results-and-bookmarking)
- [Please read](#please-read)

---

## **Why GIST?**

Without GIST, searching for episodes of a TV show would be something like this:

      - 'Breaking bad episode 1'
      - 'Breaking bad episode 2'
      - 'Breaking bad episode 3'
      - etc.

With GIST, you can search for all of them in a single query:

    - Type query like how you normally would: 'Breaking bad episode 1'
    - That's it! GIST will automatically incrementally search and show all results of the query for you.

---

## **How to use**

![Example of how to use bubble to select incremental number](https://s10.gifyu.com/images/readme_bubble2.gif)
Using a highly advanced technology powered by quantum computers **BubbleIndicator**™️, you can select which number you want to increment. Here's how:

- Type your query in the search bar, just like how you normally would in Google.
- If there are more than 1 number in your query, GIST will show a bubble that you can drag and drop on the number you want to increment.
  (i.e: 'Breaking bad season 1 episode 3', in this case, you would want to increment the episode number instead of the season number. So you would drag and drop the bubble on the episode number)
- Customize the Options in the top left corner to your preference. (See [Options](#options) for more info)

---

## **Search operators**

Since GIST is powered by Google, any search operators that would work in Google will also work in GIST. Here are some examples:

`site:reddit.com`

`@twitter`

`-Waltuh` (excludes words)

[and more...](https://support.google.com/websearch/answer/2466433?hl=en)

`⚠️Warning`: _Unlike Google, GIST does not support auto-correct (i.e: 'Bradking baad ep 1' will not auto-correct to 'Breaking bad episode 1'). In most cases, Google should still understand correctly, but keep in mind that, this might cause error in case that Google does not understand and responds with 0 result_

---

## **Options**

![Example of options](https://i.imgur.com/AWgpbfr.png)
`Number of searches` (default: 10)
The amount of searches GIST will show

    10 will show 10 results of your query

`Starting number` (default: selected): The number that GIST will start incrementing from.

    Selected: The number that you selected in the bubble.
    1: GIST will start incrementing from 1.
    0: GIST will start incrementing from 0.

`Results per search` (default: 2): The number of results GIST will show for each search.

    2 will show 2 results of your query for each increment.

Example Options and how they affect the results:

⚙️ `Number of searches`: 3

⚙️ `Starting number`: 1

⚙️ `Results per search`: 2

`Search Query`: Breaking bad episode 3

Results will look something like this:

```
    Breaking bad episode 1 (1st result from google)
    Breaking bad episode 1 (2nd result from google)
```

```
    Breaking bad episode 1 (1st result from google)
    Breaking bad episode 1 (2nd result from google)
```

```
    Breaking bad episode 1 (1st result from google)
    Breaking bad episode 1 (2nd result from google)
```

---

## **Results and bookmarking**

    Clicking on either
     - a link of the result
     - the index of the result or
     - the result itself
     will highlight it and save it as your last clicked result.

![Example of what results screen looks like](https://i.imgur.com/M52R5Nk.png)
GIST remembers your last search query, options, and results, as well as your last clicked result (this is all saved locally in your browser)

This means, you can use GIST as a bookmarking tool (for links). This is especially helpful if you are searching for episodes of TV shows. The next time you visit, GIST will automatically show you the last search results you had, as well as where you left off at.

---

## Please read:

This is a personal project which I don't intend to commercialize. GIST uses Google Programable Search API, which allows 100 queries per day for free (which is more than enough for personal use, but is no where near enough for commercial use). If you see an error message saying that you have exceeded the daily limit, please wait until the next day to use GIST again.

This site functions entirely on client-side, and thus, there was basically no way to prevent spam searching, causing the API to exceed daily limit. Please be considerate and don't spam search. Thank you :)

Laughing at the source code is also prohibited.
Any feedbacks, bugs, or suggestions are welcome. Please open an issue or contact me on Discord Kowalski#1010
