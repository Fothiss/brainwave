from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os
from langchain_gigachat.chat_models.gigachat import GigaChat
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

load_dotenv()

class DecomposedQuery(BaseModel):
    appeals: str = Field(description="запрос, связанный с обращениями")
    compliance: str = Field(description="запрос, связанный с внутренними процедурами и рисками банков")
    attorney: str = Field(description="запрос, связанный с довереностью, полномочиями представителей")
    stocks_pledge: str = Field(description="запрос, связанный с залогами ценных бумаг")

parser = JsonOutputParser(pydantic_object=DecomposedQuery)

def decompose_query(llm, user_query: str) -> str:
    """Функция для декомпозиции пользовательского запроса"""

    prompt = ChatPromptTemplate.from_template('''
            Ты - эксперт по юридическим документам на фондовой бирже. 
            Раздели следующий запрос пользователя на 4 отдельных запроса для поиска в разных таблицах БД.

            ТИПЫ БАЗ ДАННЫХ:
            1. appeals - регулирование процедур подачи и рассмотрения обращений граждан и организаций (указы, ФЗ-442)
            2. compliance - внутренние процедуры и риски банков (нормативы Банка России 3624-У, 4501-У)
            3. attorney - доверенность, полномочия представителей (ГК РФ ст. 185)
            4. stocks_pledge - залог ценных бумаг, акции в качестве залога (ОП 19)

            ИСХОДНЫЙ ЗАПРОС: {user_query}

            ИНСТРУКЦИИ:
            - Создай по одному целевому вопросу для каждой таблицы БД
            - Вопросы должны быть конкретными и релевантными исходному запросу
            - Если запрос не относится к какой-то таблице, напиши ""
            - Форматируй ответ четко по шаблону ниже

            ФОРМАТ ОТВЕТА:
            {{
                "appeals": "запрос, связанный с обращениями",
                "compliance": "запрос, связанный с внутренними процедурами и рисками банков",
                "attorney": "запрос, связанный с довереностью, полномочиями представителей",
                "stocks_pledge": "запрос, связанный с залогами ценных бумаг",
            }}
            ''')
    try:
        messages = prompt.format_messages(
            user_query=user_query,
            format_instructions=parser.get_format_instructions())
        response = llm.invoke(messages)
        parsed_response = parser.parse(response.content)

        return parsed_response
    
    except Exception as e:
        print(f"Ошибка при декомпозиции запроса: {e}")
        return {
            "appeals": user_query,
            "compliance": user_query,
            "attorney": user_query,
            "stocks_pledge": user_query
        }


model = GigaChat(
    model="GigaChat-2",
    temperature=0.1,
    max_tokens=100,
    credentials=os.getenv("GIGACHAT_CREDENTIALS"),
    verify_ssl_certs=False
)

result = decompose_query(model, "Как оформить залог акций для кредита?")
print("Результат:", result)