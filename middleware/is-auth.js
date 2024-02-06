const jwt = require('jsonwebtoken');

// const isAuth = (req, res, next) => {
//     const tokenHeader = req.get('Authorization');
//     if (!tokenHeader) {
//         const error = new Error('Not Authenticated')
//         error.statusCode = 401;
//         throw error;
//     }
//     const token = tokenHeader.split(' ')[1];
//     let decodedToken;
//     try {
//         decodedToken = jwt.verify(token, 'Test@102030');
//         if (!decodedToken) {
//             const error = new Error('Not Authenticated')
//             error.statusCode = 401;
//             throw error;
//         }
//     } catch (err) {
//         err.statusCode = 500;
//         throw err;
//     }
//     req.userId = decodedToken.userId;
//     next()
// }

// module.exports = isAuth


module.exports = (req, res, next) => {
    const tokenHeader = req.get('Authorization');
    if (!tokenHeader) {
        const error = new Error('Not Authenticated')
        error.statusCode = 401;
        throw error;
    }
    const token = tokenHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'Test@102030');
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error('Not Authenticated')
        error.statusCode = 401;
        throw error;
    }
    console.log(decodedToken);
    req.userId = decodedToken.userId;
    next()
}