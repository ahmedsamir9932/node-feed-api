const fs = require('fs')
const path = require('path')

const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
// const localUrl = 'http://localhost:4300/'


// statring with version 14.3 of nodejs you clould use top level async keyword whick mean
// you could use it outside of aysnc function

// const x = await // some other code
// but if in function aysnc still shoulg be existed

// add pagination
exports.getPosts = async (req, res, next) => {
    const currentPage = +req.query.currentPage || 1;
    const pageSize = +req.query.pageSize || 5;
    // let totalItems;
    
    // we could use it but we still need all logic inside the call backfunction and will end up with alternative blocks
    // so then and block make it more readable beacuse every block of then after each other
    
    // Post().find().countDocuments(count => {
    //     // here is call back function
    // })

        
    // then and catch blocks 
    // Post.find()
    //     .countDocuments()
    //     .then(count => {
    //     totalItems = count
    //         return Post.find()
    //             .skip((currentPage - 1) * pageSize)
    //             .limit(pageSize)
    // })
    // .then(posts => {
    //     res.status(200).json({
    //         message: 'Posts Fetched Successfully',
    //         posts: posts,
    //         totalItems: totalItems
    //     })
    // })
    // .catch(error => {
    //     if (!error.statusCode) {
    //         error.statusCode = 500;
    //     };
    //     next(error)
    // })

    // using try and catch with aysnc code with aysnc and await for handling errors
    try {   
        // aysnc and await syntax
        const totalItems = await Post.find().countDocuments() //.exec()  // return object like promise if transform it use exec()
        // here he will convert this line and add then block behind the scense and store the result to the variable
        // and add any lines ater await in the then block he created behind the scense
    
        // here it will excute inside the then block the have been created from  // await Post.find().countDocuments()
        const posts = await Post.find()
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
    
        // and this id the same excute it behind the scense inside then block of await
        res.status(200).json({
            message: 'Posts Fetched Successfully',
            posts: posts,
            totalItems: totalItems
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error)
    }
    
    // .catch(error => {
    //     if (!error.statusCode) {
    //         error.statusCode = 500;
    //     };
    //     next(error)
    // })

}

// that because i export multiple function
exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    // if (!errors.isEmpty()) {    // return this error response manual for this sync code snippet
    //     return res.status(422).json({message: 'Invalid data', errors: errors.array()})
    // }
    if (!errors.isEmpty()) {
        const error = new Error('Invalid data !');
        error.statusCode = 422;
        throw error;
        // this work because it sync code snippet here if aysnc not working 
        // and we should handle it from generic middleware express like catch block below
    }
    // if no image provided
    if (!req.file) {
        const error = new Error('No image provided')
        error.statusCode = 422;
        throw error
    }
    const imageUrl = req.file.path    // get path of file from multer
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });

    // post.save()
    //     .then(result => {
    //         return User.findById(req.userId)
    //     })
    //     .then(user => {
    //         creator = user;
    //         user.posts.push(post);
    //         return user.save();
    //     })
    //     .then(result => {
    //         res.status(201).json({
    //         message: 'Post created successfully',
    //             post: post,
    //             creator: {
    //                 _id: creator._id,
    //                 name: creator.name
    //             }
    //         })
    //     })
    //     .catch(error => {
    //     if (!error.statusCode) {
    //         error.statusCode = 500;
    //     };
    //     next(error)
    //     // throw err      // not working because it aysnc
    // })

    try {
        const result1 = await post.save()
        const user = await User.findById(req.userId)
        // creator = user;
        user.posts.push(post);
        const result = await user.save();
        res.status(201).json({
            message: 'Post created successfully',
            post: post,
            creator: {
                _id: user._id,
                name: user.name
                }
            })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error)
    }

}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    // Post.findById(postId).then(post => {
    //     if (!post) {
    //         const error = new Error('Cannot find post with thid id');
    //         error.statusCode = 404;
    //         throw error
    //     }
    //     res.status(200).json({ message: 'Post Fetched Successfully', post: post });
    // }).catch(error => {
    //     if (!error.statusCode) {
    //         error.statusCode = 500;
    //     };
    //     next(error)
    // })

    try {
        const post = Post.findById(postId)    
        if (!post) {
            const error = new Error('Cannot find post with thid id');
            error.statusCode = 404;
            throw error
        }
        res.status(200).json({
            message: 'Post Fetched Successfully',
            post: post
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error)
    }
}

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    // if (!errors.isEmpty()) {    // return this error response manual for this sync code snippet
    //     return res.status(422).json({message: 'Invalid data', errors: errors.array()})
    // }
    if (!errors.isEmpty()) {
        const error = new Error('Invalid data !');
        error.statusCode = 422;
        throw error;
        // this work because it sync code snippet here if aysnc not working 
        // and we should handle it from generic middleware express like catch block below
    }
    const title = req.body.title;
    const content = req.body.content
    let imageUrl = req.body.image  // if not changed from frontend and keep old url
    if (req.file) {
        imageUrl = req.file.path   // if updated from frontend
    }
    if (!imageUrl) {
        // if not set from these two options
        const error = new Error('No file picked.')
        error.statusCode = 422;
        throw error
    }
    // Post.findById(postId).then(post => {
    //     if (!post) {
    //         const error = new Error('Cannot find post with thid id');
    //         error.statusCode = 404;
    //         throw error
    //     }
    //     if (post.creator.toString() !== req.userId) {
    //         const error = new Error('Not Authorized')
    //         error.statusCode = 403;
    //         throw error;
    //     }
    //     if (imageUrl !== post.imageUrl) {
    //         deleteFile(post.imageUrl)     
    //     }
    //     post.title = title;
    //     post.content = content;
    //     post.imageUrl = imageUrl;
    //     return post.save()
    // })
    //     .then(result => {
    //         res.status(200).json({message: 'Post Updated Successfully', post: result})
    //     })
    //     .catch(error => {
    //     if (!error.statusCode) {
    //         error.statusCode = 500;
    //     };
    //     next(error)
    // })
    try {
        const post = await Post.findById(postId)
        if (!post) {
            const error = new Error('Cannot find post with thid id');
            error.statusCode = 404;
            throw error
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized')
            error.statusCode = 403;
            throw error;
        }
        if (imageUrl !== post.imageUrl) {
            deleteFile(post.imageUrl)     
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        const result = await post.save()
        res.status(200).json({
            message: 'Post Updated Successfully',
            post: result
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error)
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    // Post.findById(postId)
    // .then(post => {
    //     if (!post) {
    //         const error = new Error('Cannot find post with thid id');
    //         error.statusCode = 404;
    //         throw error
    //     }
    //     if (post.creator.toString() !== req.userId) {
    //         const error = new Error('Not Authorized')
    //         error.statusCode = 403;
    //         throw error;
    //     }
    //     // checked loggedin user
    //     deleteFile(post.imageUrl)
    //     return Post.findByIdAndDelete(postId)
    // })
    //     .then(result => {
    //         return User.findById(req.userId)
    //     })
    //     .then(user => {
    //         user.posts.pull(postId);
    //         return user.save();
    //     })
    //     .then(result => {
    //         res.status(200).json({message: 'Post Deleted Successfully'})
    //     })
    // .catch(error => {
    //     if (!error.statusCode) {
    //         error.statusCode = 500;
    //     };
    //     next(error)
    // })
    try {
        const post = await Post.findById(postId)
        if (!post) {
            const error = new Error('Cannot find post with thid id');
            error.statusCode = 404;
            throw error
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized')
            error.statusCode = 403;
            throw error;
        }
        // checked loggedin user
        deleteFile(post.imageUrl)
        const result1 = await Post.findByIdAndDelete(postId)
        const user = await User.findById(req.userId)
        user.posts.pull(postId);
        const result = await user.save();
        res.status(200).json({
            message: 'Post Deleted Successfully',
            post: result1,
            user: result,
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error)
    }
}

const deleteFile = filePath => {
    filePath = path.join(__dirname, '..', filePath)       // ex -> images/test.png --> look in root and go to images folder
    fs.unlink(filePath, err => console.log(err));
}