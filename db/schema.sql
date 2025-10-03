

-- 1) Справочник операций
CREATE TABLE IF NOT EXISTS operation_ref (
  operation_id BIGSERIAL PRIMARY KEY,
  name         TEXT      NOT NULL,
  participants SMALLINT  NOT NULL CHECK (participants IN (0,1,2,3))
);

-- 2) Законы
CREATE TABLE IF NOT EXISTS law (
  law_id     BIGSERIAL PRIMARY KEY,
  title      TEXT      NOT NULL,
  law_date   DATE      NOT NULL,
  reg_number TEXT,
  text_url   TEXT,     -- ссылка на текст
  file_url   TEXT,     -- ссылка на источник/файл
  embedding  JSONB     -- можно не использовать, если вектора только в Qdrant
);
CREATE INDEX IF NOT EXISTS idx_law_date ON law(law_date);

-- 3) Руководство пользователя
CREATE TABLE IF NOT EXISTS user_guide (
  guide_id   BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  section_no TEXT NOT NULL
);

-- 4) Заголовок распоряжения (минимум для связки)
CREATE TABLE IF NOT EXISTS order_hdr (
  order_id BIGSERIAL PRIMARY KEY
);

-- 5) Документы-основания
CREATE TABLE IF NOT EXISTS basis_doc (
  basis_id BIGSERIAL PRIMARY KEY,
  name     TEXT NOT NULL
);

-- 6) Связка: операция ↔ распоряжение ↔ документ-основание
CREATE TABLE IF NOT EXISTS operation_order_basis (
  operation_id BIGINT NOT NULL REFERENCES operation_ref(operation_id) ON DELETE RESTRICT,
  order_id     BIGINT NOT NULL REFERENCES order_hdr(order_id)         ON DELETE CASCADE,
  basis_id     BIGINT NOT NULL REFERENCES basis_doc(basis_id)         ON DELETE RESTRICT,
  PRIMARY KEY (operation_id, order_id, basis_id)
);

CREATE INDEX IF NOT EXISTS idx_oob_operation ON operation_order_basis(operation_id);
CREATE INDEX IF NOT EXISTS idx_oob_order     ON operation_order_basis(order_id);
CREATE INDEX IF NOT EXISTS idx_oob_basis     ON operation_order_basis(basis_id);


