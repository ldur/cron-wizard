
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Use direct values instead of environment variables
const supabaseUrl = "https://tywwuwbzlofgncqxzkid.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5d3d1d2J6bG9mZ25jcXh6a2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyOTIwMjcsImV4cCI6MjA1OTg2ODAyN30.0l9s1_WV0PenGvFb13zc-tGY-NTweYd78XnLjQbeYAk";

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

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
      // you should execute the SQL from src/migrations/create_cron_jobs_table.sql in your Supabase SQL editor
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
