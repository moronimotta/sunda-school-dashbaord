-- Sunday School Dashboard - Database Setup
-- Run this file to create the database manually if needed

-- Create database (run as postgres superuser)
CREATE DATABASE sunday_school;

-- Connect to the database
\c sunday_school

-- Create schema (Prisma will create tables)
CREATE SCHEMA IF NOT EXISTS public;

-- Grant privileges to your user (replace 'your_username' with actual username)
-- GRANT ALL PRIVILEGES ON DATABASE sunday_school TO your_username;
-- GRANT ALL PRIVILEGES ON SCHEMA public TO your_username;

-- Check connection
SELECT 'Database sunday_school created successfully!' AS status;
