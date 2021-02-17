const db = require('./db');
const express = require('express');
const app = express();

console.log('db :>> ', db);

// GET REQUEST TO /petition
app.get('/petition', (req, res) => {
    if (cookie) {
        // HOW TO SET A COOKIE
        res.redirect('/petition/thanks');
    } else {
        res.render('/petition', { layout: 'main' });
    }
});

// POST REQUEST TO /petition
app.post('/petition', (req, res) => {
    // user entered info from the form
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const signature = req.body.sig_id;

    // adding user infos to petition database
    db.addSigner(firstname, lastname, signature);
});

// GET REQUEST TO /thanks
app.get('/petition/thanks', (req, res) => {
    if (cookie) {
        res.render('/petition/thanks', { layout: 'main' });
    } else {
        res.redirect('/petition');
    }
});

// GET REQUEST FOR /signers
app.get('/petition/signers', (req, res) => {
    if (cookie) {
        db.signerName(); //HOW TO PASS THEM TO HANDLEBARS
    } else {
        res.redirect('/petition');
    }
});

app.listen(8080, () => console.log("I'm all ears!"));
