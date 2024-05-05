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
   projectId = new ObjectId(projectId)
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

const sortBugs= (order,bugsArray) =>{
    const HighToLowpriorityOrder = { "High": 1, "Medium": 2, "Low": 3 }
    const LowToHighpriorityOrder = {  "Low": 1, "Medium": 2, "High": 3 }
    if (order === 'H2L'){
        bugsArray.sort((bug1, bug2) => {
            return HighToLowpriorityOrder[bug1.priority] - HighToLowpriorityOrder[bug2.priority];
          });
    }
    if (order === 'L2H'){
        bugsArray.sort((bug1, bug2) => {
            return LowToHighpriorityOrder[bug1.priority] - LowToHighpriorityOrder[bug2.priority];
          });

    }


}

const filterBugs = async(filterParams,projectId) =>{
    let result = []
    const dbCon = await dbConnection()
    const bugsCollection = await dbCon.collection('bugs')
    validation.checkId(projectId,'projectId')
    projectId = new ObjectId(projectId)

    if (filterParams === null || typeof filterParams !== 'object'){throw 'Invalid paramters'}

    if(Object.keys(filterParams).length == 1 && filterParams.hasOwnProperty('sortBugs')){
        let bugs = await getAll(projectId)
        if (filterParams['sortBugs'] === 'H2L'){sortBugs('H2L',bugs)}
        else if (filterParams['sortBugs'] === 'L2H'){sortBugs('L2H',bugs)}
        else{throw 'Invalid sorting type'}
        return bugs
    }
    if(filterParams.hasOwnProperty(['filterStatus']) && filterParams.hasOwnProperty(['filterPriority'])){
        filterParams['filterStatus'] = validation.checkStringArray(filterParams['filterStatus'],'Filter status')
        filterParams['filterPriority'] = validation.checkStringArray(filterParams['filterPriority'],'Filter Priority')
        filterParams['filterStatus'].forEach(element => { validation.checkStatus(element)})
        filterParams['filterPriority'].forEach(element => { validation.checkPriority(element)})
        result = await bugsCollection.find({priority:{$in:filterParams['filterPriority']},status:{$in:filterParams['filterStatus']},projectId:projectId}).toArray()
    }
    
    else if (filterParams.hasOwnProperty(['filterStatus'])){
        filterParams['filterStatus'] = validation.checkStringArray(filterParams['filterStatus'],'Filter status')
        filterParams['filterStatus'].forEach(element => { validation.checkStatus(element)})

            result = await bugsCollection.find({ status: { $in: filterParams['filterStatus'] },projectId:projectId }).toArray()          
        
    }
    else if (filterParams.hasOwnProperty(['filterPriority'])){
        filterParams['filterPriority'] = validation.checkStringArray(filterParams['filterPriority'],'Filter Priority')
        filterParams['filterPriority'].forEach(element => { validation.checkStatus(element)})
        
            result = await bugsCollection.find({priority:{$in:filterParams['filterPriority']},projectId:projectId}).toArray()
                
    }

    if (filterParams.hasOwnProperty(['sortBugs'])){
        if (filterParams['sortBugs'] === 'H2L'){sortBugs('H2L',result)}
        else if (filterParams['sortBugs'] === 'L2H'){sortBugs('L2H',result)}
        else{throw 'Invalid sort type'}

        }


    return result



}

const search =async(searchInput)=>{
    const query = { $text: { $search: `\"${searchInput}\"` } };
    const dbCon = await dbConnection()
    const bugsCollection = await dbCon.collection('bugs')
    const searchResult = await bugsCollection.find(query).toArray()
    return searchResult
}

const bugsSummary = async (projectId) =>{
    let result = {
        total_bugs: 0,
        status:{

        'To Do':0,
        'In Progress': 0,
        'Completed':0,
        'In Review':0,
        'Tesing':0
        },
        priority:{
            'High':0,
            'Medium':0,
            'Low':0
        }
    }
    const bugs = await getAll(projectId)
    result['total_bugs'] = bugs.length
    for (let bug of bugs){
        result['status'][bug['status']] +=1
        result['priority'][bug['priority']] +=1
    }

    return result


}

// console.log(await bugsSummary('6633d3dc2380ed6a4e0a963d'))
// console.log(await filterBugs({'filterStatus':['To Do'],'filterPriority':['High'],'sortBugs':'L2H'},'6633d3dc2380ed6a4e0a963e'))
// console.log(await search('search'))
export default {createBug, getAll, getBug, updateBug, deleteBug, getAllUserBugs,filterBugs,search}
