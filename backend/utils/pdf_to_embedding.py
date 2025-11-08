from typing import Union
from pathlib import Path
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer


def extract_text_from_file(file_path: str) -> str:
    """
    Извлекает текст из файла формата PDF и TXT.
    
    :param file_path: путь к файлу
    :return: строка содержащая весь текст из файла
    """
    if not isinstance(file_path, (Path, str)):
        raise ValueError("file_path должен быть либо объектом Path, либо строкой")

    # Обработка PDF-файлов
    if file_path.endswith('.pdf'):
        with open(file_path, 'rb') as f:
            reader = PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text.strip() or None

    # Обработка TXT-файлов
    elif file_path.endswith('.txt'):
        with open(file_path, encoding='utf-8', errors="ignore") as f:
            return f.read().strip()

    else:
        raise NotImplementedError("Поддерживаются только форматы .pdf и .txt")


def create_embedding(text: str, model_name: str = 'all-MiniLM-L6-v2') -> list:
    """
    Создает эмбеддинг заданного текста используя указанную модель трансформеров
    
    :param text: текст для преобразования в эмбеддинг
    :param model_name: название модели для эмбеддинга
    :return: список чисел представляющих эмбеддинг текста
    """
    model = SentenceTransformer(model_name)
    embedding = model.encode([text])
    return embedding.tolist()[0]


def process_document_and_get_embedding(file_path: Union[str, Path]) -> dict:
    """
    Основной метод: принимает файл, извлекает текст и создает эмбеддинг
    
    :param file_path: путь к файлу
    :return: словарь содержащий текст и эмбеддинг
    """
    try:
        extracted_text = extract_text_from_file(file_path)
        if not extracted_text:
            print("Ошибка: невозможно извлечь текст из файла")
            return {}

        embedding = create_embedding(extracted_text)
        return {
            "text": extracted_text,
            "embedding": embedding
        }
    except Exception as e:
        print(f"Произошла ошибка: {e}")
        return {}

# result = process_document_and_get_embedding('file_path.pdf')
