/*
# Fix: Revoke public EXECUTE on handle_new_user trigger function

The handle_new_user() function is a SECURITY DEFINER trigger that auto-creates
a profile row when a new auth user signs up. It should only be called by the
database trigger, not directly via the REST API. Revoking EXECUTE from anon
and authenticated roles closes this surface.

1. Security Changes
- REVOKE EXECUTE on public.handle_new_user FROM anon, authenticated.
- The trigger still works because it runs with the owner's privileges.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
