import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const familyId = process.argv[2];
  if (!familyId) {
    console.error("Usage: npx tsx scripts/seed-family.ts <familyId>");
    process.exit(1);
  }

  console.log(`Seeding test family into family ID: ${familyId}...`);

  // 1. Create People
  const peopleData = [
    { name: "Grandfather", gender: "MALE", family_id: familyId, date_of_birth: "1930-01-01" },
    { name: "Grandmother", gender: "FEMALE", family_id: familyId, date_of_birth: "1935-01-01" },
    { name: "Father", gender: "MALE", family_id: familyId, date_of_birth: "1960-01-01" },
    { name: "Mother", gender: "FEMALE", family_id: familyId, date_of_birth: "1965-01-01" },
    { name: "Uncle", gender: "MALE", family_id: familyId, date_of_birth: "1962-01-01" },
    { name: "Aunt", gender: "FEMALE", family_id: familyId, date_of_birth: "1966-01-01" },
    { name: "Anshul", gender: "MALE", family_id: familyId, date_of_birth: "1995-01-01" },
    { name: "Sister", gender: "FEMALE", family_id: familyId, date_of_birth: "1998-01-01" },
    { name: "Cousin", gender: "MALE", family_id: familyId, date_of_birth: "2000-01-01" },
  ];

  const { data: people, error: pError } = await supabase
    .from('people')
    .insert(peopleData)
    .select('id, name');

  if (pError || !people) {
    console.error("Failed to insert people:", pError);
    process.exit(1);
  }

  console.log(`Created ${people.length} people.`);

  const pMap = people.reduce((acc, p) => ({ ...acc, [p.name]: p.id }), {} as Record<string, string>);

  // Helper to add relationship ensuring SPOUSE canonicalization
  const relationships = [
    // Grandparents -> Father (Stored as Child -> Parent)
    { person_id: pMap["Father"], related_person_id: pMap["Grandfather"], type: "PARENT", family_id: familyId },
    { person_id: pMap["Father"], related_person_id: pMap["Grandmother"], type: "PARENT", family_id: familyId },
    
    // Grandparents -> Uncle
    { person_id: pMap["Uncle"], related_person_id: pMap["Grandfather"], type: "PARENT", family_id: familyId },
    { person_id: pMap["Uncle"], related_person_id: pMap["Grandmother"], type: "PARENT", family_id: familyId },
    
    // Parents -> Anshul & Sister
    { person_id: pMap["Anshul"], related_person_id: pMap["Father"], type: "PARENT", family_id: familyId },
    { person_id: pMap["Anshul"], related_person_id: pMap["Mother"], type: "PARENT", family_id: familyId },
    { person_id: pMap["Sister"], related_person_id: pMap["Father"], type: "PARENT", family_id: familyId },
    { person_id: pMap["Sister"], related_person_id: pMap["Mother"], type: "PARENT", family_id: familyId },
    
    // Uncle/Aunt -> Cousin
    { person_id: pMap["Cousin"], related_person_id: pMap["Uncle"], type: "PARENT", family_id: familyId },
    { person_id: pMap["Cousin"], related_person_id: pMap["Aunt"], type: "PARENT", family_id: familyId },
  ];

  // Add Spouses (must be p1 < p2)
  const addSpouse = (n1: string, n2: string) => {
    const id1 = pMap[n1];
    const id2 = pMap[n2];
    relationships.push({
      person_id: id1 < id2 ? id1 : id2,
      related_person_id: id1 < id2 ? id2 : id1,
      type: "SPOUSE",
      family_id: familyId
    });
  };

  addSpouse("Grandfather", "Grandmother");
  addSpouse("Father", "Mother");
  addSpouse("Uncle", "Aunt");

  const { error: rError } = await supabase
    .from('relationships')
    .insert(relationships);

  if (rError) {
    console.error("Failed to insert relationships:", rError);
    process.exit(1);
  }

  console.log(`Created ${relationships.length} relationships.`);
  console.log("Seed complete! Note: This is development/test data.");
}

seed().catch(console.error);
