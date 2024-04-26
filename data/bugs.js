import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { ObjectId } from 'mongodb';
import moment from 'moment';
import validation from '../validation.js';

const createBug = async (
    title,
    description,
    creator,
    status,
    priority,
    assignedTo,
    members,
    projectId,
    estimatedTime,
    createdAt

) =>
{
    //TODO: validation Check for objectId for members
    let create_object = {title:title, description:description, creator:creator, status:status, priority:priority, assignedTo:assignedTo, members:members, projectId:projectId, estimatedTime: estimatedTime, createdAt:createdAt}
    if(!title || !description || !creator || !status || !priority || !assignedTo || !members || !projectId || !estimatedTime || !createdAt)
    {
        throw "All fields must be supplied"
    }
    validation.checkBug(create_object,'Bug Created')  

    
    const dbcon = await dbConnection()
    const comments = []

    
    const create_bug = await dbcon.collection('bugs').insertOne({
        title,
    description,
    creator,
    status,
    priority,
    assignedTo,
    members,
    projectId,
    estimatedTime,
    createdAt,
    comments
    })

    const insert_bugid = create_bug.insertedId
    const create_bug2 = await(insert_bugid.toString())

    return create_bug2;
}

const getAll = async(projectId) => {    
   const dbcon = await dbConnection();
   if(!projectId) throw "Invalid Project ID"
   validation.checkString(projectId,'Project ID')
   validation.checkId(projectId,'Project ID')
    const bugs = await dbcon.collection('bugs').find({projectId:projectId}).toArray()
    return bugs;
    // const bugs = await dbcon.collection('')


}

export const getAllUserBugs = async(userId) => {    
    const dbcon = await dbConnection();
    if(!userId) throw "Invalid Project ID"
    validation.checkString(userId,'Project ID')
    validation.checkId(userId,'Project ID')
     const bugs = await dbcon.collection('bugs').find({members:userId}).toArray();
     return bugs;
     // const bugs = await dbcon.collection('')
 
 
 }

const getBug = async(bugId) => {   
    const dbcon = await dbConnection();
    if(!bugId) throw "Invalid bug Id"
    validation.checkString(bugId,'BugId')
    validation.checkId(bugId, 'BugId')
    const get_bug = await dbcon.collection('bugs').findOne({_id : new ObjectId(bugId)})
    return get_bug

}

const updateBug = async(
    bugId,
    updateObject
) => {
   //TODO: error Handling 
   let {title, description,creator,status,priority,assignedTo,members,projectId,estimatedTime,createdAt} = updateObject;

   if(!title || !description || !creator || !status || !priority || !assignedTo || !members || !projectId || !estimatedTime || !createdAt)
   {
       throw "All fields must be supplied"
   }
   validation.checkBug(updateObject, 'Updated Object')
   const dbcon = await dbConnection();
   const result = await dbcon.collection('bugs').updateOne({_id: new ObjectId(bugId)},
   {
    $set:{
        title,
        description,
        creator,
        status,
        priority,
        assignedTo,
        members,
        projectId,
        estimatedTime,
        createdAt
    }
   }, {returnDocument: 'after'},
   );
   if(result.modifiedCount === 0)
   {
    throw "Bug Not found"
   }
   const updated_bug = await dbcon.collection('bugs').findOne({_id: new ObjectId(bugId)})
   return updated_bug;
}


const deleteBug = async(bugId) =>{
    //error handling
    validation.checkId(bugId,'BugId')
    const dbcon = await dbConnection()
    const delete_bug = await getBug(bugId, dbcon)
    const delete_bug1 = await dbcon.collection('bugs').deleteOne({_id:new ObjectId(bugId)});
    if(delete_bug1.deletedCount === 0)
    {
        throw "Bug not deleted"
    }

    return {_id:delete_bug._id, deleted:true}
}

// const bugTransfer = async(bugId) =>{
//     validation.checkId(bugId,'BugId')
//     const dbcon = await dbConnection()
//     const bug_transfer = await dbcon.collection('bugs').findOne({_id: new ObjectId(bugId)})
//     if(!bug)
//     {
//         throw "bug not found "
//     }
//     if (!bug.members || bug.members.length === 0) {
//         throw "No members found for this bug";
//     }
// }

// const assignNewDeveloper = async(bugId) =>{
//     validation.checkId(bugId,'BugId')
//     const dbcon = await dbConnection()
//     const bug = await dbcon.collection('bugs').findOne({_id: new ObjectId(bugId)})
//     if(!bug) {throw "Bug not found"}
//     const users = await dbcon.collection('users').find({role: 'developer'}).toArray()
//     if(!users || users.length===0)
//     {
//         throw "No Developers found"
//     }
//     const dev_id = [];
//     for(let i = 0; i<users.length;i++)
//     {
//         dev_id.push(users[i]._id)
//     }
//     const result = await dbcon.collection('bugs').updateOne(
//         {_id: new ObjectId(bugId)},
//         { $addToSet: { members: { $each: dev_id } } }
        
//     );
//     return {success: true,message:"New Developer added"}

// }

// const assignNewTester = async(bugId) =>{
//     validation.checkId(bugId,'BugId')
//     const dbcon = await dbConnection()
//     const bug = await dbcon.collection('bugs').findOne({_id: new ObjectId(bugId)})
//     if(!bug) {throw "Bug not found"}
//     const users = await dbcon.collection('users').find({role: 'tester'}).toArray()
//     if(!users || users.length===0)
//     {
//         throw "No Tester found"
//     }
//     const tester_id = [];
//     for(let i = 0; i<users.length;i++)
//     {
//         tester_id.push(users[i]._id)
//     }
//     const result = await dbcon.collection('bugs').updateOne(
//         {_id: new ObjectId(bugId)},
//         { $addToSet: { members: { $each: tester_id } } }
        
//     );
//     return {success: true,message:"New tester added"}
// }

export default {createBug, getAll, getBug, updateBug, deleteBug, getAllUserBugs}
