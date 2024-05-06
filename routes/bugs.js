import {Router} from 'express';
import validation from '../validation.js';
import { bugData, userData } from '../data/index.js';
import { getAllUserBugs } from '../data/bugs.js';
import xss from 'xss';
import { projectData } from '../data/index.js';
import { getAllUsers, getUsers } from '../data/users.js';
import { getProject } from '../data/projects.js';
import fs from 'fs';
import multer from 'multer'
import { createComment } from '../data/comments.js';
import exportedHelpers from "../helpers.js";
import { addMember } from '../data/projects.js';
import * as path from 'path'
import { error } from 'console';


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router({mergeParams:true});

router
.route('/bugs')
.get(async (req,res) => {
    let bugs = await getAllUserBugs(req.session.user._id,req.session.user.role);
    bugs = bugs.filter((bug) => bug.projectId.toString() === req.params.projectId)
    bugs.forEach(bug => {
        bug.priority = exportedHelpers.getPriority(bug.priority)
        bug.status = exportedHelpers.getStatus(bug.status)
    });
    
    
    return res.render('bugPage',{role:req.session.user.role,bugs:bugs,roles:['developer','tester','manager']})
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
.route('/summary')
.get(async (req,res) => {
    const summary = await bugData.bugsSummary(req.params.projectId);
    res.render('chart', {summary:summary});
})

router
.route('/bugs/filter')
.post(async (req,res) => {
    const {filterStatus,filterPriority,search,toSort} = req.body;
    const bugs = await bugData.filterBugs(req.body,req.session.user._id,req.session.user.role);
   return res.json(bugs);
})

router
.route('/bugs/createbug')
.get(async (req,res) => {
    const project = await projectData.getProject(req.params.projectId);
    let members_array = []
    for await (let members of project.members){
        let member = await getUsers(members)
        members_array.push(member)
    }

    return res.render('createbug', {members:members_array});
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
        creator: req.session.user._id,
        projectId:projectId
        
    }
    const bug= await bugData.createBug(bug_obj)
    return res.redirect('/dashboard')
    
    // return res.redirect('/bugs')
}
})

router
.route('/bugs/:bugId/updatebug').post(async(req,res)=>{
    try{
    if(req.session.user.role){
        const role = req.session.user.role;
        if(role === 'user'){
            let {title,description} = req.body
            title = validation.checkString(title,'title')
            description = validation.checkString(description,'description')
            var update_obj = {title,description} 
            
        }
        if(role === 'manager'){
            let {title,description,priority,status,assignedDeveloper,assignedTester} = req.body
            title = validation.checkString(title,'title')
            description = validation.checkString(description,'description')
            priority = validation.checkBug(priority,'priority')
            status = validation.checkBug(status,'status')
            assignedDeveloper = validation.checkBug(assignedDeveloper,'Developer')
            assignedTester = validation.checkBug(assignedTester,'Tester')
            // estimatedTime =

            var update_obj = {title,description,priority,status,assignedDeveloper,assignedTester} 
            
        }
        if(role === 'tester' || role === 'developer'){
            let {title,description,priority,status} = req.body
            title = validation.checkString(title,'title')
            description = validation.checkString(description,'description')
            priority = validation.checkBug(priority,'priority')
            status = validation.checkBug(status,'status')

            var update_obj = {title,description,priority,status} 
            
        }
        let bugid = req.params.bugId
        const updated_bug = bugData.updateBug(bugid,update_obj)
        res.redirect('../' + req.params.bugId)

    }
    else{return res.status(400).json({error:'No role found for the user'})}
}
catch(e){
    res.status(400).render('')
}



})

router.route('/bugs/filter')
.post(async (req,res) => {
    const response = await bugData.filterBugs(req.body,req.session.user._id,req.session.user.role);
    return res.json(response);
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

        const {members} = await getProject(req.params.projectId);
        const developers = [], testers = []

        for await (let member of members){
            const mem = await getUsers(member);
            if(mem.role === 'manager') get_bug1.assignedManager = mem;
            else if(mem.role === 'tester') testers.push(mem);
            else if(mem.role === 'developer') developers.push(mem);
        }

        if(get_bug1.creator) (get_bug1.creator) =  await  getUsers(get_bug1.creator)

        for await (let comment of get_bug1.comments){
            comment.userId = await getUsers(comment.userId)
        }

        get_bug1.testers = testers;
        get_bug1.developers = developers;
        get_bug1.roles = ['manager','tester','developer']
        return res.render('bugdetails',get_bug1)
    }
    catch(e)
    {
        return res.status(404).json({error :e})
    }
})

.post(async(req, res) => {
    let bugId = req.params.bugId.trim()
    let updateObject = req.body
    let {title, description,creator,status,priority,assignedTo,members,projectId,estimatedTime,createdAt} = req.body
    try{
   validation.checkBug(updateObject, 'Updated Bug')
   const update_bug = await bugData.updateBug(bugId, updateObject)
   return res.redirect('./')
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
.route('/bugs/:bugId/addcomment')
.post(upload.single('fileupload'),async (req,res) => {
    try{
    if (req.file) {
        console.log(req.file.originalname)
        req.body.file = req.file.originalname
        const fileBuffer = req.file.buffer;
        const filePath = `public/uploads/${req.session.user.email}/${req.params.bugId}/${req.file.originalname}`;
        req.body.files = filePath
        const allowedExtensions = ['.jpg', '.jpeg', '.png']
    const extname = path.extname(req.file.originalname).toLowerCase();
    console.log(extname)
    if(!allowedExtensions.includes(extname)){
        console.log("Innnn")
        throw 'Unacceptable extension, Accepts only Png, Jpeg, txt and Pdf'
    }

        fs.mkdirSync(`public/uploads/${req.session.user.email}/${req.params.bugId}/`, {recursive:true});
        fs.writeFileSync(filePath, fileBuffer);
      }

    req.body.userId = req.session.user._id
    await createComment(req.params.bugId,req.body,req.session.user.role)

    

    res.redirect('../' + req.params.bugId)
}
catch(e){
    res.redirect(500,'../'+ req.params.bugId)
}
  
})

router.route('/addmember')
.get(async(req,res) => {
    const users = await getAllUsers();
    return res.render('addmember', {members:users});
})
.post(async (req,res) =>{
    try{
        const email = req.body.email;
        await addMember(req.params.projectId, email)
        return res.redirect('/dashboard')
    } catch(e){
        res.status(404).render('addmember',{error:true,msg:e})
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