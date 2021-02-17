DROP TABLE IF EXISTS signatures;

-- creating a signatures table
CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    first VARCHAR (255) NOT NULL,
    last VARCHAR (255) NOT NULL,
    signature TEXT NOT NULL CHECK (signature != '')
);