import re
import requests
from typing import List
from pathlib import Path

from googleapiclient.discovery import build
from google.oauth2 import service_account

BASE_DIR = Path(__file__).resolve().parent
SERVICE_ACCOUNT_FILE = BASE_DIR / "service_account.json"
SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]

credentials = service_account.Credentials.from_service_account_file(
    str(SERVICE_ACCOUNT_FILE),
    scopes=SCOPES,
)


def extract_folder_id(folder_url: str) -> str | None:
    """
    Извлекает ID папки Google Drive из URL.
    """
    match = re.search(r"/folders/([a-zA-Z0-9_-]+)", folder_url)
    return match.group(1) if match else None


def download_pdf_for_folder(folder_url: str) -> List[str]:
    """
    Скачивает все PDF-файлы из публичной папки Google Drive.
    Возвращает список абсолютных путей к сохранённым файлам.
    """

    folder_id = extract_folder_id(folder_url)
    if not folder_id:
        print(f"❌ Невозможно извлечь ID папки из URL: {folder_url}")
        return []

    # Google Drive API service
    service = build("drive", "v3", credentials=credentials)

    query = f"'{folder_id}' in parents and mimeType='application/pdf'"
    results = service.files().list(
        q=query,
        fields="files(id, name)"
    ).execute()

    files = results.get("files", [])
    if not files:
        print(f"⚠️ Нет PDF-файлов в папке: {folder_url}")
        return []

    downloads_dir = Path("downloads").resolve()
    downloads_dir.mkdir(parents=True, exist_ok=True)

    saved_paths: List[str] = []

    for file_meta in files:
        file_id = file_meta["id"]
        name = file_meta["name"]

        print(f"⬇️ Скачиваю: {name}")

        response = requests.get(
            f"https://drive.google.com/uc?export=download&id={file_id}"
        )

        if response.status_code == 200:
            save_path = downloads_dir / name
            save_path.write_bytes(response.content)

            saved_paths.append(str(save_path))
            print(f"✅ Скачан: {save_path}")
        else:
            print(f"❌ Ошибка загрузки {name}: {response.status_code}")

    print(f"🎉 Все PDF из папки {folder_id} загружены.")
    return saved_paths
