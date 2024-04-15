import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { ObjectId, ServerApiVersion } from 'mongodb'
import moment from "moment"
import validation from '../validation.js'

const createComment = async (
    bugId,
   updateObject_comment
    
) => {
    let {userId, timestamp, content,files} = updateObject_comment
    let create_comment = {bugId:bugId, userId:userId, timestamp:timestamp, content:content, files:files}
    if(!bugId || !userId || !timestamp || !content || !files) throw "All fields must be Supplied"
    validation.checkComment(create_comment,'Comment Created')
    const dbcon = await dbConnection()
    // const files = []
    const bug_comment = await dbcon.collection('bugs').findOne({_id: new ObjectId(bugId)});
    if(!bug_comment)
    {
        throw "Bug not found"
    }

    // const bugId = new ObjectId();
    const bug1 = {
      _id: bugId,
      timestamp: moment().format("ddd MMM DD YYYY HH:mm:ss"),
      content: content.trim(),
      userId: userId,
      files: files
    }

    await dbcon.collection('bugs').updateOne(
        {
            _id: new ObjectId(bugId)
        },
        {
            $push:{comments: bug1}
        }
    )
    return bug1;
}

const get_all_comments = async (projectId) => {
    
}

export default {createComment}