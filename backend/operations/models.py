from django.contrib.postgres.fields import ArrayField, JSONField
from django.db import models


# ==========================
# 🔹 Operation models
# ==========================

class OperationRef(models.Model):
    operation_id = models.BigIntegerField(primary_key=True)
    name = models.TextField()
    participants = models.SmallIntegerField(choices=[(i, i) for i in range(4)])
    rules = ArrayField(
        models.TextField(),
        blank=True,
        default=list,
        help_text="Список правил операции"
    )

    class Meta:
        db_table = "operation_ref"

    def __str__(self):
        return self.name


class Law(models.Model):
    law_id = models.BigIntegerField(primary_key=True)
    title = models.TextField()
    law_date = models.DateField(db_index=True)
    reg_number = models.TextField(blank=True, null=True)
    text_url = models.TextField(blank=True, null=True)
    file_url = models.TextField(blank=True, null=True)
    embedding = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = "law"
        indexes = [
            models.Index(fields=["law_date"], name="idx_law_date"),
        ]

    def __str__(self):
        return self.title


class UserGuide(models.Model):
    guide_id = models.BigIntegerField(primary_key=True)
    name = models.TextField()
    section_no = models.TextField()

    class Meta:
        db_table = "user_guide"

    def __str__(self):
        return f"{self.section_no} — {self.name}"


class OrderHdr(models.Model):
    order_id = models.BigIntegerField(primary_key=True)

    class Meta:
        db_table = "order_hdr"

    def __str__(self):
        return str(self.order_id)


class BasisDoc(models.Model):
    basis_id = models.BigIntegerField(primary_key=True)
    name = models.TextField()

    class Meta:
        db_table = "basis_doc"

    def __str__(self):
        return self.name


class OperationOrderBasis(models.Model):
    operation = models.ForeignKey(
        OperationRef,
        on_delete=models.RESTRICT,
        db_column="operation_id",
        related_name="operation_order_links",
    )

    order = models.ForeignKey(
        OrderHdr,
        on_delete=models.CASCADE,
        db_column="order_id",
        related_name="operation_order_links",
    )

    basis = models.ForeignKey(
        BasisDoc,
        on_delete=models.RESTRICT,
        db_column="basis_id",
        related_name="operation_order_links",
    )

    class Meta:
        db_table = "operation_order_basis"

        constraints = [
            models.UniqueConstraint(
                fields=["operation", "order", "basis"],
                name="pk_operation_order_basis_unique"
            )
        ]

        indexes = [
            models.Index(fields=["operation"], name="idx_oob_operation"),
            models.Index(fields=["order"], name="idx_oob_order"),
            models.Index(fields=["basis"], name="idx_oob_basis"),
        ]

    def __str__(self):
        return f"{self.operation_id} / {self.order_id} / {self.basis_id}"


# ==========================
# 🔹 Logging models
# ==========================

class OperationLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)

    operation_id = models.BigIntegerField()
    participants = JSONField()
    response = JSONField()

    feedback = models.IntegerField(null=True, blank=True)
    user_comment = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "operation_log"

    def __str__(self):
        return f"Log #{self.id} — operation {self.operation_id}"
