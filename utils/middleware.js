/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('./logger');

const requestLogger = (request, response, next) => {
    logger.info('Method', request.method);
    logger.info('Path', request.path);
    logger.info('Body: ', request.body);
    logger.info('___');
    next();
};

const tokenExtractor = (request, response, next) => {
    const getTokenFrom = () => {
        const authorization = request.get('authorization');
        if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
            return authorization.substring(7);
        }
        return null;
    };
    request.token = getTokenFrom(request);

    next();
};

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
    logger.error(error.message);

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'malformed id' });
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }

    next(error);
};

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
};
