import os
import psycopg2
from typing import Iterable, Sequence, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, Match

# ---------- конфиг ----------
PG_DSN     = os.getenv("DATABASE_URL", "postgresql://app:app_pass@localhost:5432/appdb")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION = "laws"       # имя коллекции в Qdrant
EMB_DIM    = 768          # выставь под свою API-модель эмбеддингов
# ----------------------------

# ---------- Postgres ----------
def pg_conn():
    return psycopg2.connect(PG_DSN)

# Operation_ref
def op_insert(name: str, participants: int) -> int:
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO operation_ref (name, participants) VALUES (%s,%s) RETURNING operation_id",
            (name, participants),
        )
        return cur.fetchone()[0]

def op_update(operation_id: int, name: Optional[str]=None, participants: Optional[int]=None) -> None:
    sets, vals = [], []
    if name is not None: sets.append("name=%s"); vals.append(name)
    if participants is not None: sets.append("participants=%s"); vals.append(participants)
    if not sets: return
    vals.append(operation_id)
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute(f"UPDATE operation_ref SET {', '.join(sets)} WHERE operation_id=%s", vals)

def op_delete(operation_id: int) -> None:
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM operation_ref WHERE operation_id=%s", (operation_id,))

# Law
def law_insert(title: str, law_date: str, reg_number: str=None, text_url: str=None, file_url: str=None, embedding=None) -> int:
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute(
            """INSERT INTO law (title, law_date, reg_number, text_url, file_url, embedding)
               VALUES (%s,%s,%s,%s,%s,%s) RETURNING law_id""",
            (title, law_date, reg_number, text_url, file_url, embedding),
        )
        return cur.fetchone()[0]

def law_update(law_id: int, **fields) -> None:
    if not fields: return
    sets = [f"{k}=%s" for k in fields.keys()]
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute(f"UPDATE law SET {', '.join(sets)} WHERE law_id=%s", [*fields.values(), law_id])

def law_delete(law_id: int) -> None:
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM law WHERE law_id=%s", (law_id,))

# User guide
def guide_insert(name: str, section_no: str) -> int:
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO user_guide (name, section_no) VALUES (%s,%s) RETURNING guide_id", (name, section_no))
        return cur.fetchone()[0]

def guide_update(guide_id: int, name: Optional[str]=None, section_no: Optional[str]=None) -> None:
    sets, vals = [], []
    if name is not None: sets.append("name=%s"); vals.append(name)
    if section_no is not None: sets.append("section_no=%s"); vals.append(section_no)
    if sets:
        vals.append(guide_id)
        with pg_conn() as conn, conn.cursor() as cur:
            cur.execute(f"UPDATE user_guide SET {', '.join(sets)} WHERE guide_id=%s", vals)

def guide_delete(guide_id: int) -> None:
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM user_guide WHERE guide_id=%s", (guide_id,))

# Order + Basis + Link
def order_insert() -> int:
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO order_hdr DEFAULT VALUES RETURNING order_id")
        return cur.fetchone()[0]

def basis_insert(name: str) -> int:
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute("INSERT INTO basis_doc (name) VALUES (%s) RETURNING basis_id", (name,))
        return cur.fetchone()[0]

def link_operation_order_basis(operation_id: int, order_id: int, basis_id: int) -> None:
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO operation_order_basis (operation_id, order_id, basis_id) VALUES (%s,%s,%s) ON CONFLICT DO NOTHING",
            (operation_id, order_id, basis_id),
        )

def unlink_operation_order_basis(operation_id: int, order_id: int, basis_id: int) -> None:
    with pg_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "DELETE FROM operation_order_basis WHERE operation_id=%s AND order_id=%s AND basis_id=%s",
            (operation_id, order_id, basis_id),
        )

# ---------- Qdrant (векторная БД) ----------
def qdrant() -> QdrantClient:
    return QdrantClient(url=QDRANT_URL)

def qdrant_ensure_collection(dim: int = EMB_DIM):
    client = qdrant()
    names = [c.name for c in client.get_collections().collections]
    if COLLECTION not in names:
        client.recreate_collection(COLLECTION, vectors_config=VectorParams(size=dim, distance=Distance.COSINE))

def qdrant_upsert_law_points(
    law_id: int,
    vectors: Sequence[Sequence[float]],
    texts: Iterable[str],
    payload_extra: Optional[dict] = None,
):
    """
    INSERT/UPDATE для векторной БД.
    vectors: список эмбеддингов (полученных из твоего внешнего API)
    texts:   соответствующие фрагменты (чанки) закона
    """
    from uuid import uuid4
    client = qdrant()
    points = []
    for i, (vec, chunk) in enumerate(zip(vectors, texts)):
        payload = {"law_id": int(law_id), "section_path": f"chunk_{i}", "source": "LAW"}
        if payload_extra:
            payload.update(payload_extra)
        points.append(PointStruct(id=str(uuid4()), vector=list(vec), payload=payload))
    client.upsert(COLLECTION, points=points)

def qdrant_delete_by_law(law_id: int):
    client = qdrant()
    flt = Filter(must=[FieldCondition(key="law_id", match=Match(value=int(law_id)))])
    client.delete(COLLECTION, points_selector={"filter": flt})
