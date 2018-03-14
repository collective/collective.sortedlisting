# -*- coding: utf-8 -*-
from collective.sortedlisting import _
from collective.sortedlisting.widget import SortableQueryStringFieldWidget
from plone.app.standardtiles import contentlisting
from plone.autoform import directives as form
from plone.tiles.interfaces import ITileType
from zope import schema
from zope.component import getMultiAdapter
from zope.component import queryUtility
from zope.interface import alsoProvides
from zope.schema import getFields


__author__ = 'Tom Gross <itconsense@gmail.com>'


class ISortableContentListingTile(contentlisting.IContentListingTile):

    form.widget('query',
                SortableQueryStringFieldWidget,
                wrapper_css_class='sortableCollection-query')

    form.widget('sorting',
                wrapper_css_class='sortableCollection-sorting')
    sorting = schema.List(
        title=_(u'Sorting'),
        description=_(u'Widget specific sorting of the search results'),
        default=[],
        missing_value=[],
        value_type=schema.TextLine(),
        required=False,
    )


class SortableContentListingTile(contentlisting.ContentListingTile):

    def get_results(self):
        builder = getMultiAdapter(
            (self.context, self.request),
            name='querybuilderresults'
        )
        results = builder(
            query=self.query,
            sort_on=self.sort_on or 'getObjPositionInParent',
            sort_order=self.sort_order,
            limit=self.limit
        )
        if self.sort_on is not None:
            return results

        sorting = self.data.get('sorting', '')
        positions = {j: i for i, j in enumerate(sorting)}
        return sorted(
            results, key=lambda item: positions.get(item.uuid(), 999))

    def contents(self):
        """Search results"""
        results = self.get_results()
        view = self.view_template or 'listing_view'
        view = view.encode('utf-8')
        options = dict(original_context=self.context)
        alsoProvides(self.request, contentlisting.IContentListingTileLayer)
        return getMultiAdapter((results, self.request), name=view)(**options)

    def update(self):
        self.query = self.data.get('query')
        self.sort_on = self.data.get('sort_on')

        if self.query is None:
            fields = getFields(queryUtility(ITileType,
                                            name=self.__name__).schema)
            self.query = getMultiAdapter((
                self.context,
                self.request,
                None,
                fields['query'],
                None
            ), name='default').get()

        self.limit = self.data.get('limit')
        if self.data.get('sort_reversed'):
            self.sort_order = 'reverse'
        else:
            self.sort_order = 'ascending'
        self.view_template = self.data.get('view_template')

# EOF
