import psycopg2
import os


def get_guide_and_docs_by_operation(operation_id):
    """
    Возвращаем два списка:
     - первый: [name, section_no] из таблицы orders
     - второй: [name, doc_id] из таблицы foundation_docs
    для указанного operation_id.
    """

    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT')
    DB_NAME = os.getenv('DB_NAME')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')

    guide_result = []
    docs_result = []

    query_guide = """
    SELECT DISTINCT ug.name, ug.section_no
    FROM public.operation_order_basis as oob
    LEFT JOIN public.user_guide as ug ON ug.guide_id = oob.order_id
    WHERE oob.operation_id = %s;
    """

    query_docs = """
    SELECT DISTINCT bd.name, bd.basis_id
    FROM public.operation_order_basis AS oob
    LEFT JOIN public.basis_doc AS bd ON bd.basis_id = oob.basis_id
    WHERE oob.operation_id = %s;
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
