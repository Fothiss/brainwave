from rest_framework import generics, filters
from rest_framework.pagination import PageNumberPagination
from operations.models import OperationRef
from operations.serializers import OperationRefSerializer


class OperationRefPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 500


class OperationRefListView(generics.ListAPIView):
    queryset = OperationRef.objects.all().order_by('operation_id')
    serializer_class = OperationRefSerializer
    pagination_class = OperationRefPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
