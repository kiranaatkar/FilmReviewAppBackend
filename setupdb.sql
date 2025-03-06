-- Drop existing tables if they exist (for a clean setup)
DROP TABLE IF EXISTS film CASCADE;
DROP TABLE IF EXISTS rating CASCADE;
DROP TABLE IF EXISTS rating_point CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the films table
CREATE TABLE film (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    poster_url VARCHAR(255)
);

-- Create the ratings table (users can rate films)
CREATE TABLE rating (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    film_id INT REFERENCES film(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the rating_point table (rating points for films)
CREATE TABLE rating_point (
    id SERIAL PRIMARY KEY,
    rating_id INT REFERENCES rating(id) ON DELETE CASCADE,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL
);

-- Insert dummy users
INSERT INTO users (username, email) VALUES
    ('user1', 'user1@example.com'),
    ('user2', 'user2@example.com');

-- Insert dummy films
INSERT INTO film (title, year, poster_url) VALUES
    ('Lighthouse', 2025, 'https://www.posterist.co.uk/cdn/shop/files/lighthouse-movie-poster-v2-01.jpg?crop=center&height=723&v=1698400965&width=723'),
    ('Matrix', 1999, 'https://i.ebayimg.com/images/g/ewwAAOSwpEVhZKHe/s-l1200.jpg'),
    ('Nosferatu', 2024, 'https://i.ebayimg.com/images/g/bxEAAOSwx-9WxftL/s-l400.jpg'),
    ('The Gorge', 2025, 'https://image.tmdb.org/t/p/original/4NGWdYzFMzVIgrIzO2rpZzUYWQJ.jpg');

-- Insert dummy ratings
INSERT INTO rating (user_id, film_id) VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (2, 3);

-- Insert dummy rating points
INSERT INTO rating_point (rating_id, x, y) VALUES
    -- Rating for user1, film LEG
    (1, 20, 257),
    (1, 67.5, 295),
    (1, 115, 152),
    (1, 210, 200),
    (1, 305, 95),
    (1, 352.5, 266),
    (1, 400, 152), 

    -- Rating for user1, film Matrix
    (2, 20, 257),
    (2, 67.5, 295),
    (2, 115, 152),
    (2, 210, 200),
    (2, 305, 95),
    (2, 352.5, 266),
    (2, 400, 152),

    -- Rating for user2, film LEG
    (3, 20, 257),
    (3, 67.5, 295),
    (3, 115, 152),
    (3, 210, 200),
    (3, 305, 95),
    (3, 352.5, 266),
    (3, 400, 152),

    -- Rating for user2, film Interstellar
    (4, 20, 257),
    (4, 67.5, 295),
    (4, 115, 152),
    (4, 210, 200),
    (4, 305, 95),
    (4, 352.5, 266),
    (4, 400, 152);

--psql -U film_admin -d film_review -f setupdb.sql