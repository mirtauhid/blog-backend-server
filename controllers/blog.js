const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({});
    response.json(blogs);
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
    const { body } = request;
    try {
        const blog = Blog.findByIdAndDelete(request.params.id, body);
        if (blog) {
            response.json(blog);
        } else {
            response.status(404).end();
        }
    } catch (exception) {
        next(exception);
    }
});

blogsRouter.post('/', async (request, response, next) => {
    const { body } = request;
    try {
        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
        });

        const result = await blog.save();
        response.status(201).json(result);
    } catch (exception) {
        next(exception);
    }
});

module.exports = blogsRouter;
