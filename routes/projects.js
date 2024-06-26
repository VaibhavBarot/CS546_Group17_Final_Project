import {Router} from 'express';
import {projectData} from "../data/index.js";
import validation from '../validation.js';
import { ObjectId } from 'mongodb';
import { searchProjects } from '../data/projects.js';
const router = Router({ mergeParams: true });

router
.route('/')
.get(async (req, res) =>{
    try{
    let result= await projectData.getAllProjects();
    if(!result){
        return res.status(401).json({error: "Error in retrieving projects"});
    }
    res.status(200).json(result);
    }catch(e){return res.status(404).json({error: e})}; 
})

router
.route("/:projectId")
    .get(async(req,res)=> {
        const id = req.params.projectId.trim();
        if(!id || !ObjectId.isValid(id)) {return res.status(400).json('No Id or Invalid Id provided');}
        try{
            let result= await projectData.getProject(id);
            return  res.status(200).json(result);
        }catch(e){return res.status(404).json({error:e.toString()});}
    })
    .delete(async(req,res)=> {
        const id = req.params.projectId.trim();
        if(!id || !ObjectId.isValid(id)) {return res.status(400).json('No Id or Invalid Id provided');}
        try{
            await projectData.deleteProject(id);
            return res.status(200).json("Deleted Successfully!");
        }catch(e){return res.status(404).json({error:e.toString()});}
    })
    .patch(async(req,res)=>{
        if(!ObjectId.isValid(req.params.projectId))
    {
      return res.status(400).json('Invalid id');
    }
    const{name,description,creator,members}=req.body;
    if(!name &&! description && !creator && !members ){
      return res.status(400).json("Enter atleast one field for patch")
    }
    // if(!validation.validateMembers(members,"Members")){return res.status(400).json("Enter atleast one member")}
    try{
      let ans=await projectData.updateProject(req.params.projectId,req.body);
    //   console.log(ans);
      return res.status(200).json(ans);
    }catch(e){return res.status(404).json({error: e.toString()});};
    })
    
router
.route('/addMember')
.post(async(req,res)=>{
    const memberEmail=req.body.memberEmail;
    const projectId=req.body.projectId;
    // if(!projectId||!memberId||!ObjectId.isValid(projectId)||!ObjectId.isValid(memberId)){return res.status(400).json('No Id or Invalid Id provided');}
    try{
        let data=await projectData.addMember(projectId,memberEmail);
        return res.status(200).json(data);
    }catch(e){
        return res.status(400).json({error: e.toString()});
    }
})
.delete(async(req,res)=>{
    const memberEmail=req.body.memberEmail;
    const projectId=req.body.projectId;
    // if(!projectId||!memberId){return res.status(400).json('No Id or Invalid Id provided');}
    try{
        let data=await projectData.deleteMember(projectId,memberEmail);
        return res.status(200).json(data);
    }catch(e){
        return res.status(400).json({error: e.toString()});
    }
})

router
.route('/searchprojects')
.post(async (req,res) => {
    try{
        const {searchText} = req.body;
        const projects = await searchProjects(searchText);
        return res.json(projects);
    } catch(e){
        res.status(400).json({e:'Error in search'})
    }
})
// .delete(async(req,res)=>{
//     const memberEmail=req.body.memberEmail;
//     const projectId=req.body.projectId;
//     // if(!projectId||!memberId){return res.status(400).json('No Id or Invalid Id provided');}
//     try{
//         let data=await projectData.deleteMember(projectId,memberEmail);
//         return res.status(200).json(data);
//     }catch(e){
//         return res.status(400).json({error: e.toString()});
//     }
// })
export default router;