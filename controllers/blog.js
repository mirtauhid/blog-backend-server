/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
    const blog = await Blog.find({}).populate('user', { username: 1, name: 1 });

    response.json(blog);
});

blogsRouter.get('/:id', async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id);
        if (blog) {
            response.json(blog);
        } else {
            response.status(404).end();
        }
    } catch (exception) {
        next(exception);
    }
});

blogsRouter.put('/:id', async (request, response, next) => {
    const { body } = request;
    const user = await User.findById(body.userId);

    try {
        const blog = Blog.findByIdAndUpdate(request.params.id, body);
        if (blog) {
            response.json(blog);
        } else {
            response.status(404).end();
        }
    } catch (exception) {
        next(exception);
    }
});

blogsRouter.delete('/:id', async (request, response, next) => {
    const { body, token } = request;

    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' });
    }
    const blog = await Blog.findById(request.params.id);
    const user = await User.findById(decodedToken.id);
    const userId = user.id;

    if (blog.user.toString() === userId.toString()) {
        try {
            const deletedBlog = await Blog.findByIdAndDelete(request.params.id);
            if (deletedBlog) {
                response.json(blog);
            } else {
                response.status(404).end();
            }
        } catch (exception) {
            next(exception);
        }
    }
});

blogsRouter.post('/', async (request, response, next) => {
    const { body, token } = request;

    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' });
    }
    const user = await User.findById(decodedToken.id);

    try {
        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user._id,
        });

        const result = await blog.save();
        user.blogs = user.blogs.concat(result._id);
        await user.save();

        response.status(201).json(result);
    } catch (exception) {
        next(exception);
    }
});

module.exports = blogsRouter;
