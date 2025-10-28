import os
import re
import uuid
import requests
from dotenv import load_dotenv
from qdrant_client import QdrantClient, models
from docx import Document

# ==========================
# 🔹 Настройки окружения
# ==========================
load_dotenv()

AUTH_KEY = os.getenv("AUTH_KEY")   # ключ авторизации из .env
QDRANT_HOST = "95.215.56.225"
QDRANT_PORT = 6333
DOC_PATH = "Правила.docx"               # ⚠️ конвертируй .doc → .docx заранее
COLLECTION_NAME = "legal_rules_chunks"

def get_access_token(auth_key: str) -> str:
    """Получает временный access_token через /api/v2/oauth"""
    url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "RqUID": str(uuid.uuid4()),
        "Authorization": f"Basic {auth_key}",
    }
    data = {"scope": "GIGACHAT_API_PERS"}
    response = requests.post(url, headers=headers, data=data, verify=False)
    response.raise_for_status()
    token = response.json()["access_token"]
    print("🔑 Access token получен.")
    return token


# ==========================
# 🔹 2. Извлечение текста из .docx
# ==========================
def extract_text_from_docx(path: str) -> str:
    """Извлекает весь текст из документа Word"""
    doc = Document(path)
    return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])


# ==========================
# 🔹 3. Разбиение текста по пунктам
# ==========================
def split_by_sections(text: str):
    """Разбивает документ по номерам пунктов (1.1., 5.11.3. и т.д.)"""
    pattern = re.compile(r"(?=\n?\d+(\.\d+)+\.)")
    chunks = [c.strip() for c in pattern.split(text) if len(c.strip()) > 50]
    print(f"📄 Найдено {len(chunks)} чанков.")
    return chunks


# ==========================
# 🔹 4. Получение эмбеддингов через GigaChat
# ==========================
def get_embeddings(texts, access_token, batch_size=10):
    """Отправляет тексты в GigaChat порциями, чтобы избежать 413"""
    url = "https://gigachat.devices.sberbank.ru/api/v1/embeddings"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        payload = {
            "model": "EmbeddingsGigaR",
            "input": batch
        }

        response = requests.post(url, headers=headers, json=payload, verify=False)
        if response.status_code != 200:
            print(f"⚠️ Ошибка при обработке батча {i // batch_size + 1}: {response.text}")
            response.raise_for_status()
        data = response.json().get("data", [])
        embeddings = [item["embedding"] for item in data]
        all_embeddings.extend(embeddings)
        print(f"🧠 Получено {len(embeddings)} эмбеддингов (batch {i // batch_size + 1})")

    return all_embeddings



# ==========================
# 🔹 5. Загрузка данных в Qdrant
# ==========================
def upload_to_qdrant(chunks, embeddings):
    """Создаёт (если нужно) коллекцию и добавляет точки"""
    client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

    # создаём коллекцию, если нет
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing:
        dim = len(embeddings[0])
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=dim, distance=models.Distance.COSINE)
        )
        print(f"📦 Коллекция '{COLLECTION_NAME}' создана ({dim} dim).")

    points = [
        models.PointStruct(
            id=str(uuid.uuid4()),
            vector=emb,
            payload={"text": chunk}
        )
        for chunk, emb in zip(chunks, embeddings)
    ]

    client.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"✅ Загружено {len(points)} чанков в Qdrant.")


# ==========================
# 🔹 6. Основной сценарий
# ==========================
def process_doc_to_qdrant():
    print("▶️ Запуск пайплайна...")
    token = get_access_token(AUTH_KEY)
    text = extract_text_from_docx(DOC_PATH)
    chunks = split_by_sections(text)
    embeddings = get_embeddings(chunks, token)
    upload_to_qdrant(chunks, embeddings)
    print("🎯 Готово!")


# ==========================
# 🔹 Запуск
# ==========================
if __name__ == "__main__":
    process_doc_to_qdrant()
