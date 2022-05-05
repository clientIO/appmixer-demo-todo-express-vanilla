const router = require('express').Router();
const Todo_model = require('../models/todo');
const { ensureAuth, ensureApiAuth } = require('../middleware/auth');

router.get('/me', ensureAuth, async (req, res) => {
    res.status(200).json(req.user);
});

router.post('/todo', async (req,res) => {
    const { todo } = req.body;
    const { email } = req.user.email;
    if (!todo) {
        res.redirect('/');
    }
    const newTodo = new Todo_model({ todo, email: req.user.email, done: '0' });
    await newTodo.save();
    res.redirect('/');
});

router.delete('/todo/:_id', async (req, res) => {
    const { _id } = req.params;
    await Todo_model.deleteOne({ _id });
    res.status(200).json({});
});

router.put('/todo/:_id', async (req, res) => {
    const { _id } = req.params;
    const info = Todo_model.find();
    await Todo_model.updateOne({ _id }, { done: '1' });
    res.status(200).json({});
});

router.get('/todo', ensureApiAuth, async (req, res) => {
    const userTodos = await Todo_model.find({ email: req.user.email });
    res.status(200).json(userTodos);
});

module.exports = router;
