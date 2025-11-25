from rest_framework import serializers

from operations.models import OperationRef


class OperationRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationRef
        fields = ['operation_id', 'name', 'participants']


class OperationFeedbackSerializer(serializers.Serializer):
    log_id: int = serializers.IntegerField()
    feedback: int = serializers.IntegerField()
    user_comment: str = serializers.CharField(required=False, allow_blank=True)
