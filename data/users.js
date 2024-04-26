import bcrypt from 'bcryptjs';
import validation from '../validation.js';
import {users} from '../config/mongoCollections.js'
import { dbConnection } from '../config/mongoConnection.js';

export const registerUser = async(
    firstName,
    lastName,
    username,
    email,
    password,
    role
) =>{
    const dbcon = await dbConnection()
//   if(!firstName || !lastName || !username || !email || !password) throw "All fields must be supplied"
const fields = [
    { value: firstName, name: 'First name' },
    { value: lastName, name: 'Last name' },
    { value: username, name: 'Username' },
    { value: email, name: 'Email' },
    { value: password, name: 'Password' }
];

for (const field of fields) {
    if (!field.value) {
        throw (field.name + ' cannot be empty');
    }
}

  firstName = validation.checkString(firstName,'First Name')
   validation.checkName(firstName, 'First Name')
 lastName = validation.checkString(lastName,'Last Name')
  validation.checkName(lastName,'Last Name')

username = username.toLowerCase()
 username = validation.checkString(username,'Username')
 validation.checkUserName(username,'User Name') 

 const user = await dbcon.collection('users').findOne({username});

 if(user)
 {
  throw "User name already exists";
 }

 password = validation.checkString(password,'Password')
 validation.checkPassword(password,'Password')

 const hashed_password = await bcrypt.hash(password, 10)
 password = hashed_password

 const create_user = await dbcon.collection('users').insertOne({
    firstName,
    lastName,
    username,
    email,
    password

 })
 if(!create_user) throw "User not registered"
 return { signupCompleted: true };

}

export const loginUser = async(username, password)=>{
    username = username.toLowerCase()
 username = validation.checkString(username,'Username')
 validation.checkUserName(username,'User Name') 

 password = validation.checkString(password,'Password')
 validation.checkPassword(password,'Password')

 const dbcon = await dbConnection()
 const user = await dbcon.collection('users').findOne({username});

 if(!user)
 {
  throw "Either the username or password is invalid";
 }
 const password_match = await bcrypt.compare(password, user.password)
 if(password_match){
    return user
}
else{
    throw "Either the username or password is invalid"
}
}