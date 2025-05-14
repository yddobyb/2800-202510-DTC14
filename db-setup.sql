-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS parking_app;

USE parking_app;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment history table if it doesn't exist
CREATE TABLE IF NOT EXISTS paymentHistory (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    street_number VARCHAR(50) NOT NULL,
    hours DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- Insert sample user for testing
INSERT INTO
    users (
        username,
        email,
        phone,
        password
    )
VALUES (
        'testuser',
        'test@example.com',
        '1234567890',
        '$2b$10$dFKVUqY8wDJXJJxHmGGcWuVaQJOBEZIw5Vv.o9OGGj8.XJLZ9jTDe'
    );
-- Password is 'password123'