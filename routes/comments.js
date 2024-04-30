import { Router } from "express";
const router = Router();
import{commentsData} from '../data/index.js';
import { ObjectId } from "mongodb";
import moment from 'moment';
import validation from '../validation.js'
router
.route('/:bugId')
.post(async(req,res)=> {
    let bugId = req.params.bugId.trim()
    let {timestamp, content, userId, files} = req.body
    try{
        
        let create_comment1 = {bugId:bugId, userId:userId, timestamp:timestamp, content:content, files:files}
    if(!bugId || !userId || !timestamp || !content || !files) throw "All fields must be Supplied"
    validation.checkComment(create_comment1,'Comment Created')

        const create_comment = await commentsData.createComment(bugId,req.body)
        return res.json(create_comment)
    }
    catch(e)
    {
        return res.status(404).json({error:e})
    }
})


.get(async(req, res)=> {
    let bugId = req.params.bugId.trim()
    try{
    validation.checkString(bugId, 'Bug ID')
    validation.checkId(bugId, 'Bug ID')
    const bug_comments = await commentsData.getAllComments(bugId);
    return res.json(bug_comments)
    }
    catch(e)
    {
        return res.status(404).json({error: e});
    }

})

router
.route('/comments/:commentId')
.get(async(req,res)=>{
    let commentId = req.params.commentId.trim()
    try{
        validation.checkString(commentId, 'Comment')
    validation.checkId(commentId, 'Comment')
    const bug_comment = await commentsData.getComment(commentId)
    return res.json(bug_comment)
    }
    catch(e)
    {
        return res.status(404).json({error: e});
    }
})

.patch(async(req,res) => {
    let commentId = req.params.commentId.trim()
    let {timestamp, userId, content,files} = req.body
    try{
        let update_comment = {commentId:commentId, userId:userId, timestamp:timestamp, content:content, files:files}
        if(!commentId || !userId || !timestamp || !content || !files) throw "All fields must be supplied"
        // validation.checkComment(update_comment,'Comment Updated')
        validation.checkString(userId, 'UserId')
        validation.checkId(userId, 'UserId')
        validation.checkDate(timestamp,'timestamp')
        validation.checkString(content,'Content')
        validation.checkStringArray(files,'files')
        const update_comment1 = await commentsData.updateComment(commentId,req.body)
        return res.json(update_comment1)
    }
    catch(e)
    {
        return res.status(404).json({error: e});
    }
})

.delete(async(req,res) => {
    let commentId = req.params.commentId.trim()
    try
    {
        if(!commentId) throw "Invalid Comment Id"
        validation.checkString(commentId, 'CommentId')
        validation.checkId(commentId, 'CommentId')
        const del_comment1 = await commentsData.removeComment(commentId)
        return res.json(del_comment1)
    }
    catch(e)
    {
        return res.status(404).json({error: e})
    }
})

export default router
