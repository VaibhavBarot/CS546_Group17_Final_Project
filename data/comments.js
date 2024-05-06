import { bugs } from "../config/mongoCollections.js";
import { ObjectId, ReturnDocument, ServerApiVersion } from 'mongodb'
import moment from "moment"
import validation from '../validation.js'

export const createComment = async (
    bugId,
   updateObject_comment,
   role
    
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


export default {createComment,getAllComments,getComment}