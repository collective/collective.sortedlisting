# -*- coding: utf-8 -*-
from collective.sortedlisting import _
from collective.sortedlisting.widget import SortableQueryStringFieldWidget
from plone.app.contenttypes.behaviors.collection import Collection
from plone.app.contenttypes.behaviors.collection import ICollection
from plone.autoform import directives as form
from plone.autoform.interfaces import IFormFieldProvider
from plone.batching import Batch
from plone.dexterity.interfaces import IDexterityContent
from zope import schema
from zope.component import adapter
from zope.interface import implementer_only
from zope.interface import provider


@provider(IFormFieldProvider)
class ISortableCollectionBehavior(ICollection):

    # override QueryString widget with our sortable version
    form.widget('query', SortableQueryStringFieldWidget)

    # we need an additional field to store the sorting
    # as UIDs of the found objects (brains)
    sorting = schema.List(
        title=_(u'Sorting'),
        description=_(u'Widget specific sorting of the search results'),
        default=[],
        missing_value=[],
        value_type=schema.TextLine(),
        required=False,
    )


@implementer_only(ISortableCollectionBehavior)
@adapter(IDexterityContent)
class SortableCollectionBehavior(Collection):
    """ """

    def results(self, batch=True, b_start=0, b_size=None,
                sort_on=None, limit=None, brains=False,
                custom_query=None):
        results = super(SortableCollectionBehavior, self).results(
            batch, b_start, b_size, sort_on, limit, brains, custom_query)
        # apply the custom sorting to the resultset according to
        # our sorting list
        positions = {j: i for i, j in enumerate(self.sorting)}
        results = sorted(
            results, key=lambda item: positions.get(item.uuid(), 999))
        if batch:
            if not b_size:
                b_size = self.item_count
            results = Batch(results, b_size, start=b_start)
        return results

    # store and access sorting list from our context (ie. SortableCollection)

    @property
    def sorting(self):
        return getattr(self.context, 'sorting', [])

    @sorting.setter
    def sorting(self, value):
        self.context.sorting = value
