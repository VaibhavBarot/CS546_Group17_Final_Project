import { bugs } from "../config/mongoCollections.js";
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

    
    const bugsCollection = await bugs()
    const comments = []

    
    const create_bug = await bugsCollection.insertOne({
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
    const bugsCollection = await bugs()
   if(!projectId) throw "Invalid Project ID"
   validation.checkString(projectId,'Project ID')
   validation.checkId(projectId,'Project ID')
    const bugs = await bugsCollection.find({projectId:projectId}).toArray()
    return bugs;
    // const bugs = await dbcon.collection('')


}

export const getAllUserBugs = async(userId) => {    
    const bugsCollection = await bugs()
    if(!userId) throw "Invalid Project ID"
    validation.checkString(userId,'Project ID')
    validation.checkId(userId,'Project ID')
     const allBugs = await bugsCollection.find({members:new ObjectId(userId)}).toArray();
     return allBugs; 
 
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
   let {title, description,creator,status,priority,assignedTo,members,projectId,estimatedTime,createdAt} = updateObject;

   if(!title || !description || !creator || !status || !priority || !assignedTo || !members || !projectId || !estimatedTime || !createdAt)
   {
       throw "All fields must be supplied"
   }
   validation.checkBug(updateObject, 'Updated Object')
   const bugsCollection = await bugs()
   const result = await bugsCollection.updateOne({_id: new ObjectId(bugId)},
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
   const updated_bug = await bugsCollection.findOne({_id: new ObjectId(bugId)})
   return updated_bug;
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
