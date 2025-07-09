/*
  # Fix infinite recursion in profiles table policies

  1. Security Changes
    - Remove recursive policies that query profiles table within policy conditions
    - Add simple, non-recursive policies for profile access
    - Ensure users can read their own profile
    - Allow service role to manage all profiles (for admin operations)

  2. Policy Changes
    - Replace recursive admin check with service role access
    - Keep simple user self-access policy
    - Remove policies that cause infinite recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role full access (for admin operations through server-side code)
CREATE POLICY "Service role full access"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);