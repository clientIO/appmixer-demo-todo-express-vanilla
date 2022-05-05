const router = require('express').Router();
const Todo_model = require('../models/todo');
const { ensureAuth, ensureGuest } = require('../middleware/auth');

router.get('/', ensureGuest, (req, res) => {
    res.render('login');
});

router.get('/log', ensureAuth, async (req, res) => {
    const userTodos = await Todo_model.find({ email: req.user.email });
    res.render('index', { todos: userTodos, userinfo: req.user });
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

module.exports = router;
