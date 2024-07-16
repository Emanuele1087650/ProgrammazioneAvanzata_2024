DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS dataset;
DROP TABLE IF EXISTS request;

CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE requestStatus AS ENUM ('PENDING', 'RUNNING', 'FAILED', 'ABORTED', 'COMPLETED');

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'USER' NOT NULL,
    tokens REAL DEFAULT 100 NOT NULL
);
CREATE TABLE dataset (
    id_dataset SERIAL PRIMARY KEY NOT NULL,
    cost REAL NOT NULL,
    name_dataset TEXT NOT NULL,
    id_creator INTEGER REFERENCES users(id_user) NOT NULL
);
CREATE TABLE request (
    id_request SERIAL PRIMARY KEY NOT NULL,
    cost REAL NOT NULL,
    id_creator INTEGER REFERENCES users(id_user) NOT NULL,
    status requestStatus DEFAULT 'PENDING' NOT NULL,
    results JSONB
);

INSERT INTO users (username, email, role) VALUES
('user1', 'user1@email.com', 'USER'),
('user2', 'user2@email.com', 'USER'),
('user3', 'user3@email.com', 'USER'),
('admin1', 'admin1@email.com', 'ADMIN');

SET timezone = 'Europe/Rome';
