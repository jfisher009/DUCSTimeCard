// File: auth.js
// Author:  S. Sigman   Date: 11/23/2020
// Copyright 2021 Scott Sigman
// 
// This file defines a route to authenticate a user.
// API
//  Resource   Req Verb  Description               Status Code
//  /auth        POST    Authenticate User         200 (user authenticated)
//                                                 401 (authentication failed)
//
// Modification Log
// 1/17/2021 Reused code from App Dev I 2020 project. S. Sigman
// 1/17/2021 Modified query to include password. S. Sigman
// 4/22/2021 Modified Query to use MySql
// 9/14/2021 Modified MySql queries to be resistant to SQL injections by J Fisher

const bodyParser = require("body-parser");
const router = require("express").Router();
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const key = "supersecret";
const conn = require("../mysqldb");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
router.use(bodyParser.json());


router.post('/',async (req,res) => {

    //find user
    let qry = "SELECT email, passwordHash, lname, fname, role, created FROM User WHERE email = ?;";
    
    //query the database
    conn.query(qry, [req.body.email], async (err, rows) => {
        if (err) return res.status(500).json({error: err});

        if(rows.length != 1){
            res.status(401).json({msg: 'user unauthorized'});
        }
        else{
            user = rows[0];
            //get password hash
            const passHash = user.passwordHash;

            //check if hash and plain text password match
            let result = await bcrypt.compare(req.body.password, passHash);

            //if user is found and password matches hash
            if(result){
                const token = jwt.encode({username: req.body.email}, key);

                //save email in cookie to log authenticated users
                res.cookie('email',req.body.email)
                res.status(200).json({msg: 'user authenticated', 
                                        fname: user.fname, 
                                        lname: user.lname, 
                                        role: user.role,
                                        token: token});
            }

            //if user is found and password doesn't match
            else{
                res.status(401).json({msg: 'user unauthorized'});
            }
        }
    });
});

module.exports = router;
