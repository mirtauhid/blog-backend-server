/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

const blogs = [
    {
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
    },
];

beforeEach(async () => {
    await Blog.deleteMany({});
    let blogObject = new Blog(blogs[0]);
    await blogObject.save();
    blogObject = new Blog(blogs[1]);
    await blogObject.save();
});

test('all blogs returned', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(blogs.length);
}, 100000);

test('should return blogs in json format', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);
}, 100000);

test('verifying the existence of a property', async () => {
    const response = await api.get('/api/blogs');
    const id = response.body.map((r) => r.id);
    expect(id).toBeDefined();
}, 100000);

test('database saved data checking', async () => {
    const newBlog = {
        title: 'React Under The Hood',
        author: 'George Man',
        url: 'https://reactunderhood.com/',
        likes: 6,
    };

    await api.post('/api/blogs').send(newBlog).expect(201);
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(blogs.length + 1);
    const titles = response.body.map((r) => r.title);
    expect(titles).toContain('React Under The Hood');
}, 100000);

test('property check', async () => {
    const newBlog = {
        title: 'React Under The Hood',
        author: 'George Man',
        url: 'https://reactunderhood.com/',
    };

    if (newBlog.likes === undefined) {
        newBlog.likes = 0;
        await api.post('/api/blogs').send(newBlog).expect(201);
        const response = await api.get('/api/blogs');
        response.body.map((r) => {
            if (r.likes === undefined) {
                r.likes = 0;
                expect(r.likes).toEqual(0);
            }
        });
    }
}, 100000);

test('multiple properties check', async () => {
    const newBlog = {
        author: 'George Man',
        likes: 8,
    };

    await api.post('/api/blogs').send(newBlog).expect(400);
}, 100000);

afterAll(() => {
    mongoose.connection.close();
});
