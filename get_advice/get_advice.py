import os
from qdrant_client import QdrantClient
from langchain_gigachat.chat_models.gigachat import GigaChat
from langchain_gigachat.embeddings import GigaChatEmbeddings
from dotenv import load_dotenv

load_dotenv()

# Настройки подключения
QDRANT_HOST = "95.215.56.225"
QDRANT_PORT = 6333
COLLECTION_NAME = "legal_rules_chunks"

# Инициализация клиентов
qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

# Инициализация модели GigaChat
model = GigaChat(
    model="GigaChat-2",
    temperature=0.1,
    max_tokens=1000,
    credentials=os.getenv("GIGACHAT_CREDENTIALS"),
    verify_ssl_certs=False
)

def search_relevant_chunks(query: str, section_number: str = None, limit: int = 5):
    """
    Поиск релевантных чанков в векторной БД
    
    Args:
        query: Поисковый запрос
        section_number: Номер раздела для фильтрации (опционально)
        limit: Количество возвращаемых результатов
    
    Returns:
        List[dict]: Список релевантных чанков
    """
    # Создаем поисковый запрос
    search_query = query
    
    # Если указан номер раздела, добавляем его в запрос для повышения релевантности
    if section_number:
        search_query = f"{section_number} {query}"
    
    # Получаем эмбеддинг для запроса    
    embeddings = GigaChatEmbeddings(
        model="EmbeddingsGigaR",
        credentials=os.getenv("GIGACHAT_CREDENTIALS"),
        verify_ssl_certs=False
    )
    query_embedding = embeddings.embed_query(search_query)
    
    # Выполняем поиск в Qdrant
    search_results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=limit
    )
    
    # Форматируем результаты
    relevant_chunks = []
    for result in search_results.points:
        relevant_chunks.append({
            "text": result.payload.get("text", ""),
            "score": result.score
        })
    
    return relevant_chunks

def create_prompt(operation: str, participant_type: str, section_number: str, relevant_chunks: list) -> str:
    """
    Создание промпта для LLM на основе контекста и пользовательского запроса
    
    Args:
        operation: Название операции
        participant_type: Тип лица
        section_number: Номер раздела
        relevant_chunks: Список релевантных чанков
    
    Returns:
        str: Сформированный промпт
    """
    # Формируем контекст из релевантных чанков
    context = "\n\n".join([f"Контекст {i+1} (релевантность: {chunk['score']:.3f}):\n{chunk['text']}" 
                          for i, chunk in enumerate(relevant_chunks)])
    
    prompt = f"""
        Ты - юридический ассистент, который помогает разобраться в правилах и процедурах.
        На основе предоставленного контекста ответь на вопрос пользователя.

        ИНФОРМАЦИЯ О ЗАПРОСЕ:
        - Операция: {operation}
        - Тип лица: {participant_type}
        - Раздел правил: {section_number}

        КОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ:
        {context}

        ИНСТРУКЦИИ:
        1. Внимательно изучи предоставленный контекст
        2. Сформулируй четкий и структурированный ответ
        3. Если в контексте есть конкретные требования, процедуры или ограничения - выдели их
        4. Если в контексте есть список необходимых документов - укажи их
        5. Если информации в контексте недостаточно для полного ответа - укажи это
        6. Ответ должен быть полезным и практичным для пользователя

        ОТВЕТ (на русском языке):
        """
    return prompt

def get_llm_response(prompt: str) -> str:
    """
    Получение ответа от LLM GigaChat
    
    Args:
        prompt: Сформированный промпт
    
    Returns:
        str: Ответ от модели
    """
    try:
        response = model.invoke(prompt)
        return response.content
    except Exception as e:
        return f"Ошибка при обращении к LLM: {str(e)}"

def get_legal_advice(operation: str, participant_type: str, section_number: str) -> str:
    """
    Основная функция для получения юридической консультации
    
    Args:
        operation: Название операции (например, "Открытие лицевого счета")
        participant_type: Тип лица (например, "Физическое лицо")
        section_number: Номер раздела правил (например, "5.1")
    
    Returns:
        str: Понятный ответ пользователю
    """
    print(f"🔍 Поиск информации: операция='{operation}', лицо='{participant_type}', раздел='{section_number}'")
    
    # 1. Формируем поисковый запрос
    search_query = f"{operation} {participant_type}"
    
    # 2. Ищем релевантные чанки
    relevant_chunks = search_relevant_chunks(
        query=search_query,
        section_number=section_number,
        limit=5
    )
    
    if not relevant_chunks:
        return "К сожалению, не удалось найти релевантную информацию в базе правил. Пожалуйста, уточните параметры запроса."
    
    print(f"📚 Найдено {len(relevant_chunks)} релевантных фрагментов")
    
    # 3. Создаем промпт
    prompt = create_prompt(operation, participant_type, section_number, relevant_chunks)
    
    # 4. Получаем ответ от LLM
    response = get_llm_response(prompt)
    
    return response

# Пример использования
if __name__ == "__main__":
    # Тестовый пример
    result = get_legal_advice(
        operation="Открытие лицевого счета",
        participant_type="Физическое лицо", 
        section_number="5.1"
    )
    
    print("\n" + "="*50)
    print("РЕЗУЛЬТАТ:")
    print("="*50)
    print(result)