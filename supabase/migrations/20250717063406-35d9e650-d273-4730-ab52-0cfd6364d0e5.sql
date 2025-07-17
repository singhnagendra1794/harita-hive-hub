-- Just check what RLS policies exist for user_subscriptions table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_subscriptions';