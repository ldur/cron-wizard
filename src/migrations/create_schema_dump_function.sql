
-- Create a function to dump schema information
CREATE OR REPLACE FUNCTION public.dump_schema()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    schema_data jsonb;
BEGIN
    -- Collect table information
    WITH tables_info AS (
        SELECT
            t.table_name,
            jsonb_agg(
                jsonb_build_object(
                    'column_name', c.column_name,
                    'data_type', c.data_type,
                    'is_nullable', c.is_nullable,
                    'column_default', c.column_default
                ) ORDER BY c.ordinal_position
            ) AS columns
        FROM
            information_schema.tables t
        JOIN
            information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
        WHERE
            t.table_schema = 'public'
            AND t.table_type = 'BASE TABLE'
        GROUP BY
            t.table_name
    ),
    rls_policies AS (
        SELECT
            tablename,
            jsonb_agg(
                jsonb_build_object(
                    'policyname', policyname,
                    'permissive', permissive,
                    'roles', roles,
                    'cmd', cmd,
                    'qual', qual::text,
                    'with_check', with_check::text
                )
            ) AS policies
        FROM
            pg_policies
        WHERE
            schemaname = 'public'
        GROUP BY
            tablename
    ),
    indices AS (
        SELECT
            tablename,
            jsonb_agg(
                jsonb_build_object(
                    'indexname', indexname,
                    'indexdef', indexdef
                )
            ) AS table_indices
        FROM
            pg_indexes
        WHERE
            schemaname = 'public'
        GROUP BY
            tablename
    ),
    foreign_keys AS (
        SELECT
            tc.table_name,
            jsonb_agg(
                jsonb_build_object(
                    'constraint_name', tc.constraint_name,
                    'column_name', kcu.column_name,
                    'foreign_table_name', ccu.table_name,
                    'foreign_column_name', ccu.column_name
                )
            ) AS constraints
        FROM
            information_schema.table_constraints tc
        JOIN
            information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN
            information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE
            tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
        GROUP BY
            tc.table_name
    ),
    enums AS (
        SELECT
            pg_type.typname AS enum_name,
            jsonb_agg(pg_enum.enumlabel ORDER BY pg_enum.enumsortorder) AS enum_values
        FROM
            pg_type
        JOIN
            pg_enum ON pg_enum.enumtypid = pg_type.oid
        JOIN
            pg_namespace ON pg_namespace.oid = pg_type.typnamespace
        WHERE
            pg_namespace.nspname = 'public'
        GROUP BY
            pg_type.typname
    ),
    functions AS (
        SELECT
            p.proname AS function_name,
            pg_get_functiondef(p.oid) AS function_definition
        FROM
            pg_proc p
        JOIN
            pg_namespace n ON p.pronamespace = n.oid
        WHERE
            n.nspname = 'public'
    )
    
    -- Combine all information into a JSON structure
    SELECT
        jsonb_build_object(
            'tables', (
                SELECT jsonb_object_agg(
                    t.table_name,
                    jsonb_build_object(
                        'columns', t.columns,
                        'policies', COALESCE(r.policies, '[]'::jsonb),
                        'indices', COALESCE(i.table_indices, '[]'::jsonb),
                        'foreign_keys', COALESCE(f.constraints, '[]'::jsonb)
                    )
                )
                FROM tables_info t
                LEFT JOIN rls_policies r ON t.table_name = r.tablename
                LEFT JOIN indices i ON t.table_name = i.tablename
                LEFT JOIN foreign_keys f ON t.table_name = f.table_name
            ),
            'enums', (
                SELECT jsonb_object_agg(
                    e.enum_name, e.enum_values
                )
                FROM enums e
            ),
            'functions', (
                SELECT jsonb_object_agg(
                    f.function_name, f.function_definition
                )
                FROM functions f
            )
        ) INTO schema_data;

    RETURN schema_data;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.dump_schema() TO authenticated;
