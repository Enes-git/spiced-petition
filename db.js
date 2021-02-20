const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

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

// ================= SELECTS ==========================
// selecting a total number of signers
module.exports.totalSigners = () => {
    const q = `
    SELECT COUNT(*) 
    FROM signatures`;
    return db.query(q);
};

// selecting first and last names of every signer
module.exports.signerName = () => {
    const q = `
    SELECT first_name, last_name 
    FROM users
    RIGHT JOIN signatures
    ON users.id = signatures.user_id`; // should i check signature here, if there is one? Will this be an ordered list?
    return db.query(q);
};

// query to get the signature
module.exports.getSignature = (id) => {
    const q = `
    SELECT signature 
    FROM signatures 
    WHERE id=$1`;
    const params = [id];
    return db.query(q, params);
};

// query to get the user info by email
module.exports.getLogInfo = (email) => {
    // should i add email here, since i have it as a param from user alredy
    const q = `
    SELECT password_hash
    FROM users 
    WHERE email=$1`;
    const params = [email];
    return db.query(q, params);
};
