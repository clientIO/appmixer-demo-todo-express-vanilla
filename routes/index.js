const router = require('express').Router();
const Todo = require('../models/todo');
const { ensureAuth, ensureGuest } = require('../middleware/auth');

router.get('/', ensureGuest, (req, res) => {
    res.render('login');
});

router.get('/log', ensureAuth, async (req, res) => {
    const userTodos = await Todo.find({ userId: req.user._id });
    res.render('index', { todos: userTodos, userinfo: req.user });
});

router.get('/profile', ensureAuth, async (req, res) => {
    res.render('profile', { userinfo: req.user });
});

router.get('/automation/flows', ensureAuth, async (req, res) => {
    res.render('automation-flows', { userinfo: req.user });
});

router.get('/automation/logs', ensureAuth, async (req, res) => {
    res.render('automation-logs', { userinfo: req.user });
});

router.get('/automation/integrations', ensureAuth, async (req, res) => {
    res.render('automation-integrations', { userinfo: req.user });
});

router.get('/automation/actions', ensureAuth, async (req, res) => {
    res.render('automation-actions', { userinfo: req.user, env: process.env });
});

module.exports = router;
