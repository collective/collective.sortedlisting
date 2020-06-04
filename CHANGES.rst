Changelog
=========


1.0a5 (unreleased)
------------------

- Preview-field is now bigger (drag & drop usability).
- Same results-limit will be used in the view and the querybuilder.
- The sorting for every collection will be stored in it's own sorting field.
- "Sort on"-field has now an impact on the query & the results.
- "Sort on"- and "Sort order"-fields will be stored separate for every collection.
- The sorting will be updated always. Before this happend only while saving.
- Set automatically "Sort on"-field to None (which is necessary for d&d) when d&d is executed.
- Show correct sorting also if limit is smaller than the amount of results.
- Fix tests
  [adrianschulz]


1.0a4 (2017-11-09)
------------------

- Build bundle
- Set query limit to 50
  [tomgross]


1.0a3 (2017-11-08)
------------------

- Don't limit results for sorting
- Enhance drag & drop layout
  [adrianschulz]


1.0a2 (2017-09-07)
------------------

- Fix tests / static code analysis and stream demo video from Youtube
  [tomgross]


1.0a1 (2017-09-07)
------------------

- Initial release.
  [tomgross]
