// middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
    console.error(err.stack);
    res.status(400).json({
        error: true,
        message: err.message,
    });
};
