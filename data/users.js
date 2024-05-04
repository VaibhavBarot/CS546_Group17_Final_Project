import bcrypt from 'bcryptjs';
import validation from '../validation.js';
import {users} from '../config/mongoCollections.js'
import {ObjectId} from 'mongodb';


export const registerUser = async(
    firstName,
    lastName,
    email,
    password,
    role
) =>{

    const usersCollection = await users()
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

export const getUsers = async(members_id) =>{
    const usersCollection = await users()

    const user_details_array = []
    for(let i = 0; i < members_id.length ; i++){
        const mem_id = members_id[i]
        const user_details = await usersCollection.findOne({_id:new ObjectId(mem_id)})
        user_details_array.push({firstName:user_details.firstName,
                                lastName:user_details.lastName,
                            email:user_details.email}
                            )
   
    }
    return user_details_array

}

export default{registerUser,loginUser,getUsers}