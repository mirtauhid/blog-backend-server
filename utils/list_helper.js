/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-spread */
/* eslint-disable no-plusplus */
const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => {
        return sum + blog.likes;
    }, 0);
};

const favoriteBlog = (blogs) => {
    const max = blogs.reduce((prev, current) => {
        return prev.likes > current.likes ? prev : current;
    });
    return {
        title: max.title,
        author: max.author,
        likes: max.likes,
    };
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
};
