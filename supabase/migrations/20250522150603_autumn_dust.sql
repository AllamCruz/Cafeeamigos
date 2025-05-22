/*
  # Add subcategories support

  1. Changes
    - Add parent_category_id to categories table
    - Add storage bucket for menu item images
    - Update RLS policies for storage

  2. Security
    - Enable RLS for storage bucket
    - Add policies for authenticated users to upload/manage images
    - Add policies for anonymous users to view images
*/

-- Add parent_category_id to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS parent_category_id uuid REFERENCES categories(id) ON DELETE CASCADE;

-- Create storage bucket for menu item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-items');

CREATE POLICY "Allow authenticated users to update images"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'menu-items');

CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-items');

CREATE POLICY "Allow public to view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-items');