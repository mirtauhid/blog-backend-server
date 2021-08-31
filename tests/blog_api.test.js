const supertest = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');
const app = require('../app');

const api = supertest(app);

const Blog = require('../models/blog');

beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
});

describe('initially stored blogs', () => {
    test('saved blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs');

        expect(response.body).toHaveLength(helper.initialBlogs.length);
    });

    test('a specific blog in the returned blogs', async () => {
        const response = await api.get('/api/blogs');

        const titles = response.body.map((r) => r.title);

        expect(titles).toContain('React patterns');
    });
});

describe('finding a specific blog', () => {
    test('succeeds with a valid id', async () => {
        const blogAtStart = await helper.blogsInDb();

        const blogToView = blogAtStart[0];

        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const processedBlogToView = JSON.parse(JSON.stringify(blogToView));

        expect(resultBlog.body).toEqual(processedBlogToView);
    });

    test('fails with status code 404 if blog does not exist', async () => {
        const validNonexistingId = await helper.nonExistingId();

        console.log(validNonexistingId);

        await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
    });

    test('fails with status code 400 if id is invalid', async () => {
        const invalidId = '5a3d5da59070081a82a3445';

        await api.get(`/api/blogs/${invalidId}`).expect(400);
    });
});

describe('addition of a new blog', () => {
    beforeEach(async () => {
        const newUser = {
            username: 'mtauhid',
            password: 'aqsw1234',
        };

        newUser.password = await bcrypt.hash(newUser.password, 10);

        const loggedUser = await api.post('/api/login').send(newUser);

        const { token } = loggedUser.body;

        test('addition succeeds with valid data', async () => {
            const newBlog = {
                title: 'Script JS under the hook',
                author: 'Mir Tauhidul',
                url: 'api/blogs/scriptjs',
                likes: 8,
            };

            await api
                .post('/api/blogs')
                .send(newBlog)
                .set({ Authorization: `bearer ${token}` })
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const blogsAtEnd = await helper.blogsInDb();
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

            const title = blogsAtEnd.map((n) => n.title);
            expect(title).toContain('Node JS under the hook');
        });

        test('fails with status code 400 if data invalid', async () => {
            const newBlog = {
                title: 'React under the hood',
                url: 'react-hood.com',
            };

            await api
                .post('/api/blogs')
                .send(newBlog)
                .set({ Authorization: `bearer ${token}` })
                .expect(400);

            const blogsAtEnd = await helper.blogsInDb();

            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
        });
    });
});

describe('removing a blog', () => {
    test('removing succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToDelete = blogsAtStart[0];

        await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

        const titles = blogsAtEnd.map((r) => r.content);

        expect(titles).not.toContain(blogToDelete.content);
    });
});

afterAll(() => {
    mongoose.connection.close();
});
