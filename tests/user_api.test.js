const bcrypt = require('bcrypt');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const helper = require('./helper');

const api = supertest(app);

describe('invalid data checks', () => {
    beforeEach(async () => {
        await User.deleteMany();

        const passwordHash = await bcrypt.hash('hidden', 10);
        const user = new User({ username: 'root', passwordHash });

        await user.save();
    });

    test('invalid data is not saving to db', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'jThompson',
            name: 'Joe Thompson',
            password: 'thompson',
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const usernames = usersAtEnd.map((name) => name.username);
        expect(usernames).toContain(newUser.username);
    });
    test('duplicate username adding failed', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'root',
            name: 'Joe Morison',
            password: 'morientes',
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('`username` to be unique');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
});
