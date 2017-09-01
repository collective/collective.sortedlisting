# -*- coding: utf-8 -*-
from plone.app.querystring.querybuilder import QueryBuilder as BaseQueryBilder
from zope.component import getMultiAdapter


class QueryBuilder(BaseQueryBilder):
    """ This view is used by the javascripts,
        fetching configuration or results"""

    def html_results(self, query):
        """html results, used for in the edit screen of a collection,
           used in the live update results"""
        options = dict(original_context=self.context)
        results = self(query, sort_on=self.request.get('sort_on', None),
                       sort_order=self.request.get('sort_order', None),
                       limit=10)

        return getMultiAdapter(
            (results, self.request),
            name='sortable_query_results'
        )(**options)
