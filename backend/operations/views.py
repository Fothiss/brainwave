from django.shortcuts import get_object_or_404
from rest_framework import generics, filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from dataclasses import dataclass

from utils.get_guide_and_docs_by_operation import get_guide_and_docs_by_operation
from utils.get_advice import get_legal_advice
from operations.models import OperationRef, OperationLog
from operations.serializers import OperationRefSerializer, OperationFeedbackSerializer


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
        log_id = request.data.get("log_id")
        doc_id = request.data.get("doc_id")

        if not operation_id:
            return Response({"error": "operation_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(participants, list):
            return Response({"error": "participants must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        operation_obj = get_object_or_404(OperationRef, operation_id=operation_id)

        # Получаем массивы руководства и документов
        guide_arr, docs_arr = get_guide_and_docs_by_operation(operation_id)

        # Секция операции (для get_legal_advice)
        rules = operation_obj.rules or []
        section_number = rules[0] if rules else ""

        # ============================
        # doc_id НЕ передан
        # и документов больше 1 → выходим ДО heavy-логики
        # ============================
        if not doc_id and len(docs_arr) > 1:

            response_data = {
                "operation": OperationRefSerializer(operation_obj).data,
                "guide_data": guide_arr,
                "docs_data": docs_arr,
                "legal_advice": []
            }

            if log_id:
                log = get_object_or_404(OperationLog, id=log_id)
                log.operation_id = operation_id
                log.participants = participants
                log.response = response_data
                log.save()
            else:
                log = OperationLog.objects.create(
                    operation_id=operation_id,
                    participants=participants,
                    response=response_data
                )

            return Response({
                "log_id": log.id,
                **response_data
            }, status=status.HTTP_200_OK)

        # ============================
        # doc_id передан → выполняем ПОЛНУЮ логику
        # ============================

        doc_item = next((item for item in docs_arr if item[1] == doc_id), None) if doc_id is not None else docs_arr

        if not doc_item:
            return Response({"error": "Invalid doc_id"}, status=status.HTTP_400_BAD_REQUEST)

        filtered_docs_arr = [doc_item]

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

        response_data = {
            "operation": OperationRefSerializer(operation_obj).data,
            "guide_data": guide_arr,
            "docs_data": filtered_docs_arr,
            "legal_advice": legal_advice_results
        }

        if log_id:
            log = get_object_or_404(OperationLog, id=log_id)
            log.operation_id = operation_id
            log.participants = participants
            log.response = response_data
            log.save()
        else:
            log = OperationLog.objects.create(
                operation_id=operation_id,
                participants=participants,
                response=response_data
            )

        return Response({
            "log_id": log.id,
            **response_data
        }, status=status.HTTP_200_OK)


@dataclass
class OperationFeedbackData:
    log_id: int
    feedback: int
    user_comment: str = ""


class OperationFeedbackView(APIView):
    def post(self, request, *args, **kwargs) -> Response:
        serializer = OperationFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = OperationFeedbackData(
            log_id=serializer.validated_data["log_id"],
            feedback=serializer.validated_data["feedback"],
            user_comment=serializer.validated_data.get("user_comment", "")
        )

        log = get_object_or_404(OperationLog, id=data.log_id)

        log.feedback = data.feedback
        log.user_comment = data.user_comment
        log.save(update_fields=["feedback", "user_comment"])

        return Response({"status": "feedback saved"}, status=200)
