import {Router} from 'express';
import { ObjectId } from 'mongodb';
import moment from "moment";
import validation from '../validation.js';
import { bugData, userData } from '../data/index.js';
import { getAllUserBugs } from '../data/bugs.js';
import xss from 'xss';
import { projectData } from '../data/index.js';
import { getUsers } from '../data/users.js';
import { getProject } from '../data/projects.js';

const router = Router({mergeParams:true});

router
.route('/bugs')
.get(async (req,res) => {
    const bugs = await getAllUserBugs(req.session.user._id,req.session.user.role);
    return res.render('bugPage',{role:req.session.user.role,bugs:bugs})
})
.post(async(req, res) =>{
    // let{
    // title,
    // description,
    // creator,
    // status,
    // priority,
    // assignedTo,
    // members,
    // projectId,
    // estimatedTime,
    // createdAt,
    // } = req.body
    let title=xss(req.body.title);
    let description=xss(req.body.description);
    let creator=xss(req.body.creator);
    let status=xss(req.body.status);
    let priority=xss(req.body.priority);
    let assignedTo=xss(req.body.assignedTo);
    let members=xss(req.body.members);
    let projectId=xss(req.body.projectId);
    let estimatedTime=xss(req.body.estimatedTime);
    let createdAt=xss(req.body.createdAt);
    try{
        if(!title || !description || !creator || !status || !priority || !assignedTo || !members || !projectId || !createdAt)
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
    const project = await projectData.getProject(req.params.projectId);
    project.members = await getUsers(project.members);
    return res.render('createbug', {members:project.members});
})
.post(async (req,res) => {
    const {title, description} = req.body
    const projectId = req.params.projectId
    if (req.session.user){
        if(req.session.user.role === 'user'){
            let project = await getProject(projectId)
            var assignedManager = project.manager

        }
    else if(req.session.user.role === 'tester'){
        var {priority,status,assignedDeveloper} = req.body
        let project = await getProject(projectId)
            var assignedManager = project.manager
        // var bug_obj ={
        //     title:title,
        //     description:description,
        //     priority:priority,
        //     status:status,
        //     assignedDeveloper:assignedDeveloper,
        //     role:req.session.user.role,
        //     creator: req.session.user._id
        // }
        
    }
   
    else if(req.session.user.role === 'manager'){
        var {priority,status,assignedDeveloper,assignedTester} = req.body
        var assignedManager = req.session.user._id
        
    }
    let bug_obj ={
        title:title,
        description:description,
        priority:priority || 'Not Assigned',
        status:status || 'Not Assigned',
        assignedDeveloper:assignedDeveloper || 'Not Assigned',
        assignedTester:assignedTester || 'Not Assigned',
        assignedManager:assignedManager,
        role:req.session.user.role,
        creator: req.session.user._id
        
    }
    const bug= await bugData.createBug(bug_obj)
    return res.redirect('/dashboard')
    
    // return res.redirect('/bugs')
}
})

router
.route('/bugs/updatebug').post(async(req,res)=>{
    if(req.session.user.role){
        if(role === 'user'){
            let {title,description} = req.body
            var update_obj = {title,description} 
            
        }
        if(role === 'manager'){
            let {title,description,priority,status,assignedDeveloper,assignedTester} = req.body
            var update_obj = {title,description,priority,status,assignedDeveloper,assignedTester} 
            
        }
        if(role === 'tester' || role === 'developer'){
            let {title,description,priority,status} = req.body
            var update_obj = {title,description,priority,status} 
            
        }
        let bugid = req.params.bugId
        const updated_bug = bugData.updateBug(bugid,update_obj)
        return res.json(updated_bug)

    }
    else{return res.status(400).json({error:'No role found for the user'})}



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
        const get_users = await userData.getUsers(get_bug1.members)
        if(get_bug1.assignedTo){
            const get_assigned_user = await userData.getUsers([get_bug1.assignedTo])
            get_bug1.assignedTo = get_assigned_user[0]
        }
        const get_creator = await userData.getUsers([get_bug1.creator])
        get_bug1.members = get_users

        get_bug1.creator = get_creator[0]
        return res.render('bugdetails',get_bug1)
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