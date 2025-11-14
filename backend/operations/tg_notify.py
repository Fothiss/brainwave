import requests
import os
import re


def send_telegram_message(text):
    """Отправляет сообщение в Telegram"""

    TG_TOKEN = os.getenv("TG_TOKEN")
    TG_CHAT_ID = os.getenv("TG_CHAT_ID")

    if not TG_TOKEN or not TG_CHAT_ID:
        print("⚠️ Telegram токен или TG_CHAT_ID не настроены")
        return None
        
    url = f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage"
    
    payload = {
        'chat_id': TG_CHAT_ID,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    try:
        response = requests.post(url, json=payload)
        return response.json()
    except Exception as e:
        print(f"Telegram error: {e}")
        return None
    

def clean_advice_text(text):
    """Конвертирует Markdown в HTML"""
    # Заменяем заголовки с ### на HTML теги
    text = re.sub(r'###\s*(.+)', r'<b>\1</b>', text)  # ### Заголовок → <b>Заголовок</b>
    text = re.sub(r'##\s*(.+)', r'<b>\1</b>', text)   # ## Заголовок → <b>Заголовок</b>
    text = re.sub(r'#\s*(.+)', r'<b>\1</b>', text)    # # Заголовок → <b>Заголовок</b>
    
    # Заменяем ** на <b> для жирного текста
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)  # **текст** → <b>текст</b>
    
    return text

def notify_new_operation(operation_log):
    """Отправляет уведомление о новом запросе"""

    legal_advice = operation_log.response.get('legal_advice', []) if operation_log.response else []
    
    advice_text = "Нет ответа от модели"
    if legal_advice:
        advice_text = legal_advice[0]['advice']
        advice_text = clean_advice_text(advice_text)

    message = f"""🆕 <b>Новый запрос в системе</b>
Операция: {operation_log.operation_id}
Участников: {len(operation_log.participants)}
ID: {operation_log.id}

✅ <b>Ответ модели:</b>
{advice_text}"""

    send_telegram_message(message)


def notify_feedback(operation_log):
    """Отправляет уведомление об оценке"""
    rating = "👍" if operation_log.feedback == 1 else "👎"
    
    comment = operation_log.user_comment or "нет комментария"
    
    message = f"""💯 <b>Пользователь оценил ответ</b>
Оценка: {rating}
Комментарий: {comment}
ID запроса: {operation_log.id}"""
    
    send_telegram_message(message)