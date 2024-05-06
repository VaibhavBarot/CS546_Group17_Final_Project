import bcrypt from 'bcryptjs';
import validation from '../validation.js';
import {users} from '../config/mongoCollections.js'
import {ObjectId} from 'mongodb';
import exportedHelpers from '../helpers.js';
import e from 'express';


export const registerUser = async(
    firstName,
    lastName,
    email,
    password,
    role
) =>{

    const usersCollection = await users()
    let firstLogin = false;
    if(role !== 'user'){
        firstLogin = true
    }
    let reg_user = {fname:firstName, lname:lastName, email:email, password:password, role:role, firstLogin:firstLogin}
//   if(!firstName || !lastName || !username || !email || !password) throw "All fields must be supplied"
const fields = [
    { value: firstName, name: 'First name' },
    { value: lastName, name: 'Last name' },
    { value: email, name: 'Email' },
    { value: password, name: 'Password' }
];

for (const field of fields) {
    if (!field.value) {
        throw (field.name + ' cannot be empty');
    }
}
validation.checkUser(reg_user)

 const user = await usersCollection.findOne({email});

 if(user)
 {
  throw "Email already exists";
 }

 validation.checkPassword(password,'Password')

validation.checkEmail(email);

 const hashed_password = await bcrypt.hash(password, 10)
 password = hashed_password

 const create_user = await usersCollection.insertOne({
    firstName,
    lastName,
    email,
    password,
    role,
    firstLogin

 },)
 if(!create_user) throw "User not registered"
 if(role === 'tester' || role === 'developer'){
    exportedHelpers.sendEmail(email,'You are added to BugTracker.',"Congratulations! you are added to BugTracker Portal, Hang Tight, your manager will soon assign a project to you.")

 }
 
 return {id:create_user.insertedId,firstName:firstName,lastName:lastName,email:email,role:role, firstLogin:firstLogin};

}

export const loginUser = async(email, password)=>{
    if(!email || !password){
        throw 'Both email and password are required.'
    }
    
    email = email.toLowerCase()
    email = validation.checkString(email,'Email')
    validation.checkEmail(email)

password = validation.checkString(password,'password')
validation.checkPassword(password,'Password')
const usersCollection = await users()
 
 const user = await usersCollection.findOne({email});

 if(!user)
 {
  throw "Either the email or password is invalid";
 }
 const password_match = await bcrypt.compare(password, user.password)
 if(password_match){
    return user
}
else{
    throw "Either the email or password is invalid"
}
}

export const getUsers = async (members_id) => {
    const usersCollection = await users()
    const user_details = await usersCollection.findOne({ _id: new ObjectId(members_id) })
    return {
        firstName: user_details.firstName,
        lastName: user_details.lastName,
        email: user_details.email,
        role: user_details.role,
        _id: user_details._id
    }

}

export const getUser = async (user_id)=>{
    const usersCollection = await users()
    const user = await usersCollection.findOne({_id:new ObjectId()})
    return user

}

export const updatePassword = async(email, oldPassword, newPassword) =>{
    const usersCollection = await users()
    
    if(!email || !oldPassword || !newPassword){
        throw "All fields mus be supplied"
    }
    email = email.toLowerCase()
    email = validation.checkString(email,'Email')
    oldPassword = validation.checkString(oldPassword,'Old Password')
    validation.checkPassword(oldPassword,'Old Password')
    newPassword = validation.checkString(newPassword,'New Password')
    validation.checkPassword(newPassword,'New Password')
    const hashed_new_password = await bcrypt.hash(newPassword, 10)
    newPassword = hashed_new_password
    const user = await usersCollection.findOne({email: email.toLowerCase()})
    if(!user){
        throw "User not found"
    }
    // if(oldPassword !== user.password){
    //     throw "Old Password is incorrect";
    // }
    const old_password_match = await bcrypt.compare(oldPassword, user.password)
    if(!old_password_match){
        throw "Old Password is incorrect"
   }
    const result = await usersCollection.updateOne({email: email.toLowerCase()},{$set:{password: hashed_new_password,firstLogin:false}});
    if(result.modifiedCount === 0){
        throw "Password not updated"
    }
    return {'passwordUpdated':true}
}

export const getAllUsers = async() =>{
    const usersCollection = await users()

    let allUsers = await usersCollection.find({}).toArray()
    return allUsers.filter(user => user.role !== 'manager' && user.role !== 'user')
}

export default{registerUser,loginUser,getUsers, updatePassword, getUser, getAllUsers}
