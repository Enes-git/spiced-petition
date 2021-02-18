const db = require('./db');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const express = require('express');

const app = express();

// ====== handlebars template engine =================
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// =========== MIDDLEWARES ============================
//  cookie session middleware
app.use(
    cookieSession({
        secret: `Hello underworld!`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// middleware for post requests
app.use(express.urlencoded({ extended: false }));

//  serving the static files
app.use(express.static('./public'));

//  user check with cookie
app.use((req, res, next) => {
    if (req.session.signatureId) {
        req.url != '/petition' ? next() : res.redirect('/thanks');
    } else {
        req.url == '/petition' ? next() : res.redirect('/petition'); // can i get rid of this conditional and just redirect?????????????????
    }
});

// ==================== REQUESTS ========================
//  GET request to "/"
app.get('/', (req, res) => {
    res.redirect('/petition');
});

//  GET request to "/petition"
app.get('/petition', (req, res) => {
    res.render('petition', { layout: 'main' });
});

//  POST request to "/petition"
app.post('/petition', (req, res) => {
    // user entered info from the form
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const signature = req.body.signature;

    // adding user infos to petition database
    db.addSigner(firstname, lastname, signature)
        .then(({ rows }) => {
            // console.log('rows :>> ', rows);
            // redirecting to thanks page and setting cookie
            req.session.signatureId = rows[0].id;
            res.redirect('/thanks');
        })
        .catch((err) => {
            console.log('err >> ', err);
            res.render('petition', { layout: 'main' }); //??????? HOW TO PASS AN ERR MSG ??????
        });
});

//  GET request to "/thanks"
app.get('/thanks', (req, res) => {
    // haven't I checked the condition in my middleware before requests?????????????????????????????????????????????????
    res.render('thanks', { layout: 'main' });
});

//  GET request to "/signers"
app.get('/signers', (req, res) => {
    db.signerName()
        .then(({ rows }) => {
            res.render('signers', { layout: 'main', rows });
        })
        .catch((err) => console.log('err :>> ', err));
    res.redirect('/petition');
});

app.listen(8080, () => console.log("I'm all ears!"));
