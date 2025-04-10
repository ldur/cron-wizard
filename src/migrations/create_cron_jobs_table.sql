
-- Create cron_jobs table
CREATE TABLE IF NOT EXISTS cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  command TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add some test data
INSERT INTO cron_jobs (name, command, cron_expression, status)
VALUES 
  ('Daily Backup', 'backup.sh --full', '0 0 * * *', 'active'),
  ('Hourly Log Cleanup', 'cleanup-logs.sh', '0 * * * *', 'active'),
  ('Weekly Report', 'generate-report.sh --weekly', '0 0 * * 0', 'active'),
  ('System Health Check', 'health-check.sh', '*/15 * * * *', 'paused'),
  ('Database Vacuum', 'vacuum-db.sh', '0 3 * * 6', 'paused');

-- Add RLS policies to secure the table
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users"
  ON cron_jobs
  FOR ALL
  TO authenticated
  USING (true);
