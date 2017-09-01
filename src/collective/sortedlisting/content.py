# -*- coding: utf-8 -*-

from collective.sortedlisting.interfaces import ISortableCollection
from plone.app.contenttypes.content import Collection
from zope.interface import implementer


@implementer(ISortableCollection)
class SortableCollection(Collection):
    """ """


    def results(self, **kwargs):
        from collective.sortedlisting.behavior import SortableCollectionBehavior
        return SortableCollectionBehavior(self).results(**kwargs)

# EOF
