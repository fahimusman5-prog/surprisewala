-- The profiles RLS policy invokes this private function. It is not exposed by
-- the Data API, and its body authorizes only the current auth.uid().
grant execute on function private.is_admin() to authenticated;
