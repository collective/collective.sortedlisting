# -*- coding: utf-8 -*-

from collective.sortedlisting.interfaces import ISortableCollection
from plone.app.contenttypes.content import Collection
from zope.interface import implementer


@implementer(ISortableCollection)
class SortableCollection(Collection):
    """ """


# EOF
