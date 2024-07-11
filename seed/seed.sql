DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS dataset;

CREATE TYPE userRole AS ENUM ('ADMIN', 'USER');
CREATE TYPE requestStatus AS ENUM ('PENDING', 'RUNNING', 'FAILED', 'ABORTED', 'COMPLETED');

CREATE TABLE users (
    idUser SERIAL PRIMARY KEY NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role userRole DEFAULT 'USER' NOT NULL,
    tokens REAL DEFAULT 100 NOT NULL
);
CREATE TABLE dataset (
    idDataset SERIAL PRIMARY KEY NOT NULL,
    cost REAL NOT NULL,
    nameDataset TEXT NOT NULL,
    idCreator INTEGER REFERENCES users(idUser) NOT NULL
);

INSERT INTO users (username, email, role) VALUES
('user1', 'user1@email.com', 'USER'),
('user2', 'user2@email.com', 'USER'),
('admin1', 'admin1@email.com', 'ADMIN');

SET timezone = 'Europe/Rome';
