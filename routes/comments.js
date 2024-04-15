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






export default router
