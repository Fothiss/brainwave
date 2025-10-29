import psycopg2

DB_HOST = env('DB_HOST')
DB_PORT = env('DB_PORT')
DB_NAME = env('DB_NAME')
DB_USER = env('DB_USER')
DB_PASSWORD = env('DB_PASSWORD')

def get_guide_and_docs_by_operation(operation_id):
    """
    Возвращаем два списка:
     - первый: [name, section_no] из таблицы orders
     - второй: [name, doc_id] из таблицы foundation_docs
    для указанного operation_id.
    """
    guide_result = []
    docs_result = []

    query_guide = """
    SELECT DISTINCT ug.name, ug.section_no
    FROM public.guide_operation_doc as god
    LEFT JOIN public.user_guide as ug ON ug.guide_id = god.guide_id
    WHERE god.operation_id = %s;
    """

    query_docs = """
    SELECT DISTINCT bd.name, bd.doc_id
    FROM public.guide_operation_doc AS god
    LEFT JOIN public.base_document AS bd ON bd.doc_id = god.doc_id
    WHERE god.operation_id = %s;
    """

    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )

        with conn.cursor() as cur:
            cur.execute(query_guide, (operation_id,))
            for name, section_no in cur.fetchall():
                guide_result.append([name, section_no])

        with conn.cursor() as cur:
            cur.execute(query_docs, (operation_id,))
            for name, doc_id in cur.fetchall():
                docs_result.append([name, doc_id])

    finally:
        if conn:
            conn.close()

    return guide_result, docs_result


# Пример использования
if __name__ == "__main__":
    operation_id = 100
    guide_arr, docs_arr = get_guide_and_docs_by_operation(operation_id)
    print("Guide (name, section_no):", guide_arr)
    print("Foundation docs (name, doc_id):", docs_arr)
