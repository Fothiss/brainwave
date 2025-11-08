import os
import re
import requests
from googleapiclient.discovery import build
from google.oauth2 import service_account

SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=SCOPES
)


def download_pdf_for_folder(folder_url: str) -> list[str]:
    """
    Скачивает все PDF из публичной папки Google Drive и возвращает список
    абсолютных путей сохранённых файлов.
    """

    match = re.search(r'/folders/([a-zA-Z0-9_-]+)', folder_url)
    if not match:
        print(f"❌ Невозможно извлечь ID папки из URL: {folder_url}")
        return []

    folder_id = match.group(1)
    service = build('drive', 'v3', credentials=credentials)

    query = f"'{folder_id}' in parents and mimeType='application/pdf'"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get('files', [])

    if not files:
        print(f"⚠️ Нет PDF-файлов в папке: {folder_url}")
        return []

    downloads_dir = os.path.abspath("downloads")
    os.makedirs(downloads_dir, exist_ok=True)

    saved_paths = []

    for file in files:
        file_id = file["id"]
        name = file["name"]
        print(f"⬇️ Скачиваю: {name}")

        download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        response = requests.get(download_url)

        if response.status_code == 200:
            save_path = os.path.join(downloads_dir, name)
            with open(save_path, "wb") as f:
                f.write(response.content)
            saved_paths.append(save_path)
            print(f"✅ Скачан: {save_path}")
        else:
            print(f"❌ Ошибка загрузки {name}: {response.status_code}")

    print(f"🎉 Все PDF из папки {folder_id} загружены.")
    return saved_paths
