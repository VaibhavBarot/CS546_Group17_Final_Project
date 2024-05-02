import {Router} from 'express';
import { ObjectId } from 'mongodb';
import moment from "moment";
const router = Router({mergeParams:true});
import validation from '../validation.js';
import { bugData } from '../data/index.js';
import { getAllUserBugs } from '../data/bugs.js';

router
.route('/bugs')
.get(async (req,res) => {
    const bugs = await getAllUserBugs(req.session.user._id);
    return res.render('bugPage',{role:req.session.user.role,bugs:bugs})
})
.post(async(req, res) =>{
    let{
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
    } = req.body

    try{
        if(!title || !description || !creator || !status || !priority || !assignedTo || !members || !projectId || !estimatedTime || !createdAt)
    {
        throw "All fields must be supplied"
    }
  
    validation.checkBug(req.body, 'Bug Created')

    }
    catch(e)
    {
        return res.status(400).json({error: e});
    }

    try{
        const bug_data = await bugData.createBug(title,
            description,
            creator,
            status,
            priority,
            assignedTo,
            members,
            projectId,
            estimatedTime,
            createdAt);
            return res.json(bug_data);
    }
    catch(e)
    {
        return res.status(500).json({error: e})
    }
}
)

router
.route('/bugs/createbug')
.get(async (req,res) => {
    return res.render('createbug');
})

router
.route('/bugs/:bugId')
.get(async(req,res) => {
    let bugId = req.params.bugId.trim()
    try{
        if(!bugId) throw "Invalid bug Id"
        validation.checkString(bugId,'BugId')
        validation.checkId(bugId, 'BugId')
        const get_bug1 = await bugData.getBug(bugId)
        return res.json(get_bug1)
    }
    catch(e)
    {
        return res.status(404).json({error :e})
    }
})

.patch(async(req, res) => {
    let bugId = req.params.bugId.trim()
    let updateObject = req.body
    let {title, description,creator,status,priority,assignedTo,members,projectId,estimatedTime,createdAt} = req.body
    try{
//         if(!title || !description || !creator || !status || !priority || !assignedTo || !members || !projectId || !estimatedTime || !createdAt)
//    {
//        throw "All fields must be supplied"
//    }   
   validation.checkBug(updateObject, 'Updated Bug')
   const update_bug = await bugData.updateBug(bugId, updateObject)
   return res.json(update_bug)
    }
    catch(e)
    {
        return res.status(404).json({error: e})
    }
})

.delete(async(req,res)=>{
    let bugId = req.params.bugId.trim()
    try{
        if(!bugId) throw "Invalid bug ID"
        validation.checkString(bugId,'Project ID')
        validation.checkId(bugId,'Project ID')
        const del_bug = await bugData.deleteBug(bugId)
        return res.json(del_bug)
    }
    catch(e)
    {
        return res.status(404).json(e)
    }
})

router
    .route('/:projectId')
    .get(async(req, res) => {
        let projectId = req.params.projectId.trim()
            try{
                if(!projectId) throw "Invalid Project ID"
                validation.checkString(projectId,'Project ID')
                validation.checkId(projectId,'Project ID')

                const get_bugs = await bugData.getAll(projectId)
                return res.json(get_bugs)
            }
           
        catch(e)
        {
            return res.status(404).json({error :e})
        }
})


    

export default router;