const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

// selecting a total number of signers
module.exports.totalSigners = () => {
    const q = `SELECT COUNT(*) FROM signatures`;
    return db.query(q);
};

// inserting the user's signature and name
module.exports.addSigner = (first, last, signature) => {
    const q = `
    INSERT INTO signatures (first, last, signature)
    VALUES ($1, $2, $3)
    RETURNING id`;
    const params = [first, last, signature];
    return db.query(q, params);
};

// selecting first and last names of every signer
module.exports.signerName = () => {
    const q = `SELECT first, last FROM signatures`;
    return db.query(q);
};
