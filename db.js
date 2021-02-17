const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

// selecting a total number of signers
module.exports.totalSigners = () => {
    const q = `SELECT * FROM petition`;
    return db.query(q);
};

// inserting the user's signature and name
module.exports.addSigner = (firstname, lastname, signature) => {
    const q = `
    INSERT INTO petition(firstname, lastname, signature)
    VALUES ($1, $2, $3)
    RETURNING id`;
    const params = [firstname, lastname, signature];
    return db.query(q, params);
};

// selecting first and last names of every signer
module.exports.signerName = () => {
    const q = `SELECT firstname, lastname FROM petition`;
    return db.query(q);
};
