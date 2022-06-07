const router = require('express').Router();
const Todo = require('../models/todo');
const Webhook = require('../models/webhook');
const { ensureAuth, ensureApiAuth } = require('../middleware/auth');
const axios = require('axios');

router.get('/me', ensureApiAuth, async (req, res) => {
    res.status(200).json(req.user);
});

router.post('/todo', ensureApiAuth, async (req,res) => {
    const { todo } = req.body;
    const { email } = req.user;

    console.log('POST /todo', req.body, req.user);
    
    if (!todo) {
        res.redirect('/');
    }
    const newTodoData = { todo, email, done: '0' };
    const newTodo = new Todo(newTodoData);
    const savedTodo = await newTodo.save();
    notifyWebhooks(email, 'todo-created', savedTodo);
    res.redirect('/');
});

router.delete('/todo/:_id', ensureApiAuth, async (req, res) => {
    const { _id } = req.params;
    const foundTodo = await Todo.findOne({ _id }).lean();
    if (!foundTodo) return res.status(200).json({});
    await Todo.deleteOne({ _id });
    const { email } = req.user;
    notifyWebhooks(email, 'todo-deleted', foundTodo);
    res.status(200).json({});
});

router.put('/todo/:_id', ensureApiAuth, async (req, res) => {
    const { _id } = req.params;
    const updatedTodo = await Todo.findByIdAndUpdate(_id, { done: '1' }, { lean: true });
    const { email } = req.user;
    notifyWebhooks(email, 'todo-updated', updatedTodo);
    res.status(200).json({});
});

router.get('/todo', ensureApiAuth, async (req, res) => {
    const { email } = req.user;
    const userTodos = await Todo.find({ email });
    res.status(200).json(userTodos);
});

router.post('/webhooks', ensureApiAuth, async (req, res) => {
    const { url } = req.body;
    const { email } = req.user;
    const newWebhook = new Webhook({ url, email });
    const savedWebhook = await newWebhook.save();
    res.status(200).json(savedWebhook);
});

router.delete('/webhooks/:_id', ensureApiAuth, async (req, res) => {
    const { _id } = req.params;
    await Webhook.deleteOne({ _id });
    res.status(200).json({});
});

const notifyWebhooks = async function(email, event, data) {
    const webhooks = await Webhook.find({ email }).lean();
    (webhooks || []).forEach(webhook => {
        axios.post(webhook.url, { event: event, data: data });
    });
};


module.exports = router;
