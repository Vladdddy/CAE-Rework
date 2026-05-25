-- ============================================================
-- Score system schema  (SQL Server / T-SQL)
-- Run once to set up the tables for employee evaluations.
-- ============================================================

-- Column categories shown in the top header row (e.g. "Voto", custom ones)
IF OBJECT_ID('dbo.score_top_categories', 'U') IS NULL
CREATE TABLE dbo.score_top_categories (
    id         INT           IDENTITY(1,1) PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    position   INT           NOT NULL DEFAULT 0,
    created_at DATETIME2     DEFAULT GETDATE()
);

-- Row subcategories under each macro section (softskills / competenze)
IF OBJECT_ID('dbo.score_row_subcategories', 'U') IS NULL
CREATE TABLE dbo.score_row_subcategories (
    id         INT           IDENTITY(1,1) PRIMARY KEY,
    macro_type VARCHAR(20)   NOT NULL CHECK (macro_type IN ('softskills', 'competenze')),
    name       VARCHAR(100)  NOT NULL,
    position   INT           NOT NULL DEFAULT 0,
    created_at DATETIME2     DEFAULT GETDATE()
);

-- Score values at each (employee x row subcategory x top category x date) intersection
IF OBJECT_ID('dbo.score_values', 'U') IS NULL
CREATE TABLE dbo.score_values (
    id                 INT           IDENTITY(1,1) PRIMARY KEY,
    employee_id        INT           NOT NULL,
    row_subcategory_id INT           NOT NULL,
    top_category_id    INT           NOT NULL,
    score_date         DATE          NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    value              DECIMAL(4,1)  CHECK (value >= 1 AND value <= 10),
    created_at         DATETIME2     DEFAULT GETDATE(),
    updated_at         DATETIME2     DEFAULT GETDATE(),
    CONSTRAINT uq_score    UNIQUE (employee_id, row_subcategory_id, top_category_id, score_date),
    CONSTRAINT fk_score_row FOREIGN KEY (row_subcategory_id)
        REFERENCES dbo.score_row_subcategories(id) ON DELETE CASCADE,
    CONSTRAINT fk_score_top FOREIGN KEY (top_category_id)
        REFERENCES dbo.score_top_categories(id)    ON DELETE CASCADE
);

-- Trigger: keep updated_at current on every UPDATE
GO
CREATE OR ALTER TRIGGER dbo.trg_score_values_updated_at
ON dbo.score_values
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.score_values
    SET    updated_at = GETDATE()
    FROM   dbo.score_values sv
    INNER JOIN inserted i ON sv.id = i.id;
END;
GO

-- Seed the default top category (only if not already present)
IF NOT EXISTS (SELECT 1 FROM dbo.score_top_categories WHERE name = 'Voto')
    INSERT INTO dbo.score_top_categories (name, position) VALUES ('Voto', 0);

-- ============================================================
-- Migration: add score_date column (run if upgrading from v1)
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME   = 'score_values'
      AND COLUMN_NAME  = 'score_date'
)
BEGIN
    -- Add nullable first so existing rows don't violate NOT NULL
    ALTER TABLE dbo.score_values ADD score_date DATE NULL;
    UPDATE dbo.score_values SET score_date = CAST(GETDATE() AS DATE) WHERE score_date IS NULL;
    ALTER TABLE dbo.score_values ALTER COLUMN score_date DATE NOT NULL;
    ALTER TABLE dbo.score_values ADD DEFAULT CAST(GETDATE() AS DATE) FOR score_date;

    -- Replace old unique constraint (no date) with new one (includes date)
    IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'uq_score' AND parent_object_id = OBJECT_ID('dbo.score_values'))
        ALTER TABLE dbo.score_values DROP CONSTRAINT uq_score;

    ALTER TABLE dbo.score_values
        ADD CONSTRAINT uq_score UNIQUE (employee_id, row_subcategory_id, top_category_id, score_date);
END
GO
