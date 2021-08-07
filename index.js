const http = require('http');
const express = require('express');
require('dotenv').config();

const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
});

const Blog = mongoose.model('Blog', blogSchema);

const mongoUrl = process.env.DB_URI;
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

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

app.get('/api/blogs', (request, response) => {
    Blog.find({}).then((blogs) => {
        response.json(blogs);
    });
});

app.get('/api/blogs/:id', (request, response) => {
    Blog.findById(request.params.id)
        .then((blog) => {
            response.json(blog);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.put('/api/blogs/:id', (request, response) => {
    const { body } = request;
    Blog.findByIdAndUpdate(request.params.id, body)
        .then((blog) => {
            response.json(blog);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.delete('/api/blogs/:id', (request, response) => {
    Blog.findByIdAndDelete(request.params.id)
        .then((blog) => {
            response.json(blog);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.post('/api/blogs', (request, response) => {
    const blog = new Blog(request.body);

    blog.save().then((result) => {
        response.status(201).json(result);
    });
});

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
