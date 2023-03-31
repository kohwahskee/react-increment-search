# !!!! SUPER EXTREMELY VERY REALLY IMPORTANT !!!!

When animating, especially with transform animation, round the value to nearest 1 to prevent laggy animation in Firefox

TODO:

<!-- ✅1. When search query changes (or when state changes back to TYPING/SELECTING), reset placeholder map 2. If previous query === new query, don't fetch again -->
<!-- ✅3. Correctly adding the number of results per search to generated queries  -->
<!-- ✅4. When query has no incrementable, either:
- Only show 1 result (both generatedQueries and placeholder) or -->
<!--✅- Don't show show any at all (input state doesn't change to FINISHED)  -->
<!-- ✅5. Set a scroll boundary to prevent over-scrolling -->
   <!-- 5a. Scroll back to bound when mouseup -->

6. Abstract useEffects to custom hook(s) or reducer(s)
7. Look into transitioning into useContext
      <!-- ❌8. Limit number of searches to min of 2 (no longer necessary) -->
      <!-- ✅9. Placeholder map needs to represent results per search accurately. -->
   <!-- ❓8. Flickery opacity when dragging -->
8. Consider lifting scrollAnimation controller up to SearchScreen
9. When fetch is ready and working, replace mock API with real Google API

FIXME:

<!-- ✅_10. Placeholder map needs to update right after options change_ -->

<!-- ✅1. Changing options without changing query won't change result items. -->
