const spicedPg = require('spiced-pg');
const db = spicedPg(
    process.env.DATABASE_URL ||
        'postgres:postgres:postgres@localhost:5432/petition'
);

// ================= INSERTS =======================
// inserting the user's signature
module.exports.addSignature = (user_id, signature) => {
    const q = `
    INSERT INTO signatures (user_id, signature)
    VALUES ($1, $2)
    RETURNING id`;
    const params = [user_id, signature];
    return db.query(q, params);
};

// inserting new user
module.exports.addNewUser = (first_name, last_name, email, password_hash) => {
    const q = `
    INSERT INTO users (first_name, last_name, email, password_hash )
    VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const params = [first_name, last_name, email, password_hash];
    return db.query(q, params);
};

module.exports.addProfile = (user_id, age, city, url) => {
    const q = `
    INSERT INTO profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id`;
    const params = [age, city, url, user_id];
    return db.query(q, params);
};

// module.exports.editProfile=()

// ================= SELECTS ==========================
// selecting a total number of signers
module.exports.getSignersCount = () => {
    const q = `
    SELECT COUNT(*) 
    FROM signatures`;
    return db.query(q);
};

// selecting first and last names of every signer
module.exports.getAllSigners = () => {
    const q = `
    SELECT signatures.user_id, first_name, last_name, age, city, url 
    FROM users
    LEFT JOIN signatures
    ON users.id = signatures.user_id
    LEFT JOIN profiles
    ON profiles.user_id = users.id`;
    return db.query(q);
};

// query to get the signature
module.exports.getSignature = (id) => {
    const q = `
    SELECT signature 
    FROM signatures 
    WHERE id = $1`;
    const params = [id];
    return db.query(q, params);
};

// query to get the user info by email
module.exports.getLogInfo = (email) => {
    // should i add email here, since i have it as a param from user alredy
    const q = `
    SELECT password_hash, id, signature
    FROM users 
    LEFT JOIN signatures
    ON users.id = signatures.user_id
    WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

// query to get the signers by city
module.exports.getLocalSigners = (city) => {
    const q = `
    SELECT first_name, last_name, age, url 
    FROM users
    LEFT JOIN signatures
    ON users.id = signatures.user_id
    LEFT JOIN profiles
    ON profiles.user_id = users.id
    WHERE LOWER(city) = LOWER($1)`;
    const params = [city];
    return db.query(q, params);
};

// module.exports.getUpdateInfo = () => {
//     const q =`
//     SELECT profiles..user_id, first_name, last_name, email, age, city, url
//     FROM users
//     INNER JOIN `
// }
