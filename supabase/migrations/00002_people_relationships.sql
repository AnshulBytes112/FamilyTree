-- 1. Custom Types
CREATE TYPE person_gender AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');
CREATE TYPE relationship_type AS ENUM ('PARENT', 'SPOUSE');

-- 2. Tables

-- Table: people
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  gender person_gender NOT NULL DEFAULT 'UNKNOWN',
  date_of_birth DATE,
  date_of_death DATE,
  place_of_birth TEXT,
  place_of_residence TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (date_of_death IS NULL OR date_of_birth IS NULL OR date_of_death >= date_of_birth),
  -- Unique constraint required for composite foreign key in relationships table
  UNIQUE (id, family_id)
);

CREATE TRIGGER update_people_updated_at
    BEFORE UPDATE ON people
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table: relationships
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  person_id UUID NOT NULL,
  related_person_id UUID NOT NULL,
  type relationship_type NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure both people belong to the same family using the composite unique key from people
  FOREIGN KEY (person_id, family_id) REFERENCES people(id, family_id) ON DELETE CASCADE,
  FOREIGN KEY (related_person_id, family_id) REFERENCES people(id, family_id) ON DELETE CASCADE,
  
  -- Prevent self-relationship
  CONSTRAINT prevent_self_relationship CHECK (person_id != related_person_id),
  
  -- Spouse canonicalization enforcement at DB level (person_id must be strictly less than related_person_id)
  CONSTRAINT spouse_canonical_order CHECK (type != 'SPOUSE' OR person_id < related_person_id),

  -- Prevent duplicate relationships of the same type between two specific people
  UNIQUE (family_id, person_id, related_person_id, type)
);

-- 3. Indexes
CREATE INDEX idx_people_family_id ON people(family_id);
CREATE INDEX idx_people_created_by ON people(created_by);

CREATE INDEX idx_relationships_family_id ON relationships(family_id);
CREATE INDEX idx_relationships_person_id ON relationships(person_id);
CREATE INDEX idx_relationships_related_person_id ON relationships(related_person_id);

-- 4. Row Level Security (RLS)
-- Enable RLS to default to DENY for browser/anon access.
-- Server-side admin client will securely bypass this.
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
