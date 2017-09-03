# -*- coding: utf-8 -*-
from collections import OrderedDict
from collective.sortedlisting.behavior import ISortableCollectionBehavior
from collective.sortedlisting.behavior import SortableCollectionBehavior
from collective.sortedlisting.browser.collection import SortableCollectionView
from collective.sortedlisting.testing import COLLECTIVE_SORTEDLISTING_FUNCTIONAL_TESTING   # noqa
from collective.sortedlisting.testing import COLLECTIVE_SORTEDLISTING_INTEGRATION_TESTING  # noqa
from collective.sortedlisting.widget import SortableQueryStringWidget
from plone import api
from plone.app.contenttypes.tests.test_collection import PloneAppCollectionClassTest       # noqa
from plone.app.testing import setRoles
from plone.app.testing import SITE_OWNER_NAME
from plone.app.testing import SITE_OWNER_PASSWORD
from plone.app.testing import TEST_USER_NAME
from plone.app.testing import TEST_USER_PASSWORD
from plone.testing.z2 import Browser

import unittest


query = [{
    'i': 'Title',
    'o': 'plone.app.querystring.operation.string.contains',
    'v': 'SC Test',
}]


class SortedCollectionFunctionalTest(unittest.TestCase):

    layer = COLLECTIVE_SORTEDLISTING_FUNCTIONAL_TESTING

    def setUp(self):
        self.portal = self.layer['portal']

    def test_newsletter_tile(self):
        """
        """
        browser = Browser(self.layer['app'])
        auth = 'Basic %s:%s' % (TEST_USER_NAME, TEST_USER_PASSWORD)
        browser.addHeader('Authorization', auth)
        browser.open(
            self.portal.absolute_url() +
            '/@@collective.sortablequerystring.contentlisting')
        expected = '<p class="discreet">There are currently no items in this folder.</p>'  # noqa
        self.assertIn(expected, browser.contents)

# EOF
