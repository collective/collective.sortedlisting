# -*- coding: utf-8 -*-
from collective.sortedlisting.testing import COLLECTIVE_SORTEDLISTING_FUNCTIONAL_TESTING   # noqa
from collective.sortedlisting.tile import SortableContentListingTile
from plone.app.testing import TEST_USER_NAME
from plone.app.testing import TEST_USER_PASSWORD
from plone.testing.z2 import Browser

import json
import unittest


query = [{
    'i': 'Title',
    'o': 'plone.app.querystring.operation.string.contains',
    'v': 'SC Test',
}]


class MixinCollectiveSortedListing(object):
    tile_class = SortableContentListingTile
    tile_name = 'collective.sortablequerystring.contentlisting'

    def get_tile(self, request, context):
        tile = self.tile_class(context, request)
        tile.__name__ = self.tile_name
        return tile


class SortedCollectionFunctionalTest(unittest.TestCase,
                                     MixinCollectiveSortedListing):

    layer = COLLECTIVE_SORTEDLISTING_FUNCTIONAL_TESTING

    def setUp(self):
        self.portal = self.layer['portal']

    def test_sortedlisting_tile(self):
        """
        """
        browser = Browser(self.layer['app'])
        auth = 'Basic {0}:{1}'.format(TEST_USER_NAME, TEST_USER_PASSWORD)
        browser.addHeader('Authorization', auth)
        browser.open(
            self.portal.absolute_url() +
            '/@@collective.sortablequerystring.contentlisting')
        expected = '<p class="discreet">There are currently no items in this' \
                   ' folder.</p>'  # noqa
        self.assertIn(expected, browser.contents)

    def test_added_classes(self):
        request = self.layer['request']
        tiledata = json.dumps({'sort_on': 'getObjPositionInParent'})
        request.form = {'_tiledata': tiledata}
        tile1 = self.get_tile(request, self.portal)
        tile1.update()
        self.assertEqual('getObjPositionInParent', tile1.sort_on)

        tiledata = json.dumps({'sort_on': None})
        request.form = {'_tiledata': tiledata}
        tile2 = self.get_tile(request, self.portal)
        tile2.update()
        # if sort_on value is None then no default value should be set.
        # So the sorting-field will be taken as sorting.
        self.assertEqual(None, tile2.sort_on)

# EOF
