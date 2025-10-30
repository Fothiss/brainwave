from django.shortcuts import get_object_or_404
from rest_framework import generics, filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from utils.get_guide_and_docs_by_operation import get_guide_and_docs_by_operation
from utils.get_advice import get_legal_advice
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


class OperationDetailsView(APIView):
    def post(self, request, *args, **kwargs):
        operation_id = request.data.get("operation_id")
        if not operation_id:
            return Response({"error": "operation_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        operation_obj = get_object_or_404(OperationRef, operation_id=operation_id)

        guide_arr, docs_arr = get_guide_and_docs_by_operation(operation_id)

        rules = operation_obj.rules or []
        section_number = rules[0] if rules else ""

        legal_result = get_legal_advice(
            operation=operation_obj.name,
            participant_type="Физическое лицо",
            section_number=section_number
        )

        return Response({
            "operation": OperationRefSerializer(operation_obj).data,
            "guide_data": guide_arr,
            "docs_data": docs_arr,
            "legal_advice": legal_result
        }, status=status.HTTP_200_OK)
