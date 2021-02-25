// for login and registration routes
const { hash, compare } = require('./utils/bc.js');
const db = require('./db');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const express = require('express');
const router = express.Router();
const { requireLoggedOut } = require('./middlewares');

// ===== GET ======
// route "/"
router.get('/', requireLoggedOut, (req, res) => {
    res.redirect('/login'); // can be changed to a landing page
});

// route "/register"
router.get('/register', requireLoggedOut, (req, res) => {
    res.render('register', { layout: 'main' });
});

// route "/login"
router.get('/login', requireLoggedOut, (req, res) => {
    res.render('login', { layout: 'main' });
});
// =================

// ======= POST ======
// route "/register"
router.post('/register', (req, res) => {
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
                            res.redirect('/profile');
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

// route "/login"
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email == '' || password == '') {
        res.render('login', {
            layout: 'main',
            error: true,
            errorMsg: `Did you think I would buy that?! Please give me that email and password now!`,
        });
    }
    db.getLogInfo(email)
        .then(({ rows }) => {
            // console.log('rows :>> ', rows);
            const { password_hash, id } = rows[0];
            return compare(password, password_hash)
                .then((match) => {
                    if (match) {
                        // setting a user id
                        req.session.userId = id;
                        // sig check
                        if (rows[0].signature != null) {
                            req.session.signatureId = rows[0].signature_id;
                            res.redirect('/thanks');
                        } else {
                            res.redirect('/petition');
                        }
                    } else {
                        res.render('login', {
                            layout: 'main',
                            error: true,
                            errorMsg: `Your password is wrong, please try again with paying attention to your fingers!`,
                        });
                    }
                })
                .catch((err) => {
                    console.log('err :>> ', err);
                    return db.getLogInfo(email);
                });
        })
        .catch((err) => {
            console.log('err :>> ', err);
            res.render('login', {
                layout: 'main',
                error: true,
                errorMsg: `Either you are trying to trick us with an unregistered email or the nasty database didn't give us your information.  Either way please try again.`,
            });
        });
});

exports.router = router;
