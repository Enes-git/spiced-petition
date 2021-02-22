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

//  user check with cookie ===== NOT WORKING ======
// app.use((req, res, next) => {
//     if (req.session.userId) {
//         req.url != '/register' ? res.redirect('/login') : next();
//     } else {
//         res.redirect('/register');
//     }
// });

// signature check with cookie ===== NOT WORKING ======
// app.use((req, res, next) => {
//     if (req.session.signatureId) {
//         req.url != '/signers' ? res.redirect('/thanks') : next();
//     } else {
//         res.redirect('/petition');
//     }
// });
// app.use((req, res, next) => {
//     if (req.session.userId) {
//         if (req.url != "register"){
//             res.redirect("/login");
//             next('route');
//         } else{
//             next('route');
//         }
//     else next()
// }, (req,res, next)=>{
//     if (req.session.signatureId){
//         if (req.url == )
//         res.redirect("/thanks")
//     }
// }
// );
// ==================== REQUESTS ========================

// ==== GET REQUESTS =====
// route "/"
app.get('/', (req, res) => {
    res.redirect('/register'); // can be changed to a landing page
});

// route "/register"
app.get('/register', (req, res) => {
    res.render('register', { layout: 'main' });
});

// route "/login"
app.get('/login', (req, res) => {
    res.render('login', { layout: 'main' });
});

//  route "/profile"
app.get('/profile', (req, res) => {
    res.render('profile', { layout: 'main' });
});

//  route "/petition"
app.get('/petition', (req, res) => {
    res.render('petition', { layout: 'main' });
});

//  route "/thanks"
app.get('/thanks', (req, res) => {
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
                .catch((err) => console.log('err :>> ', err));
        })
        .catch((err) => console.log('err :>> ', err));
});

// route "/signers"
app.get('/signers', (req, res) => {
    //ERROR: cannot set headers / not rendering
    db.getAllSigners()
        .then(({ rows }) => {
            // console.log('rows :>> ', rows);
            // const { first_name, last_name, age, city, url } = rows;
            res.render('signers', { layout: 'main', rows });
        })
        .catch((err) => console.log('err :>> ', err));
});

// route "/signers_by_city"
app.get('/signers_by_city/:city', (req, res) => {
    const city = req.params.city;
    db.getLocalSigners(req.params.city).then(({ rows }) => {
        res.render('signers_by_city', { layout: 'main', rows, city });
    });
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

// route "login"
app.post('/login', (req, res) => {
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
            const { password_hash, id } = rows[0];
            return compare(password, password_hash)
                .then((match) => {
                    if (match) {
                        req.session.userId = id;
                        if (req.session.signatureId) {
                            req.url == '/signers'
                                ? res.redirect('/signers') // can use next() or continue here?
                                : res.redirect('/thanks');
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
                errorMsg: `Either you are trying to trick us with an unregistered email or the nasty database didn't gave us your information.  Either way please try again.`,
            });
        });
});

// route "/profile"
app.post('/profile', (req, res) => {
    const { age, city, url } = req.body;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url += 'https://';
    }
    // req.session.userId = id; // turned out i do not need it otherwise i recieve an error
    // should i define a user id cookie here? or do i have already one?
    db.addProfile(req.session.userId, age, city, url)
        .then(() => {
            res.redirect('/petition');
        })
        .catch((err) => {
            console.log('err :>> ', err);
            res.render('profile', {
                layout: 'main',
                error: true,
                errorMsg: `A problem occured while saving your data. Please try again.`,
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
// ============= END  POST requests ==========================

app.listen(process.env.PORT || 8080, () => console.log("I'm all ears!"));
