-- 1. Table: branches
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Composite unique key required for strict same-family enforcement in memberships
  UNIQUE(id, family_id)
);

CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON branches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Table: branch_memberships
CREATE TABLE branch_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL,
  person_id UUID NOT NULL,
  family_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Strict same-family enforcement
  FOREIGN KEY (branch_id, family_id) REFERENCES branches(id, family_id) ON DELETE CASCADE,
  FOREIGN KEY (person_id, family_id) REFERENCES people(id, family_id) ON DELETE CASCADE,
  
  -- Prevent duplicates
  UNIQUE(branch_id, person_id)
);

-- 3. Indexes
CREATE INDEX idx_branches_family_id ON branches(family_id);
-- Unique constraint already indexes (branch_id, person_id), but we'll add family_id for queries
CREATE INDEX idx_branch_memberships_family_id ON branch_memberships(family_id);
CREATE INDEX idx_branch_memberships_person_id ON branch_memberships(person_id);

-- 4. Row Level Security (RLS)
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_memberships ENABLE ROW LEVEL SECURITY;
-- No public permissive policies. Server handles auth.
