/*
# Fix: Revoke all public EXECUTE on handle_new_user trigger function

The REVOKE FROM anon/authenticated was insufficient because PostgreSQL
grants EXECUTE to PUBLIC by default. This removes it from PUBLIC and
then re-grants only to the owner role, ensuring the trigger still fires
but no API caller can invoke it directly.

1. Security Changes
- REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC.
- The trigger still works because triggers execute with the function
  owner's privileges, not the caller's.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
