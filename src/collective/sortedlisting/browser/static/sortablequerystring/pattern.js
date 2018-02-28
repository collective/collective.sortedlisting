/* Sortable Querystring pattern.
 *
 * Options:
 *    criteria(object): options to pass into criteria ({})
 *    indexOptionsUrl(string): URL to grab index option data from. Must contain "sortable_indexes" and "indexes" data in JSON object. (null)
 *    previewURL(string): URL used to pass in a plone.app.querystring-formatted HTTP querystring and get an HTML list of results ('portal_factory/@@querybuilder_html_results')
 *    previewCountURL(string): URL used to pass in a plone.app.querystring-formatted HTTP querystring and get an HTML string of the total number of records found with the query ('portal_factory/@@querybuildernumberofresults')
 *    classWrapperName(string): CSS class to apply to the wrapper element ('querystring-wrapper')
 *    classSortLabelName(string): CSS class to apply to the sort on label ('querystring-sort-label')
 *    classSortReverseName(string): CSS class to apply to the sort order label and checkbox container ('querystring-sortreverse')
 *    classSortReverseLabelName(string): CSS class to apply to the sort order label ('querystring-sortreverse-label')
 *    classPreviewCountWrapperName(string): TODO ('querystring-previewcount-wrapper')
 *    classPreviewResultsWrapperName(string): CSS class to apply to the results wrapper ('querystring-previewresults-wrapper')
 *    classPreviewWrapperName(string): CSS class to apply to the preview wrapper ('querystring-preview-wrapper')
 *    classPreviewName(string): CSS class to apply to the preview pane ('querystring-preview')
 *    classPreviewTitleName(string): CSS class to apply to the preview title ('querystring-preview-title')
 *    classPreviewDescriptionName(string): CSS class to apply to the preview description ('querystring-preview-description')
 *    classSortWrapperName(string): CSS class to apply to the sort order and sort on wrapper ('querystring-sort-wrapper')
 *    showPreviews(boolean): Should previews be shown? (true)
 *
 * Documentation:
 *    # Default
 *
 *    {{ example-1 }}
 *
 *    # Without Previews
 *
 *    {{ example-2 }}
 *
 * Example: example-1
 *    <input class="pat-querystring"
 *           data-pat-querystring="indexOptionsUrl: /tests/json/queryStringCriteria.json" />
 *
 * Example: example-2
 *    <input class="pat-querystring"
 *           data-pat-querystring="indexOptionsUrl: /tests/json/queryStringCriteria.json;
 *                                 showPreviews: false;" />
 *
 */

define([
  'jquery',
  'mockup-patterns-querystring',
  'mockup-patterns-sortable',
  'translate'
], function($, QueryString, Sortable, _t) {
  'use strict';

  var SortableQueryString = QueryString.extend({
    name: 'sortablequerystring',
    trigger: '.pat-sortablequerystring',
    parser: 'mockup',

    refreshPreviewEvent: function(value) {
      var self = this;

      if (!self.options.showPreviews) {
        return; // cut out of this if there are no previews available
      }

      if (typeof self._previewXhr !== 'undefined') {
        self._previewXhr.abort();
      }

      if (typeof self.$previewPane !== 'undefined') {
        self.$previewPane.remove();
      }

      var query = [], querypart;
      $.each(self.criterias, function(i, criteria) {
        var querypart = criteria.buildQueryPart();
        if (querypart !== '') {
          query.push(querypart);
        }
      });

      self.$previewPane = $('<div/>')
        .addClass(self.options.classPreviewName)
        .appendTo(self.$previewWrapper);

      if (query.length <= 0) {
        $('<div/>')
          .addClass(self.options.classPreviewCountWrapperName)
          .html('No results to preview')
          .prependTo(self.$previewPane);
        return; // no query means nothing to send out requests for
      }

      query.push('sort_on=' + self.$sortOn.val());
      if (self.$sortOrder.prop('checked')) {
        query.push('sort_order=reverse');
      }

      /* Get active modal window. Due to the properties-modal (which is always in the DOM but hidden if not active) we
       * have 2 modal windows in the DOM when a tile-modal is active. This leads to inconsistencies when the
       * SortableCollectionBehavior & the Sortable-Content-listing-Tile are active. */
      var modal = $('div.plone-modal-wrapper:visible').first();
      if(modal.length == 0) {
        modal = $('div.plone-modal-wrapper.mosaic-overlay');
      }
      /*
      if(modal.length == 0){
        modal = $('div#content-core');
      }
      */

      var sorting = modal.find("textarea[name$='.sorting']").first().val();

      if (sorting !== undefined && self.$sortOn.val() === '') {
        query.push('sorting=' + sorting.split('\n').join(','));
      }

      self._previewXhr = $.get(self.options.previewURL + '?' + query.join('&'))
          .done(function(data, stat) {
            $('<div/>')
              .addClass(self.options.classPreviewResultsWrapperName)
              .html(data)
              .appendTo(self.$previewPane);

            var uidList = modal.find("div#search-results li").map(function() {
              return $(this).data("uid");
            }).get();

            modal.find("textarea[name$='.sorting']").first().val( uidList.join("\r\n"));

            var dd = new Sortable(modal.find('div#search-results ul.sortedListing-results').first(), {
               selector: 'li',
               drop: 'updateSorting'
            });
          });
    },
    createSort: function() {
      var self = this;

      var modal = $('div.plone-modal-wrapper:visible').first();
      if(modal.length == 0) {
        modal = $('div.plone-modal-wrapper.mosaic-overlay');
      }
      /*
      if(modal.length == 0){
        modal = $('div#content-core');
      }
      */

      // elements that may exist already on the page
      // XXX do this in a way so it'll work with other forms will work
      // as long as they provide sort_on and sort_reversed fields in z3c form
      var existingSortOn = modal.find('[id$="-sort_on"]').filter('[id^="formfield-"]');
      var existingSortOrder = modal.find('[id$="-sort_reversed"]').filter('[id^="formfield-"]');

      $('<span/>')
        .addClass(self.options.classSortLabelName)
        .html(_t('Sort on'))
        .appendTo(self.$sortWrapper);
      self.$sortOn = $('<select/>')
        .attr('name', 'sort_on')
        .appendTo(self.$sortWrapper)
        .change(function() {
          self.refreshPreviewEvent.call(self);
          $('[id$="sort_on"]', existingSortOn).val($(this).val());
        });

      self.$sortOn.append($('<option value="">No sorting</option>')); // default no sorting
      for (var key in self.options['sortable_indexes']) { // jshint ignore:line
        self.$sortOn.append(
          $('<option/>')
            .attr('value', key)
            .html(self.options.indexes[key].title)
        );
      }
      self.$sortOn.patternSelect2({width: '150px'});

      self.$sortOrder = $('<input type="checkbox" />')
        .attr('name', 'sort_reversed:boolean')
        .change(function() {
          self.refreshPreviewEvent.call(self);
          if ($(this).prop('checked')) {
            $('.option input[type="checkbox"]', existingSortOrder).prop('checked', true);
          } else {
            $('.option input[type="checkbox"]', existingSortOrder).prop('checked', false);
          }
        });

      $('<span/>')
        .addClass(self.options.classSortReverseName)
        .appendTo(self.$sortWrapper)
        .append(self.$sortOrder)
        .append(
          $('<span/>')
            .html(_t('Reversed Order'))
            .addClass(self.options.classSortReverseLabelName)
        );

      // if the form already contains the sort fields, hide them! Their values
      // will be synced back and forth between the querystring's form elements
      if (existingSortOn.length >= 1 && existingSortOrder.length >= 1) {
        var reversed = $('.option input[type="checkbox"]', existingSortOrder).prop('checked');
        var sortOn = $('[id$="-sort_on"]', existingSortOn).val();
        if (reversed) {
          self.$sortOrder.prop('checked', true);
        }
        self.$sortOn.select2('val', sortOn);
        $(existingSortOn).hide();
        $(existingSortOrder).hide();
      }
    },
  });

  return SortableQueryString;
});
