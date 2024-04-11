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
  
    if(!title || !description || !creator || !status || !priority || !assignedTo || !members || !projectId || !estimatedTime || !createdAt)
    {
        throw "All fields must be supplied"
    }
    validation.checkString(title, 'Title');
    validation.checkString(description, 'Desription');
    validation.checkString(status, 'Status');
    validation.checkString(priority, 'Priority');
    validation.checkNumber(estimatedTime, 'Estimated Time');
    validation.checkId(creator, 'Creator');
    validation.checkId(assignedTo,'Assigned To');
    validation.checkId(projectId,'Project Id');
    validation.checkStringArray(members,'Members');
    validation.checkDate(createdAt,'Created At');

    
    
    //CreatedAt error handling

    // const date_format = now.format("ddd MMM DD YYYY HH:mm:ss GMTZ (ZZ)")
    // if(!moment(createdAt, date_format, true).isValid())
    // {
    //     throw "Invalid Date format. Use ddd MMM DD YYYY HH:mm:ss GMTZ (ZZ) "
    // }
    
    // const created_date1 = moment(createdAt, date_format)
    // const curr_date = moment();
    // if(created_date1.isAfter(curr_date))
    // {
    //     throw "Date must be current date or past date"
    // }
    

    
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

const getAll = async() => {
   
}

const getBug = async(projectId) => {   //getbug with project id or bug id ??

}

const update = async(
    bugId,
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
) => {
   //TODO: error Handling 
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
   if(result.modifiedCOunt === 0)
   {
    throw "Bug Not found"
   }
   const updated_bug = await dbcon.collection('bugs').findOne({_id: new ObjectId(bugId)})
   return updated_bug;
}


export default {createBug}
