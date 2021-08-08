/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const logger = (request, response, next) => {
    console.log('Method', request.method);
    console.log('Path', request.path);
    console.log('Body: ', request.body);
    console.log('___');
    next();
};

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: 12,
        required: true,
    },
    author: {
        type: String,
        minlength: 8,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        required: true,
    },
});

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

const Blog = mongoose.model('Blog', blogSchema);

const mongoUrl = process.env.DB_URI;

console.log('connecting to mongodb');
mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then((response) => {
        console.log('connected to mongodb');
    })
    .catch((error) => {
        console.log(error);
    });

app.use(bodyParser.json());
app.use(logger);
app.use(cors());

app.use(express.json());

app.get('/api/blogs', (request, response) => {
    Blog.find({}).then((blogs) => {
        response.json(blogs);
    });
});

app.get('/api/blogs/:id', (request, response, next) => {
    Blog.findById(request.params.id)
        .then((blog) => {
            if (blog) {
                response.json(blog);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

app.put('/api/blogs/:id', (request, response, next) => {
    const { body } = request;
    Blog.findByIdAndUpdate(request.params.id, body)
        .then((blog) => {
            if (blog) {
                response.json(blog);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

app.delete('/api/blogs/:id', (request, response, next) => {
    Blog.findByIdAndDelete(request.params.id)
        .then((blog) => {
            if (blog) {
                response.json(blog);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

app.post('/api/blogs', (request, response, next) => {
    const { body } = request;
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    });

    blog.save()
        .then((result) => {
            response.status(201).json(result);
        })
        .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'malformed id' });
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }

    next(error);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
