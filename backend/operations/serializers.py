from rest_framework import serializers
from operations.models import OperationRef


class OperationRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationRef
        fields = ['operation_id', 'name', 'participants']
