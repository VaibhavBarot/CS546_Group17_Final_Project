import bcrypt from 'bcryptjs';
import validation from '../validation.js';
import {users} from '../config/mongoCollections.js'
import { dbConnection } from '../config/mongoConnection.js';
import {ObjectId, ReturnDocument} from 'mongodb';


export const registerUser = async(
    firstName,
    lastName,
    email,
    password,
    role
) =>{

    const dbcon = await dbConnection()
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
    role,
    firstLogin

 },)
 if(!create_user) throw "User not registered"
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

export const getUsers = async(members_id) =>{
    const dbcon = await dbConnection()

    const user_details_array = []
    for(let i = 0; i < members_id.length ; i++){
        const mem_id = members_id[i]
        const user_details = await dbcon.collection('users').findOne({_id:new ObjectId(mem_id)})
        user_details_array.push({firstName:user_details.firstName,
                                lastName:user_details.lastName,
                            email:user_details.email}
                            )
   
    }
    return user_details_array

}

export const updatePassword = async(email, oldPassword, newPassword) =>{
    const dbcon = await dbConnection()
    
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
    const user = await dbcon.collection('users').findOne({email: email.toLowerCase()})
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
    const result = await dbcon.collection('users').updateOne({email: email.toLowerCase()},{$set:{password: hashed_new_password,firstLogin:false}});
    if(result.modifiedCount === 0){
        throw "Password not updated"
    }
    return {'passwordUpdated':true}




}

export default{registerUser,loginUser,getUsers, updatePassword}