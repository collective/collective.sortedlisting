# -*- coding: utf-8 -*-
from collections import OrderedDict
from collective.sortedlisting.behavior import ISortableCollectionBehavior
from collective.sortedlisting.behavior import SortableCollectionBehavior
from collective.sortedlisting.browser.collection import SortableCollectionView
from collective.sortedlisting.testing import COLLECTIVE_SORTEDLISTING_INTEGRATION_TESTING
from collective.sortedlisting.testing import COLLECTIVE_SORTEDLISTING_FUNCTIONAL_TESTING
from collective.sortedlisting.widget import SortableQueryStringWidget
from plone import api
from plone.app.contenttypes.tests.test_collection import PloneAppCollectionClassTest
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.testing import z2
from plone.uuid.interfaces import IUUID

import unittest


class PloneCollectionTest(PloneAppCollectionClassTest):

    layer = COLLECTIVE_SORTEDLISTING_INTEGRATION_TESTING

    def setUp(self):
        self.portal = self.layer['portal']
        setRoles(self.portal, TEST_USER_ID, ['Manager'])
        self.portal.invokeFactory('SortableCollection', 'collection')
        self.collection = self.portal['collection']


query = [{
    'i': 'Title',
    'o': 'plone.app.querystring.operation.string.contains',
    'v': 'SC Test',
}]


class SortedCollectionTest(unittest.TestCase):

    layer = COLLECTIVE_SORTEDLISTING_INTEGRATION_TESTING

    def setUp(self):
        self.portal = self.layer['portal']
        setRoles(self.portal, TEST_USER_ID, ['Manager'])
        self.add_content()

    def add_content(self):
        self.sc = api.content.create(self.portal, 'SortableCollection', id='sc')
        self.sc.query = query
        self.sc.reindexObject()

        self.uids = OrderedDict()

        testdoc = api.content.create(self.portal, 'Document', title='SC Test Doc')
        testdoc.reindexObject()
        self.uids[testdoc.getId()] = IUUID(testdoc)

        testnewsitem = api.content.create(self.portal, 'News Item', title='SC Test News Item')
        testnewsitem.reindexObject()
        self.uids[testnewsitem.getId()] = IUUID(testnewsitem)

        testevent = api.content.create(self.portal, 'Event', title='SC Test Event')
        testevent.reindexObject()
        self.uids[testevent.getId()] = IUUID(testevent)

    def test_behavior_batch(self):
        results = ISortableCollectionBehavior(self.sc).results(batch=True)
        self.assertEqual(len(results), 3)

    def test_behavior_sorting(self):
        behavior = ISortableCollectionBehavior(self.sc)
        behavior.sorting = self.uids.values()
        self.assertEqual(
            [item.uuid() for item in behavior.results(batch=False)],
            self.uids.values()
        )
        self.assertEqual(
            behavior.results(batch=False),
            self.sc.results(batch=False)
        )

    def test_view_behavior(self):
        view = SortableCollectionView(self.sc, self.layer['request'])
        self.assertIsInstance(
            view.collection_behavior, SortableCollectionBehavior)

    def test_widget(self):
        widget = SortableQueryStringWidget(self.layer['request'])
        self.assertEqual(
            widget._base_args(),
            {
                'pattern': 'sortablequerystring',
                'value': u'',
                'name': None,
                'pattern_options':
                {
                    'previewCountURL': 'http://nohost/plone/@@querybuildernumberofresults',
                    'previewURL': 'http://nohost/plone/@@sortable_querybuilder_html_results',
                    'indexOptionsUrl': 'http://nohost/plone/@@qsOptions'
                }
            }
        )

class SortedCollectionTest(unittest.TestCase):

    layer = COLLECTIVE_SORTEDLISTING_FUNCTIONAL_TESTING

    def setUp(self):
        self.browser = z2.Browser(self.layer['app'])

    def test_view(self):
        self.


# EOF
