DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

-- creating users table
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR NOT NULL CHECK (first_name <> ''),
    last_name     VARCHAR NOT NULL CHECK (last_name <> ''),
    email         VARCHAR NOT NULL UNIQUE CHECK (email <> ''),
    password_hash VARCHAR NOT NULL CHECK (password_hash <> ''),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- creating signatures table
CREATE TABLE signatures (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL UNIQUE REFERENCES users (id),
    signature   TEXT NOT NULL CHECK (signature <> ''),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SELECT * FROM users;
-- SELECT * FROM signatures;
-- INSERT INTO users (first_name, last_name, email, password_hash) VALUES ('Berlin', 'Germany', "blabla@bla.com",3610156);
-- INSERT INTO signatures (user_id, signature) VALUES (1, 'Germany');
-- SELECT first_name, last_name FROM users RIGHT JOIN singatures ON user_id = users.id;


-- ================= VERY IMPORTANT ========================
-- since there is a foreign key (user_id) the order of dropping and creating is of crucial importance!!