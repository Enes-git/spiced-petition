const { hash, compare } = require('./utils/bc.js');
const db = require('./db');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const express = require('express');
const authRoutes = require('./auth_routes');
const csurf = require('csurf');
const app = express();
const {
    requireLoggedIn,
    requireSignature,
    requireNoSignature,
} = require('./middlewares');

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

// csurf
app.use(csurf());

app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

//  serving the static files
app.use(express.static('./public'));

// adding auth routes file
app.use(authRoutes.router);

// user check with cookies
// userId check
app.use(requireLoggedIn);

// ==================== REQUESTS ========================
// ==== GET REQUESTS =====
//  route "/profile"
app.get('/profile', (req, res) => {
    res.render('profile', { layout: 'main' });
});

// route "/edit"
app.get('/edit', (req, res) => {
    db.getUpdateInfo(req.session.userId)
        .then(({ rows }) => {
            res.render('edit', { layout: 'main', rows });
        })
        .catch((err) => console.log('err in get/edit getUpdateInfo :>> ', err));
});

//  route "/petition"
app.get('/petition', requireNoSignature, (req, res) => {
    res.render('petition', { layout: 'main' });
});

//  route "/thanks"
app.get('/thanks', requireSignature, (req, res) => {
    db.getSignersCount()
        .then(({ rows }) => {
            let signerCount = rows[0].count;
            // console.log('signerCount :>> ', signerCount);
            db.getSignature(req.session.signatureId)
                .then(({ rows }) => {
                    let canvasUrlVal = rows[0].signature;
                    res.render('thanks', {
                        layout: 'main',
                        signerCount,
                        canvasUrlVal,
                    });
                })
                .catch((err) =>
                    console.log('err in get/thanks getSignature :>> ', err)
                );
        })
        .catch((err) =>
            console.log('err in get/thanks getSignatureCount :>> ', err)
        );
});

// route "/signers"
app.get('/signers', requireSignature, (req, res) => {
    db.getAllSigners()
        .then(({ rows }) => {
            // console.log('rows :>> ', rows);
            // const { first_name, last_name, age, city, url } = rows;
            res.render('signers', { layout: 'main', rows });
        })
        .catch((err) =>
            console.log('err in get/signers getAllSigners :>> ', err)
        );
});

// route "/signers_by_city"
app.get('/signers/:city', (req, res) => {
    const city = req.params.city;
    console.log('city :>> ', city);
    db.getLocalSigners(req.params.city).then(({ rows }) => {
        console.log('city :>> ', city);
        res.render('signersbycity', { layout: 'main', rows, city });
    });
});

// =============== END GET requests ===========================

// =============== POST REQUESTS =========================
// route "/profile"
app.post('/profile', (req, res) => {
    let { age, city, url } = req.body;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url += 'https://';
    }
    // req.session.userId = id; // turned out i do not need it otherwise i recieve an error
    // should i define a user id cookie here? or do i have already one?
    db.addProfile(age, city, url, req.session.userId)
        .then(() => {
            res.redirect('/petition');
        })
        .catch((err) => {
            console.log('err in post/profile addProfile :>> ', err);
            res.render('profile', {
                layout: 'main',
                error: true,
                errorMsg: `A problem occured while saving your data. Please try again.`,
            });
        });
});

// route "/edit"
app.post('/edit', (req, res) => {
    // second try
    const { firstname, lastname, email, password, age, city, url } = req.body;
    db.editProfile(age, city, url, req.session.userId)
        .then(() => {
            if (password) {
                hash(password)
                    .then((password_hash) => {
                        db.editUserWithPass(
                            firstname,
                            lastname,
                            email,
                            password_hash,
                            req.session.userId
                        )
                            .then(({ rows }) => {
                                res.render('edit', {
                                    layout: 'main',
                                    rows,
                                    success: true,
                                    successMsg: `Your profile is successfully updated.`,
                                });
                            })
                            .catch((err) => {
                                console.log(
                                    'err in post/edit editUserWithPassword :>> ',
                                    err
                                );
                            });
                    })
                    .catch((err) => {
                        console.log('err in post/edit hash :>> ', err);
                    });
            } else {
                db.editUserNoPass(
                    firstname,
                    lastname,
                    email,
                    req.session.userId
                )
                    .then(({ rows }) => {
                        res.render('edit', {
                            layout: 'main',
                            rows,
                            success: true,
                            successMsg: `Your profile is successfully updated.`,
                        });
                    })
                    .catch((err) => {
                        console.log(
                            'err in post/edit editUserNoPass :>> ',
                            err
                        );
                    });
            }
        })
        .catch((err) => {
            console.log('req.session.userId :>> ', req.session.userId);
            console.log('err in post/edit editProfile :>> ', err);
        });
});

//  route "/petition"
app.post('/petition', (req, res) => {
    // user entered info from the form
    const { signature } = req.body;
    // adding user infos to petition database
    db.addSignature(req.session.userId, signature)
        .then(({ rows }) => {
            // console.log('rows :>> ', rows);
            // redirecting to thanks page and setting cookie
            req.session.signatureId = rows[0].id;
            res.redirect('/thanks');
        })
        .catch((err) => {
            console.log('err in post/petition addSignature :>> ', err);
            res.render('petition', {
                layout: 'main',
                error: true,
                errorMsg: `Error in saving your data, try again!`,
            }); // can be both in templates and here / should  it in the handlebars / can be put into partials
        });
});

// route "/thanks" (deleting)
app.post('/thanks', (req, res) => {
    db.deleteSignature(req.session.userId)
        .then(() => {
            req.session.signatureId = null;
            res.redirect('/petition');
        })
        .catch((err) => {
            console.log('err in deleteSignature :>> ', err);
            res.render('thanks', {
                layout: 'main',
                error: true,
                errorMsg: `An error occured. Please try again.`,
            });
        });
});
// ============= END  POST requests ==========================

app.listen(process.env.PORT || 8080, () => console.log("I'm all ears!"));
