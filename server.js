const { hash, compare } = require('./utils/bc.js');
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
    if (req.session.userId) {
        req.url != '/register'
            ? res.redirect('/login', { layout: main })
            : next();
    } else {
        res.redirect('/register', { layout: 'main' });
    }
});

// signature check with cookie
app.use((req, res, next) => {
    if (req.session.signatureId) {
        req.url != '/signers'
            ? res.redirect('/thanks', { layout: 'main' })
            : next();
    } else {
        res.redirect('/petition', { layout: 'main' });
    }
});

// ==================== REQUESTS ========================

// ==== GET REQUESTS =====
// route "/register"
app.get('/register', (req, res) => {
    res.render('register', { layout: 'main' });
});

// route "/login"
app.get('/login', (req, res) => {
    res.render('login', { layout: 'main' });
});

// route "/"
app.get('/', (req, res) => {
    res.redirect('/petition'); // can be changed to a landing page
});

//  route "/petition"
app.get('/petition', (req, res) => {
    res.render('petition', { layout: 'main' });
});

//  route "/thanks"
app.get('/thanks', (req, res) => {
    db.totalSigners()
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
                .catch((err) => console.log('err :>> ', err));
        })
        .catch((err) => console.log('err :>> ', err));
});

// route "/signers"
app.get('/signers', (req, res) => {
    //ERROR: cannot set headers / not rendering
    db.signerName()
        .then(({ rows }) => {
            // console.log('rows :>> ', rows);
            res.render('signers', { layout: 'main', rows });
        })
        .catch((err) => console.log('err :>> ', err));
});
// =============== END GET requests ===========================

// =============== POST REQUESTS =========================
// route "register"
app.post('/register', (req, res) => {
    const { firstname, lastname, email, password, rePassword } = req.body;
    if (!firstname || !lastname || !email || !password || !rePassword) {
        res.render('register', {
            layout: 'main',
            error: true,
            errorMsg: `Please provide all the information. We really want to track you!`,
        });
    } else {
        if (password === rePassword) {
            hash(password)
                .then((password_hash) => {
                    return db
                        .addNewUser(firstname, lastname, email, password_hash)
                        .then(({ rows }) => {
                            req.session.userId = rows[0].id; // firs&lastname may come in handy!
                            res.redirect('/petition');
                        })
                        .catch((err) => {
                            console.log('err :>> ', err);
                            res.render('register', {
                                layout: 'main',
                                error: true,
                                errorMsg: `Wait, I wasn't listening. Please type your information again!`,
                            });
                        });
                })
                .catch((err) => {
                    console.log('err :>> ', err);
                    res.render('register', {
                        layout: 'main',
                        error: true,
                        errorMsg: `This may sound silly but I couldn't handle your password. Will you be a good person and give it again? Please...?`,
                    });
                });
        } else {
            res.render('register', {
                layout: 'main',
                error: true,
                errorMsg: `Your password does NOT match. Please try again carefully. Just focus on your typing!`,
            });
        }
    }
});

// route "login"
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email == '' || password == '') {
        res.render('login', {
            layout: 'main',
            error: true,
            errorMsg: `Did you think I would buy that?! Please give me that email and password to enter.`,
        });
    }
    db.getLogInfo(email)
        .then(({ rows }) => {
            let password_hash = rows[0];
            return compare(password, password_hash).then((match) => {
                if (match) {
                    req.session.userId = id;
                    if (req.session.signatureId) {
                        req.url == '/signers'
                            ? res.redirect('/signers', { layout: 'main' }) // can use next() or continue here?
                            : res.redirect('/thanks', { layout: 'main' });
                    } else {
                        res.redirect('/petition', { layout: 'main' });
                    }
                } else {
                    res.render('login', {
                        layout: 'main',
                        error: true,
                        errorMsg: `Your password is wrong, please try again with paying attention to your fingers!`,
                    });
                }
            });
        })
        .catch((err) => {
            console.log('err :>> ', err);
            res.render('login', {
                layout: 'main',
                error: true,
                errorMsg: `Either you are trying to trick us with an unregistered email or the nasty database didn't gave us your information.  Either way please try again.`,
            });
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
            console.log('err >> ', err);
            res.render('petition', {
                layout: 'main',
                error: true,
                errorMsg: `Error in saving your data, try again!`,
            }); // can be both in templates and here / should  it in the handlebars / can be put into partials
        });
});

app.listen(8080, () => console.log("I'm all ears!"));
