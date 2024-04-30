import bcrypt from 'bcryptjs';
import validation from '../validation.js';
import {users} from '../config/mongoCollections.js'
import { dbConnection } from '../config/mongoConnection.js';

export const registerUser = async(
    firstName,
    lastName,
    email,
    password,
    role
) =>{

    const dbcon = await dbConnection()
    let reg_user = {fname:firstName, lname:lastName, email:email, password:password, role:role}
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

 const user = await dbcon.collection('users').findOne({email});

 if(user)
 {
  throw "Email already exists";
 }

 validation.checkPassword(password,'Password')

validation.checkEmail(email);

 const hashed_password = await bcrypt.hash(password, 10)
 password = hashed_password

 const create_user = await dbcon.collection('users').insertOne({
    firstName,
    lastName,
    email,
    password,
    role

 },)
 if(!create_user) throw "User not registered"
 return {id:create_user.insertedId,firstName:firstName,lastName:lastName,email:email,role:role};

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

 const dbcon = await dbConnection()
 const user = await dbcon.collection('users').findOne({email});

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