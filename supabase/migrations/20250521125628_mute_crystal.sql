/*
  # Initial schema setup for restaurant menu

  1. New Tables
    - categories
      - id (uuid, primary key)
      - name (text)
      - order (integer)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - menu_items
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - price (decimal)
      - category_id (uuid, foreign key)
      - image_url (text)
      - sizes (jsonb)
      - is_on_sale (boolean)
      - is_most_requested (boolean)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for anonymous read access
    - Add policies for authenticated user management
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  image_url text,
  sizes jsonb DEFAULT '[]'::jsonb,
  is_on_sale boolean DEFAULT false,
  is_most_requested boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policies for categories
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Allow anonymous read access for categories'
  ) THEN
    CREATE POLICY "Allow anonymous read access for categories"
      ON categories
      FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Allow authenticated users to manage categories'
  ) THEN
    CREATE POLICY "Allow authenticated users to manage categories"
      ON categories
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Policies for menu_items
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_items' 
    AND policyname = 'Allow anonymous read access for menu_items'
  ) THEN
    CREATE POLICY "Allow anonymous read access for menu_items"
      ON menu_items
      FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_items' 
    AND policyname = 'Allow authenticated users to manage menu_items'
  ) THEN
    CREATE POLICY "Allow authenticated users to manage menu_items"
      ON menu_items
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_categories_updated_at
      BEFORE UPDATE ON categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_menu_items_updated_at'
  ) THEN
    CREATE TRIGGER update_menu_items_updated_at
      BEFORE UPDATE ON menu_items
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;