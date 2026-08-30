import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: searchPeople } = await supabase.from('people').select('family_id').ilike('name', '%Triveni%').limit(1);
  if (!searchPeople || searchPeople.length === 0) return console.log('No triveni found');
  
  const familyId = searchPeople[0].family_id;
  console.log('Family:', familyId);
  
  const { data: people } = await supabase.from('people').select('*').eq('family_id', familyId);
  const { data: relationships } = await supabase.from('relationships').select('*').eq('family_id', familyId);
  
  console.log('People:');
  console.table(people?.map(p => ({ id: p.id, name: p.name })));
  
  console.log('Relationships:');
  console.table(relationships?.map(r => ({ person_id: r.person_id, related_person_id: r.related_person_id, type: r.type })));
  
  import('../src/lib/family-tree/generations').then(({ calculateGenerations }) => {
    const res = calculateGenerations(people as any, relationships as any);
    console.log(JSON.stringify(res, null, 2));
  });
}

run().catch(console.error);
