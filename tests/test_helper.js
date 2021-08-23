/* eslint-disable no-underscore-dangle */
const Blog = require('../models/blog');

const initialBlogs = [
    {
        title: 'React under the hood',
        author: 'Jordan Walke',
        url: '/api/blogs/React under the hood',
        likes: 8,
    },
    {
        title: 'Node JS Intro',
        author: 'Ryan Dahl',
        url: '/api/blogs/Node JS Intro',
        likes: 10,
    },
];

const nonExistingId = async () => {
    const blog = new Blog({
        title: 'Redux masterclass',
        author: 'John Jacob',
        url: '/api/Redux masterclass',
        likes: 7,
    });
    await blog.save();
    await blog.remove();

    return blog._id.toString();
};

const blogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs.map((blog) => blog.toJSON());
};

module.exports = {
    initialBlogs,
    nonExistingId,
    blogsInDb,
};
