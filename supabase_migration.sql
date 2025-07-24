-- SQL Migration for adding 'skrædder' field to customers table
-- Run this in your Supabase SQL Editor

-- Add the skraedder column to the customers table
ALTER TABLE customers 
ADD COLUMN skraedder TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN customers.skraedder IS 'Name of the tailor working on the dress';

-- Optional: Create an index for better query performance if you plan to filter/search by skrædder
CREATE INDEX idx_customers_skraedder ON customers(skraedder);

-- If you need to set a default value for existing records, you can run:
-- UPDATE customers SET skraedder = 'Ikke angivet' WHERE skraedder IS NULL;