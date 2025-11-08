import threading
from django.db.models.signals import post_save
from django.dispatch import receiver

from operations.models import Law
from utils.google_drive import download_pdf_for_folder
from utils.pdf_to_embedding import process_document_and_get_embedding
from utils.process import upload_to_qdrant_one_doc


def process_law_task(law_id: int, file_url: str):
    """Выполняет процессинг документов асинхронно"""
    try:
        files: list[str] = download_pdf_for_folder(file_url)
        for file in files:
            result = process_document_and_get_embedding(file)
            collection_name = f"law_{law_id}"
            upload_to_qdrant_one_doc(result["text"], result["embedding"], collection_name)
        print(f"✅ Обработка документа {law_id} завершена")
    except Exception as e:
        print(f"❌ Ошибка при обработке {law_id}: {e}")


@receiver(post_save, sender=Law)
def add_embedding_to_qdrant(sender, instance, created, **kwargs):
    if created and instance.file_url:
        thread = threading.Thread(target=process_law_task, args=(instance.law_id, instance.file_url))
        thread.start()
        print(f"🚀 Асинхронная обработка документа {instance.law_id} запущена")
