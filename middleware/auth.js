const passport = require('passport');

const apiKeyAuth = passport.authenticate('headerapikey', { session: false });

module.exports = {
    ensureAuth: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/');
        }
    },
    ensureGuest: (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect('/log');
        } else {
            return next();
        }
    },
    ensureApiAuth: (req, res, next) => {
        if (req.isAuthenticated()) {
            // Session cookie.
            return next();
        } else {
            apiKeyAuth(req, res, next);
        }
    }
};
