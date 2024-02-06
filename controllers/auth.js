const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user')

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    // bcrypt.hash(password, 12)
    //     .then(hashedPassword => {
    //         const user = new User({
    //             email: email,
    //             name: name,
    //             password: hashedPassword
    //         })
    //         return user.save()
    //     })
    //     .then(result => {
    //         res.status(201).json({ message: 'User Created Successfully', userId: result._id });
    //     })
    //     .catch(error => {
    //     if (!error.statusCode) {
    //         error.statusCode = 500;
    //     };
    //     next(error)
    // })
    try {
        const hashedPassword = await bcrypt.hash(password, 12)   // aysnc code and does'nt block code excution
        // this run in then block that created behind the scense by await
        const user = new User({
            email: email,
            name: name,
            password: hashedPassword
        })
        const result = await user.save()
        res.status(201).json({
            message: 'User Created Successfully',
            userId: result._id
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error)
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    // let loaderUser;
    // User.findOne({ email: email })
    //     .then(user => {
    //         if (!user) {
    //             const error = new Error('User with this email can not be found')
    //             error.statusCode = 401;
    //             throw error;
    //         }
    //         loaderUser = user;
    //         return bcrypt.compare(password, user.password)
    //     })
    //     .then(isEqual => {
    //         if (!isEqual) {
    //             const error = new Error('Wrong Password');
    //             error.statusCode = 401;
    //             throw error;
    //         }
    //         const token = jwt.sign({
    //             email: loaderUser.email,
    //             userId: loaderUser._id
    //         }, 'Test@102030', { expiresIn: '1h' })
    //         res.status(200).json({ message: 'Login Successfully', token: token, userId: loaderUser._id.toString() });
    //     })
    //     .catch(error => {
    //     if (!error.statusCode) {
    //         error.statusCode = 500;
    //     };
    //     next(error)
    // })


    try {
        // let loaderUser;
        const user =  await User.findOne({ email: email })
        if (!user) {
            const error = new Error('User with this email can not be found')
            error.statusCode = 401;
            throw error;
        }
        // loaderUser = user;

        const isEqual = await bcrypt.compare(password, user.password)
        if (!isEqual) {
            const error = new Error('Wrong Password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({
                email: user.email,
                userId: user._id
            }, 'Test@102030', { expiresIn: '1h' })
        res.status(200).json({
            message: 'Login Successfully',
            token: token,
            userId: user._id.toString()
        });
        
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error)
    }
}