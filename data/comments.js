import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { ObjectId, ReturnDocument, ServerApiVersion } from 'mongodb'
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

const getAllComments = async (bugId) => {
    validation.checkString(bugId, 'Bug ID')
    validation.checkId(bugId, 'Bug ID')

    const dbcon = await dbConnection();
    const bug = await dbcon.collection('bugs').findOne({_id: new ObjectId(bugId)})
    if(!bug)
    {
        throw "Project Not Found"
    }
    return bug.comments;
}

const getComment = async (commentId) => {
    validation.checkString(commentId, 'Comment')
    validation.checkId(commentId, 'Comment')
    const dbcon = await dbConnection();
    const bug_data = await dbcon.collection('bugs').find({}).toArray()
    let comment;
    for(const bug1  of bug_data)
    {
        comment = bug1.comments.find(comm1 => comm1._id.toString() === commentId)
        break;  
    }
    if(!comment)
    {
        throw "Comment does not exist"
    }
    return comment;
}

const updateComment = async (commentId, updateObject) =>{
    let {userId, timestamp, content,files} = updateObject
    let update_comment = {commentId:commentId, userId:userId, timestamp:timestamp, content:content, files:files}
    if(!commentId || !userId || !timestamp || !content || !files) throw "All fields must be Supplied"
    // validation.checkComment(update_comment,'Comment Updated')
    validation.checkString(userId, 'UserId')
    validation.checkId(userId, 'UserId')
    validation.checkDate(timestamp,'timestamp')
    validation.checkString(content,'Content')
    validation.checkStringArray(files,'files')
    const dbcon = await dbConnection()
    const update_comm1 = await dbcon.collection('bugs').findOne({'comments._id': commentId})
    if(!update_comm1)
    {
        throw "Comment not found"
    }
    const update_comm1_index = update_comm1.comments.findIndex(comments => comments._id.toString() === commentId)
    if(update_comm1_index === -1)
    {
        throw "Comment not found"
    } 
    
    if (updateObject.content) update_comm1.comments[update_comm1_index].content = updateObject.content;
    if (updateObject.files) update_comm1.comments[update_comm1_index].files = updateObject.files;
    if (updateObject.timestamp) update_comm1.comments[update_comm1_index].timestamp = updateObject.timestamp;
    
    
    const updatedDocument = await dbcon.collection('bugs').findOneAndUpdate(
        { 'comments._id': commentId },
        { $set: { 'comments.$': update_comm1.comments[update_comm1_index] } },
        { returnDocument: 'after' }
    );

    return updatedDocument;
}

const removeComment = async (commentId) => {
    validation.checkString(commentId, 'Comment Id')
    validation.checkId(commentId, 'Comment Id')
    const dbcon = await dbConnection();
    const del_comment = await dbcon.collection('bugs').findOneAndUpdate(
        { 'comments._id': commentId },
        { $pull: { comments: { _id: commentId } } }, 
        { returnDocument: 'after' } 
    );    if(!del_comment) throw "Comment Not Found"
    return del_comment
}

export default {createComment,getAllComments,getComment, updateComment, removeComment}