/* i18n integration. This is forked from jarn.jsi18n
 *
 * This is a singleton.
 * Configuration is done on the body tag data-i18ncatalogurl attribute
 *     <body data-i18ncatalogurl="/plonejsi18n">
 *
 *  Or, it'll default to "/plonejsi18n"
 */
define('mockup-i18n',[
  'jquery'
], function($) {
  'use strict';

  var I18N = function() {
    var self = this;
    self.baseUrl = $('body').attr('data-i18ncatalogurl');

    if (!self.baseUrl) {
      self.baseUrl = '/plonejsi18n';
    }
    self.currentLanguage = $('html').attr('lang') || 'en-us';
    self.storage = null;
    self.catalogs = {};
    self.ttl = 24 * 3600 * 1000;

    // Internet Explorer 8 does not know Date.now() which is used in e.g. loadCatalog, so we "define" it
    if (!Date.now) {
      Date.now = function() {
        return new Date().valueOf();
      };
    }

    try {
      if ('localStorage' in window && window.localStorage !== null && 'JSON' in window && window.JSON !== null) {
        self.storage = window.localStorage;
      }
    } catch (e) {}

    self.configure = function(config) {
      for (var key in config){
        self[key] = config[key];
      }
    };

    self._setCatalog = function (domain, language, catalog) {
      if (domain in self.catalogs) {
        self.catalogs[domain][language] = catalog;
      } else {
        self.catalogs[domain] = {};
        self.catalogs[domain][language] = catalog;
      }
    };

    self._storeCatalog = function (domain, language, catalog) {
      var key = domain + '-' + language;
      if (self.storage !== null && catalog !== null) {
        self.storage.setItem(key, JSON.stringify(catalog));
        self.storage.setItem(key + '-updated', Date.now());
      }
    };

    self.getUrl = function(domain, language) {
      return self.baseUrl + '?domain=' + domain + '&language=' + language;
    };

    self.loadCatalog = function (domain, language) {
      if (language === undefined) {
        language = self.currentLanguage;
      }
      if (self.storage !== null) {
        var key = domain + '-' + language;
        if (key in self.storage) {
          if ((Date.now() - parseInt(self.storage.getItem(key + '-updated'), 10)) < self.ttl) {
            var catalog = JSON.parse(self.storage.getItem(key));
            self._setCatalog(domain, language, catalog);
            return;
          }
        }
      }
      $.getJSON(self.getUrl(domain, language), function (catalog) {
        if (catalog === null) {
          return;
        }
        self._setCatalog(domain, language, catalog);
        self._storeCatalog(domain, language, catalog);
      });
    };

    self.MessageFactory = function (domain, language) {
      language = language || self.currentLanguage;
      return function translate (msgid, keywords) {
        var msgstr;
        if ((domain in self.catalogs) && (language in self.catalogs[domain]) && (msgid in self.catalogs[domain][language])) {
          msgstr = self.catalogs[domain][language][msgid];
        } else {
          msgstr = msgid;
        }
        if (keywords) {
          var regexp, keyword;
          for (keyword in keywords) {
            if (keywords.hasOwnProperty(keyword)) {
              regexp = new RegExp('\\$\\{' + keyword + '\\}', 'g');
              msgstr = msgstr.replace(regexp, keywords[keyword]);
            }
          }
        }
        return msgstr;
      };
    };
  };

  return I18N;
});

/* i18n integration.
 *
 * This is a singleton.
 * Configuration is done on the body tag data-i18ncatalogurl attribute
 *     <body data-i18ncatalogurl="/plonejsi18n">
 *
 *  Or, it'll default to "/plonejsi18n"
 */

define('translate',[
  'mockup-i18n'
], function(I18N) {
  'use strict';

  // we're creating a singleton here so we can potentially
  // delay the initialization of the translate catalog
  // until after the dom is available
  var _t = null;
  return function(msgid, keywords) {
    if (_t === null) {
      var i18n = new I18N();
      i18n.loadCatalog('widgets');
      _t = i18n.MessageFactory('widgets');
    }
    return _t(msgid, keywords);
  };
});

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

define('sortablequerystring',[
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
      if(modal.length == 0){
        modal = $('div#content-core');
      }

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
      if(modal.length == 0){
        modal = $('div#content-core');
      }

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

require([
  'sortablequerystring'
], function() {
  'use strict';
});

define("/home/vagrant/collective.sortedlisting/src/collective/sortedlisting/browser/static/bundle.js", function(){});

