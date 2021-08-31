const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (request, response, next) => {
    const { body } = request;
    const saltRounds = 10;
    if (body.password.length >= 3) {
        const passwordHash = await bcrypt.hash(body.password, saltRounds);
        const user = new User({
            username: body.username,
            name: body.name,
            passwordHash,
            blogs: [],
        });
        try {
            const savedUser = await user.save();
            if (savedUser) {
                response.json(savedUser);
            } else {
                response.status(404).end();
            }
        } catch (exception) {
            next(exception);
        }
    } else {
        response.status(400).send('Password length should be minimum 3');
    }
});

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, link: 1, url: 1 });

    response.json(users);
});

module.exports = usersRouter;
