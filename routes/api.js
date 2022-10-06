const router = require('express').Router();
const Todo = require('../models/todo');
const Webhook = require('../models/webhook');
const { ensureApiAuth } = require('../middleware/auth');
const axios = require('axios');

router.get('/me', ensureApiAuth, async (req, res) => {
    res.status(200).json(req.user);
});

router.post('/todo', ensureApiAuth, async (req,res) => {
    const { item } = req.body;
    const userId = req.user._id;
    if (!item) {
        return res.status(400).json({ err: 'Todo item empty.' });
    }
    const newTodoData = { item, userId, status: 'todo' };
    const newTodo = new Todo(newTodoData);
    const savedTodo = await newTodo.save();
    notifyWebhooks(userId, 'todo-created', savedTodo);
    res.status(200).json({});
});

router.delete('/todo/:_id', ensureApiAuth, async (req, res) => {
    const { _id } = req.params;
    const foundTodo = await Todo.findOne({ _id }).lean();
    if (!foundTodo) return res.status(200).json({});
    await Todo.deleteOne({ _id });
    notifyWebhooks(req.user._id, 'todo-deleted', foundTodo);
    res.status(200).json({});
});

router.delete('/todo', ensureApiAuth, async (req, res) => {
    const userId = req.user._id;
    for await (const doc of Todo.find({ userId }).cursor()) {
        notifyWebhooks(userId, 'todo-deleted', doc);
        await Todo.deleteOne({ _id: doc._id });
    }
    res.status(200).json({});
});

router.put('/todo/:_id', ensureApiAuth, async (req, res) => {
    const { _id } = req.params;
    const { status } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(_id, { status }, { lean: true, returnDocument: 'after' });
    notifyWebhooks(req.user._id, 'todo-updated', updatedTodo);
    res.status(200).json({});
});

router.get('/todo', ensureApiAuth, async (req, res) => {
    const userTodos = await Todo.find({ userId: req.user._id });
    res.status(200).json(userTodos);
});

router.post('/webhooks', ensureApiAuth, async (req, res) => {
    const { url } = req.body;
    const userId = req.user._id;
    const newWebhook = new Webhook({ url, userId });
    const savedWebhook = await newWebhook.save();
    res.status(200).json(savedWebhook);
});

router.delete('/webhooks/:_id', ensureApiAuth, async (req, res) => {
    const { _id } = req.params;
    await Webhook.deleteOne({ _id });
    res.status(200).json({});
});

const notifyWebhooks = async (userId, event, data) => {
    const webhooks = await Webhook.find({ userId }).lean();
    (webhooks || []).forEach(webhook => {
        axios.post(webhook.url, { event: event, data: data });
    });
};

module.exports = router;
