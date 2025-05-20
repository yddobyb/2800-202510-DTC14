USE parking_app;

-- Modify the paymentHistory table to allow NULL values for user_id
ALTER TABLE paymentHistory MODIFY COLUMN user_id INT NULL;

-- Remove the foreign key constraint
ALTER TABLE paymentHistory DROP FOREIGN KEY paymentHistory_ibfk_1;

-- Add back the foreign key constraint with ON DELETE SET NULL
ALTER TABLE paymentHistory
ADD CONSTRAINT paymentHistory_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL;