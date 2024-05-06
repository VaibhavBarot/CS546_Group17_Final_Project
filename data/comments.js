import { bugs } from "../config/mongoCollections.js";
import { ObjectId, ReturnDocument, ServerApiVersion } from 'mongodb'
import moment from "moment"
import validation from '../validation.js'

export const createComment = async (
    bugId,
   updateObject_comment
    
) => {
    let {userId,content,files} = updateObject_comment
    let create_comment = {bugId:bugId, userId: new ObjectId(userId), content:content, files:files}
    let timestamp = moment().format("ddd MMM DD YYYY HH:mm:ss");
    create_comment.timestamp = timestamp;
    if(!bugId || !userId || !timestamp || !content) throw "All fields must be Supplied"
    validation.checkComment(create_comment,'Comment Created')
    const bugsCollection = await bugs()
    const bug_comment = await bugsCollection.findOne({_id: new ObjectId(bugId)});
    if(!bug_comment)
    {
        throw "Bug not found"
    }

    // const bugId = new ObjectId();
    const bug1 = {
      _id: bugId,
      timestamp: timestamp,
      content: content.trim(),
      userId: userId,
      files: files
    }

    await bugsCollection.updateOne(
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

    const bugsCollection = await bugs()
    const bug = await bugsCollection.findOne({_id: new ObjectId(bugId)})
    if(!bug)
    {
        throw "Project Not Found"
    }
    return bug.comments;
}

const getComment = async (commentId) => {
    validation.checkString(commentId, 'Comment')
    validation.checkId(commentId, 'Comment')
    const bugsCollection = await bugs()
    const bug_data = await bugsCollection.find({}).toArray()
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
    const bugsCollection = await bugs()
    const update_comm1 = await bugsCollection.findOne({'comments._id': commentId})
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
    
    
    const updatedDocument = await bugsCollection.findOneAndUpdate(
        { 'comments._id': commentId },
        { $set: { 'comments.$': update_comm1.comments[update_comm1_index] } },
        { returnDocument: 'after' }
    );

    return updatedDocument;
}

const removeComment = async (commentId) => {
    validation.checkString(commentId, 'Comment Id')
    validation.checkId(commentId, 'Comment Id')
    const bugsCollection = await bugs()
    const del_comment = await bugsCollection.findOneAndUpdate(
        { 'comments._id': commentId },
        { $pull: { comments: { _id: commentId } } }, 
        { returnDocument: 'after' } 
    );    if(!del_comment) throw "Comment Not Found"
    return del_comment
}

export default {createComment,getAllComments,getComment, updateComment, removeComment}