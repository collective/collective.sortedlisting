# -*- coding: utf-8 -*-
from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.dexterity.interfaces import IDexterityFTI
from collective.sortedlisting.interfaces import ISortedCollection
from collective.sortedlisting.testing import COLLECTIVE_SORTEDLISTING_INTEGRATION_TESTING  # noqa
from zope.component import createObject
from zope.component import queryUtility

import unittest


class SortedCollectionIntegrationTest(unittest.TestCase):

    layer = COLLECTIVE_SORTEDLISTING_INTEGRATION_TESTING

    def setUp(self):
        """Custom shared utility setup for tests."""
        self.portal = self.layer['portal']
        setRoles(self.portal, TEST_USER_ID, ['Manager'])
        self.installer = api.portal.get_tool('portal_quickinstaller')

    def test_schema(self):
        fti = queryUtility(IDexterityFTI, name='SortedCollection')
        schema = fti.lookupSchema()
        self.assertEqual(ISortedCollection, schema)

    def test_fti(self):
        fti = queryUtility(IDexterityFTI, name='SortedCollection')
        self.assertTrue(fti)

    def test_factory(self):
        fti = queryUtility(IDexterityFTI, name='SortedCollection')
        factory = fti.factory
        obj = createObject(factory)
        self.assertTrue(ISortedCollection.providedBy(obj))

    def test_adding(self):
        obj = api.content.create(
            container=self.portal,
            type='SortedCollection',
            id='SortedCollection',
        )
        self.assertTrue(ISortedCollection.providedBy(obj))
