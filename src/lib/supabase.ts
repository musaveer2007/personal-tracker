import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://votzkenqrzgepgvmmipg.supabase.co';
const supabaseKey = 'sb_publishable_6A1odMrcn7zCrZrDc9jzeQ_8rNSf0ii'; // Use publishable key

export const supabase = createClient(supabaseUrl, supabaseKey);
