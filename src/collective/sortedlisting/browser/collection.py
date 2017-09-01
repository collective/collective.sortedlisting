# -*- coding: utf-8 -*-
from Acquisition import aq_inner
from plone.app.contenttypes.browser.collection import CollectionView
from collective.sortedlisting.behavior import SortableCollection


class SortableCollectionView(CollectionView):

    @property
    def collection_behavior(self):
        return SortableCollection(aq_inner(self.context))
