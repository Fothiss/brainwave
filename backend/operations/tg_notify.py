import requests
import os

token = os.getenv('TELEGRAM_BOT_TOKEN')
chat_id = os.getenv('TELEGRAM_TEAM_CHAT_ID')

def send_telegram_message(text):
    """Отправляет сообщение в Telegram"""

    if not token or not chat_id:
        print("⚠️ Telegram токен или chat_id не настроены")
        return None
        
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    
    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    try:
        response = requests.post(url, json=payload)
        return response.json()
    except Exception as e:
        print(f"Telegram error: {e}")
        return None

def notify_new_operation(operation_log):
    """Отправляет уведомление о новом запросе"""
    message = f"""
        🆕 <b>Новый запрос в системе</b>
        ├─ Операция: {operation_log.operation_id}
        ├─ Участников: {len(operation_log.participants)}
        └─ ID: {operation_log.id}
            """.strip()
    send_telegram_message(message)

def notify_feedback(operation_log):
    """Отправляет уведомление об оценке"""
    rating = "👍" if operation_log.feedback == 1 else "👎"
    
    comment = operation_log.user_comment or "нет комментария"
    
    message = f"""
        {rating} <b>Пользователь оценил ответ</b>
        ├─ Оценка: {rating}
        ├─ Комментарий: {comment}
        └─ ID запроса: {operation_log.id}
            """.strip()
    send_telegram_message(message)