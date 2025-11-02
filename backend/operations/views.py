from django.shortcuts import get_object_or_404
from rest_framework import generics, filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from utils.get_guide_and_docs_by_operation import get_guide_and_docs_by_operation
from utils.get_advice import get_legal_advice
from operations.models import OperationRef, OperationLog
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
        participants = request.data.get("participants", [])

        if not operation_id:
            return Response({"error": "operation_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(participants, list):
            return Response({"error": "participants must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        operation_obj = get_object_or_404(OperationRef, operation_id=operation_id)

        guide_arr, docs_arr = get_guide_and_docs_by_operation(operation_id)
        rules = operation_obj.rules or []
        section_number = rules[0] if rules else ""

        legal_advice_results = []

        for p in participants:
            participant_type = p.get("type")
            is_resident = p.get("isResident")

            if not participant_type or not is_resident:
                continue

            legal_text = get_legal_advice(
                operation=operation_obj.name,
                participant_type=participant_type,
                section_number=section_number
            )

            legal_advice_results.append({
                "participant": p,
                "advice": legal_text
            })

        log = OperationLog.objects.create(
            operation_id=operation_id,
            participants=participants,
            response={
                "operation": OperationRefSerializer(operation_obj).data,
                "guide_data": guide_arr,
                "docs_data": docs_arr,
                "legal_advice": legal_advice_results
            }
        )

        return Response({
            "log_id": log.id,
            "operation": OperationRefSerializer(operation_obj).data,
            "guide_data": guide_arr,
            "docs_data": docs_arr,
            "legal_advice": legal_advice_results
        }, status=status.HTTP_200_OK)
