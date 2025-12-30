-- Drop existing tables if they exist (for a clean setup)
DROP TABLE IF EXISTS rating_point CASCADE;
DROP TABLE IF EXISTS rating CASCADE;
DROP TABLE IF EXISTS film_actor CASCADE;
DROP TABLE IF EXISTS film_director CASCADE;
DROP TABLE IF EXISTS film_genre CASCADE;
DROP TABLE IF EXISTS film CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS genre CASCADE;
DROP TABLE IF EXISTS director CASCADE;
DROP TABLE IF EXISTS actor CASCADE;

-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE genre (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE actor (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE director (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE film (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    poster_url VARCHAR(255),
    runtime INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE film_genre (
    film_id INT REFERENCES film(id) ON DELETE CASCADE,
    genre_id INT REFERENCES genre(id) ON DELETE CASCADE,
    PRIMARY KEY (film_id, genre_id)
);

CREATE TABLE film_director (
    film_id INT REFERENCES film(id) ON DELETE CASCADE,
    director_id INT REFERENCES director(id) ON DELETE CASCADE,
    PRIMARY KEY (film_id, director_id)
);

CREATE TABLE film_actor (
    film_id INT REFERENCES film(id) ON DELETE CASCADE,
    actor_id INT REFERENCES actor(id) ON DELETE CASCADE,
    PRIMARY KEY (film_id, actor_id)
);

CREATE TABLE rating (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    film_id INT REFERENCES film(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rating_point (
    id SERIAL PRIMARY KEY,
    rating_id INT REFERENCES rating(id) ON DELETE CASCADE,
    point_index INT NOT NULL,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL
);

-- Insert dummy users
INSERT INTO users (username, hashed_password) VALUES
  ('user1', 'hashedpassword1'),
  ('user2', 'hashedpassword2');

-- Insert dummy films
INSERT INTO film (title, year, poster_url, runtime, created_at) VALUES
  ('Lighthouse', 2025, 'https://www.posterist.co.uk/cdn/shop/files/lighthouse-movie-poster-v2-01.jpg?crop=center&height=723&v=1698400965&width=723', 200, NOW()),
  ('Matrix', 1999, 'https://i.ebayimg.com/images/g/ewwAAOSwpEVhZKHe/s-l1200.jpg', 200, NOW()),
  ('Nosferatu', 2024, 'https://i.ebayimg.com/images/g/bxEAAOSwx-9WxftL/s-l400.jpg', 200, NOW() - INTERVAL '14 days'),
  ('The Gorge', 2025, 'https://image.tmdb.org/t/p/original/4NGWdYzFMzVIgrIzO2rpZzUYWQJ.jpg', 200, NOW() - INTERVAL '14 days');

-- Insert genres
INSERT INTO genre (name) VALUES
  ('Drama'),
  ('Horror'),
  ('Sci-Fi'),
  ('Thriller'),
  ('Romance');

-- Insert directors
INSERT INTO director (name) VALUES
  ('Robert Eggers'),
  ('The Wachowskis'),
  ('Scott Derrickson');

-- Insert actors
INSERT INTO actor (name) VALUES
  ('Willem Dafoe'),
  ('Robert Pattinson'),
  ('Keanu Reeves'),
  ('Carrie-Anne Moss'),
  ('Bill Skarsgård'),
  ('Lily-Rose Depp'),
  ('Miles Teller'),
  ('Anya Taylor-Joy');

-- Link films to genres
INSERT INTO film_genre (film_id, genre_id) VALUES
  (1, 1), (1, 4),
  (2, 3), (2, 4),
  (3, 1), (3, 2),
  (4, 4), (4, 5);

-- Link films to directors
INSERT INTO film_director (film_id, director_id) VALUES
  (1, 1),
  (2, 2),
  (3, 1),
  (4, 3);

-- Link films to actors
INSERT INTO film_actor (film_id, actor_id) VALUES
  (1, 1), (1, 2),
  (2, 3), (2, 4),
  (3, 5), (3, 6),
  (4, 7), (4, 8);

-- Insert dummy ratings
INSERT INTO rating (user_id, film_id) VALUES
  (1, 1),
  (1, 2),
  (2, 1),
  (2, 3);

-- Insert dummy rating points
INSERT INTO rating_point (rating_id, point_index, x, y) VALUES
  (1, 0, 20, 257), (1, 1, 67.5, 295), (1, 2, 115, 152),
  (1, 3, 210, 200), (1, 4, 305, 95), (1, 5, 352.5, 266), (1, 6, 400, 152),
  (2, 0, 20, 257), (2, 1, 67.5, 295), (2, 2, 115, 152),
  (2, 3, 210, 200), (2, 4, 305, 95), (2, 5, 352.5, 266), (2, 6, 400, 152),
  (3, 0, 20, 0), (3, 1, 67.5, 0), (3, 2, 115, 0),
  (3, 3, 210, 0), (3, 4, 305, 0), (3, 5, 352.5, 0), (3, 6, 400, 0),
  (4, 0, 20, 257), (4, 1, 67.5, 295), (4, 2, 115, 152),
  (4, 3, 210, 200), (4, 4, 305, 95), (4, 5, 352.5, 266), (4, 6, 400, 152);


-- psql -U film_admin -d film_review -f setupdb.sql