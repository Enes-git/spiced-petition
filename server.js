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
// app.use((req, res, next) => {
//     if (req.session.signatureId) {
//         req.url != '/petition' ? next() : res.redirect('/thanks');
//     } else {
//         req.url == '/petition' ? next() : res.redirect('/petition');
//     }
// });

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
    // storing data in db redirecting to thanks page but having an error on bash!!(violate check constraint)
    // user entered info from the form
    const { firstname, lastname, signature } = req.body;

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
            res.render('petition', {
                layout: 'main',
                error: true,
                errorMsg: `Error in saving your data, try again!`,
            }); // can be both in templates and here / should  it in the handlebars / can be put into partials
        });
});

//  GET request to "/thanks"
app.get('/thanks', (req, res) => {
    db.totalSigners().then(({ rows }) => {
        let signerCount = rows[0].count;
        =================================
        add signature img !!
        // console.log('signerCount :>> ', signerCount);
        res.render('thanks', { layout: 'main', signerCount });
    });
});

//  GET request to "/signers"
app.get('/signers', (req, res) => {
    //ERROR: cannot set headers / not rendering
    db.signerName()
        .then(({ rows }) => {
            // console.log('rows :>> ', rows);
            res.render('signers', { layout: 'main', rows });
        })
        .catch((err) => console.log('err :>> ', err));
    res.redirect('/petition');
});

app.listen(8080, () => console.log("I'm all ears!"));
