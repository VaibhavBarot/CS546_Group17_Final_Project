import { bugs } from "../config/mongoCollections.js";
import { ObjectId } from 'mongodb';
import moment from 'moment';
import validation from '../validation.js';
import {getUsers} from '../data/users.js'
import exportedHelpers from "../helpers.js";

const createBug = async (bug_obj) =>
{
    //TODO: validation Check for objectId for members
    // let create_object = {title:title, description:description, creator:creator, status:status, priority:priority, assignedTo:assignedTo, members:members, projectId:projectId, estimatedTime: estimatedTime, createdAt:createdAt}
    // if(!title || !description || !creator || !status || !priority || !assignedTo || !members || !projectId || !estimatedTime || !createdAt)
    // {
    //     throw "All fields must be supplied"
    // }
    // validation.checkBug(create_object,'Bug Created')  

    
    
    // const comments = []

    
    // const create_bug = await bugsCollection.insertOne({
    //     title,
    // description,
    // creator,
    // status,
    // priority,
    // assignedTo,
    // members,
    // projectId,
    // estimatedTime,
    // createdAt,
    // comments
    // })
    // if(!create_bug.insertedId){throw 'Error in creating bug'}
    // let memberDetails=getUsers(members)
    // for await (member of memberDetails){
    //     exportedHelpers.sendEmail(member.email,'Bug Created','A new bug is created, please check it out!!')
    // }

    // const insert_bugid = create_bug.insertedId

    // const create_bug2 = await(insert_bugid.toString())
    if(bug_obj.hasOwnProperty('role')){
    const bugsCollection = await bugs()
    let role = bug_obj.role

    let createdAt = new Date()
    bug_obj.creator = new ObjectId(bug_obj.creator)
    bug_obj.assignedManager = new ObjectId(bug_obj.assignedManager)
    bug_obj.createdAt = createdAt
    bug_obj.comments = []
    if(bug_obj.role === 'tester'){
        bug_obj.assignedTester = bug_obj.creator
    }
    if(bug_obj.role === 'manager'){
        bug_obj.assignedManager = bug_obj.creator
    }
    delete bug_obj.role
    const createdBug = await bugsCollection.insertOne(bug_obj)
    console.log("dsf ",createdBug)
    if (createdBug.insertedId){
        if(role === 'user'){
            let user = await getUser()
            if(user){
                exportedHelpers.sendEmail(user.email,'A user has created a new bug','A new bug has been created by the user please check it out!!')
            }

        
        }
        return createdBug

    }
    else{
        throw {status:500,msg:'Error in inserting to database'}
    }
}
else{
    throw {status:400,msg:'No role found for user'}
}

    // if(bug_obj.role === 'tester'){

    // }
    // if(bug_obj.role === 'manager'){}
    // if(bug_obj.role === 'user'){
        
    // }

    // return create_bug2;
}

const getAll = async(projectId) => {    
    const bugsCollection = await bugs()
   if(!projectId) throw "Invalid Project ID"
   validation.checkString(projectId,'Project ID')
   validation.checkId(projectId,'Project ID')
    const bugs = await bugsCollection.find({projectId:projectId}).toArray()
    return bugs;
    // const bugs = await dbcon.collection('')


}

export const getAllUserBugs = async(userId,role) => {    
    const bugsCollection = await bugs()
    console.log(userId,role)
    
    if(!userId) throw "Invalid Project ID"
    validation.checkString(userId,'Project ID')
    validation.checkId(userId,'Project ID')
    userId = new ObjectId(userId)
    if(role ==='tester'){
        const allBugs = await bugsCollection.find( {$or: [
            { assignedTester: userId },
            { creator: userId }
          ]}).toArray();
        return allBugs;

    }
    if(role ==='developer'){
        const allBugs = await bugsCollection.find({$or: [
            { assignedDeveloper: userId },
            { creator: userId }
          ]}).toArray();
        return allBugs;

    }
    if(role ==='manager'){
        const allBugs = await bugsCollection.find({$or: [
            { assignedManager: userId },
            { creator: userId }
          ]}).toArray();
          console.log("sdad ",allBugs)
        return allBugs;

    }
    if(role ==='user'){
        const allBugs = await bugsCollection.find({creator:userId}).toArray();
        return allBugs;

    }
     
 
 }

const getBug = async(bugId) => {   
    const bugsCollection = await bugs()
    if(!bugId) throw "Invalid bug Id"
    validation.checkString(bugId,'BugId')
    validation.checkId(bugId, 'BugId')
    const get_bug = await bugsCollection.findOne({_id : new ObjectId(bugId)})
    return get_bug

}

const updateBug = async(
    bugId,
    updateObject
) => {
   //TODO: error Handling 
//    let {title, description,creator,status,priority,assignedTo,members,projectId,estimatedTime,createdAt} = updateObject;

//    if(!title || !description || !creator || !status || !priority || !assignedTo || !members || !projectId || !estimatedTime || !createdAt)
//    {
//        throw "All fields must be supplied"
//    }
//    validation.checkBug(updateObject, 'Updated Object')
//    const bugsCollection = await bugs()
//    const result = await bugsCollection.updateOne({_id: new ObjectId(bugId)},
//    {
//     $set:{
//         title,
//         description,
//         creator,
//         status,
//         priority,
//         assignedTo,
//         members,
//         projectId,
//         estimatedTime,
//         createdAt
//     }
//    }, {returnDocument: 'after'},
//    );


//    if(result.modifiedCount === 0)
//    {
//     throw "Bug Not found"
//    }
//    const updated_bug = await bugsCollection.findOne({_id: new ObjectId(bugId)})
//    return updated_bug;

const bugsCollection = await bugs()
const bug = bugsCollection.updateOne({_id:new ObjectId(bugId)},{$set:{updateObject}})
return bug
}


const deleteBug = async(bugId) =>{
    //error handling
    validation.checkId(bugId,'BugId')
    const bugsCollection = await bugs()
    const delete_bug = await getBug(bugId)
    const delete_bug1 = await bugsCollection.deleteOne({_id:new ObjectId(bugId)});
    if(delete_bug1.deletedCount === 0)
    {
        throw "Bug not deleted"
    }

    return {_id:delete_bug._id, deleted:true}
}

export default {createBug, getAll, getBug, updateBug, deleteBug, getAllUserBugs}
