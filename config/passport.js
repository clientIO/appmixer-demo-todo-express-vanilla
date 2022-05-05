const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { HeaderAPIKeyStrategy } = require('passport-headerapikey');
const mongoose = require('mongoose');
const User = require('../models/User');
const crypto = require('crypto');

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/auth/google/callback'
            },
            async (accessToken, refreshToken, profile, done) => {

                try {
                    let user = await User.findOne({ googleId: profile.id });
                    if (user) {
                        done(null, user);
                    } else {
                        const newUser = {
                            googleId: profile.id,
                            displayName: profile.displayName,
                            firstName: profile.name.givenName,
                            lastName: profile.name.familyName,
                            image: profile.photos[0].value,
                            email: profile.emails[0].value,
                            apiKey: crypto.randomBytes(48).toString('hex')
                        };
                        user = await User.create(newUser);
                        done(null, user);
                    }
                } catch (err) {
                    console.error(err)
                }
            }
        )
    );

    passport.use(new HeaderAPIKeyStrategy(
        { header: 'X-Api-Key' },
        false,
        function(apiKey, done) {
            User.findOne({ apiKey: apiKey }, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user);
            });
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id)
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    });
};
