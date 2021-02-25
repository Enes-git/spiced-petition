// for middlewares

// only logged users can enter
exports.requireLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// logged in users can't log in again
exports.requireLoggedOut = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/petition');
    }
    next();
};

exports.requireSignature = (req, res, next) => {
    if (!req.session.signatureId) {
        return res.redirect('/petition');
    }
    next();
};

exports.requireNoSignature = (req, res, next) => {
    if (req.session.signatureId) {
        return res.redirect('/thanks');
    }
    next();
};
