
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Function to initialize the database with our table and test data
export const initializeDatabase = async () => {
  try {
    // Check if the table exists
    const { data: existingTables, error: tableError } = await supabase
      .from('cron_jobs')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.log('Table might not exist yet, will attempt to create it');
      
      // We'd typically execute the SQL here, but in Lovable with Supabase,
      // you should execute the SQL in the Supabase dashboard SQL editor
      console.log('Please execute the SQL from src/migrations/create_cron_jobs_table.sql in your Supabase SQL editor');
      
      return false;
    }
    
    console.log('Database already initialized');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};
