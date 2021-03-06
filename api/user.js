// File: user.js
// Author: Julian Fisher    Date: 02/22/2021
// Copyright 2021 by Julian Fisher
// 
// This files defines an api route used to create a user
// 
// Modification Log:
// 05/06/2021 - Modified route to use MySql
// 
// API call to authenticate a user
// resource  POST    authenticated 201 (Created) - User created
// /user?email=ee&password=pp      400 (Bad Request) - User could not be saved
// &fname=ff&lname=ll&role=rr      409 (Conflict) - User already exists with given email
// &roleInfo={}                    500 (Internal Server Error) - Misc server error

const bodyParser = require("body-parser");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const conn = require("../mysqldb");

router.use(bodyParser.json());

router.post('/', async function(req,res){
    //make passwordHash
    const hash = bcrypt.hashSync(req.body.password, 10);

    //Build insert statement for user
    let sqlUserINSERT = "INSERT INTO User (fname, lname, email, passwordHash, role, created) VALUES (";
    sqlUserINSERT += '"'+req.body.fname + '",';
    sqlUserINSERT += '"'+req.body.lname + '",';
    sqlUserINSERT += '"'+req.body.email + '",';
    sqlUserINSERT += '"'+hash + '",';
    sqlUserINSERT += '"'+req.body.role + '",';
    sqlUserINSERT += "NOW());";

    //send INSERT
    conn.query(sqlUserINSERT, (err, rows) => {
        if (err){
            if(err.errno == 1062){
                res.status(409).json({"message":"A user with that email already exists."});
            }
            else{
                res.status(500).json({"message":"An error has occured.  Please try again."});
            }
        }
        else{
            //find user we just created to get it's ID number
            let sqlSELECT = "SELECT iduser FROM `User` WHERE ";
            sqlSELECT += 'email = "' + req.body.email + '";';
            conn.query(sqlSELECT, (err, rows) => {
                if(err){
                    console.log(err)
                    if(err.errno == 1062){
                        res.status(409).json({"message":"A user with that email already exists."});
                    }
                    else{
                        res.status(500).json({"message":"An error has occured.  Please try again. #1"});
                    }
                }
                let newUserID = rows[0].iduser;
                
                //make a variable to hold the query for the specific role 
                let roleInsert;

                //add data if the new user is a student
                if(req.body.role == "student"){
                    roleInsert = "INSERT INTO Student (user_iduser, major, graduatingYear) VALUES (";
                    roleInsert += '"' + String(newUserID) + '",';
                    roleInsert += '"' + req.body.roleInfo.major +'",';
                    roleInsert += '"' + req.body.roleInfo.gradYear + '");'
                }

                //add data if the new user is an instructor
                else if(req.body.role == "instructor"){
                    roleInsert  = "INSERT INTO Instructor (user_iduser, department, officeAddress) VALUES (";
                    roleInsert += String(newUserID) + ',';
                    roleInsert += '"' + req.body.roleInfo.department + '",';
                    Insert += '"' + req.body.roleInfo.officeAddress + '");';
                }

                //send the next query
                conn.query(roleInsert, (err, rows) => {
                    if(err){
                        res.status(400).send();
                    }
                    else{
                        res.status(201);
                        res.send({'message': 'User Created'});
                    }
                });
            });
        }
    });

});

module.exports = router;
