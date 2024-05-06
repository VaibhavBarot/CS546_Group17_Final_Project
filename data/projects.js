import { ObjectId } from "mongodb";
import {projects} from "../config/mongoCollections.js"
import {users} from '../config/mongoCollections.js'
import validation from '../validation.js';
const createProjects=async(
    projectName,
    projectDescription,
    creator,
    // projectMembers
)=>{
    // let project={name:projectName.trim(),description:projectDescription.trim()};
    let project={name:projectName.trim(),description:projectDescription.trim(),creator:creator,members:[]};
    // if(!projectName || !projectDescription || !creator || !projectMembers )
    // {
    //     throw "All project fields must be provided."
    // }
    validation.checkString(projectName,"ProjectName");
    validation.checkString(projectDescription,"ProjectDescription");
    // if(!ObjectId.isValid(creator))
    // {
    //     throw "Invalid creator Id."
    // }
    // if(projectMembers.length===0)
    // {
    //     throw "Members cant be zero."
    // }
    // projectMembers.forEach(element => {
    //     validation.checkString(element,"Member");
    //     if (!ObjectId.isValid(element)){
    //         throw "One or more member ids are invalid.";
    //     }
    // });
    const proj=await projects();
    const projs=await proj.find({}).toArray();
    // console.log(users);
    projs.forEach(element => {if(element.name.toLowerCase()===project.name.toLowerCase()) throw `A project with the name ${project.name} already exists.`
    });
    // const existingProject= await proj.findOne({name:projectName});
    // if(existingProject){
    //     throw `A project with the name ${projectName} already exists.`
    // }
    const result=await proj.insertOne(project);
    if(!result || !result.acknowledged) throw "Project insertion failed!";
    return result;
};

const getAllProjects = async () =>{
    const projectCollection= await projects();
    let allProjects=await projectCollection.find({}).toArray();
    if(!allProjects){throw "Failed to fetch Projects"};
    // convert ObjectId  to string
    allProjects=allProjects.map((proj)=> {proj._id=proj._id.toString();return proj;});
    //Will only show project name and its description
    // return allProjects.map((project)=>({name:project.name,description:project.description}));
    return allProjects;
};
const getProject=async(projectId)=>{
    // projectId=projectId.trim();
    if(!projectId || !ObjectId.isValid(projectId)){throw "Id is empty or invalid."}
    validation.checkString(projectId,"projectId");
    const projectsCollection=await projects();
    let requestedProject= projectsCollection.findOne({_id:new ObjectId(projectId)});
    if(!requestedProject) {throw "Project Not Found."}
    // requestedProject._id=requestedProject._id.toString();
    return requestedProject;
};
const updateProject=async(projectId,updateProductObject)=>{
    const projectCollection = await projects();
    const project=await  getProject(projectId);
    if(updateProductObject.name){validation.checkString(updateProductObject.name,"projectName");project.name=updateProductObject.name.trim();}
    if(updateProductObject.description){validation.checkString(updateProductObject.description,"Description");project.description=updateProductObject.description.trim()}
    if(updateProductObject.creator){
        if(!ObjectId.isValid(updateProductObject.creator)) throw "Invalid Id";
        project.creator=updateProductObject.creator.trim();
    }
    if(updateProductObject.members){
        if(validation.validateMembers(updateProductObject.members,"Members"))
        {
            project.members=updateProductObject.members.forEach(element=>{
                element:new ObjectId(element)
            });
        }
    }
    else{
        project.name=project.name;
        project.description=project.description;
        project.creator=project.creator;
        project.members=project.members;
    }
    const updatedproject=await projectCollection.findOneAndUpdate({"_id":new ObjectId(projectId)},{$set:project},{returnDocument:'after'});
    // console.log(updatedproject);
    if(!updatedproject) throw "Update Failed";
    const fetchupdatedproject= await  projectCollection.findOne({_id: new ObjectId(projectId)});
    return fetchupdatedproject;
}
const  deleteProject=async (projectId)=>{
    if (!projectId||!ObjectId.isValid(projectId)) throw 'Invalid project ID';
    validation.checkString(projectId,'projectID');
    const projectsCollection=await projects();
    const deletingProject=await projectsCollection.findOneAndDelete({_id:new ObjectId(projectId)});
    if(!deletingProject) throw "Project deletion  Failed.";
    return true;
}
export const getAllUserProjects = async(userId) => {    
    const dbcon = await dbConnection();
    if(!userId) throw "Invalid User ID"
    validation.checkString(userId,'User ID')
    validation.checkId(userId,'User ID')
     const projects = await dbcon.collection('projects').find({members:new ObjectId(userId)}).toArray();
     return projects; 
 
 };
const addMember=async(projectId,memberEmail)=>{
    if(!projectId||!memberEmail||!ObjectId.isValid(projectId)) throw "Invalid input provided"
    const projectCollection=await projects();
    const usersCollection=await users();
    const user=await usersCollection.findOne({email:memberEmail})
    if(!user) throw "User does not exist"
    const project=await projectCollection.findOne({_id:new ObjectId(projectId)});
    if(!(user.role =='developer'|| user.role =='tester')) throw "Only developers and testers can be added"
    project.members.forEach(element=>{
    //     if(element===memberId){
    //        throw `This user is already a member of the Project.`;  
    //    }
        if(element.equals(user._id)) throw"Already a member of project"
        console.log(element)
    })
    project['members'].push(user._id);
    const updatedproject=await projectCollection.findOneAndUpdate({"_id":new ObjectId(projectId)},{$set:project},{returnDocument:'after'});
    // console.log(updatedproject);
    if(!updatedproject) throw "Add Member Failed";
    const fetchupdatedproject= await  projectCollection.findOne({_id: new ObjectId(projectId)});
    return fetchupdatedproject;
    // console.log(project["members"])
    // return project;
};
const deleteMember=async(projectId,memberEmail)=>{
    if(!projectId || !memberEmail || !ObjectId.isValid(projectId)) throw "Invalid input provided";
    const projectCollection = await projects();
    const usersCollection = await users();
    const user = await usersCollection.findOne({ email: memberEmail });
    if (!user) throw "User does not exist";
    const project = await projectCollection.findOne({ _id: new ObjectId(projectId) });
    if (!(user.role === 'developer' || user.role === 'tester')) throw "Only developers and testers can be removed";
    let memberIndex = project.members.findIndex(memberId => memberId.equals(user._id));
    if (memberIndex === -1) throw "Not a member of the project";
    project.members.splice(memberIndex, 1);
    const updatedProject = await projectCollection.findOneAndUpdate(
        { _id: new ObjectId(projectId) },
        { $set: { members: project.members } },
        { returnDocument: 'after' }
    );
    if (!updatedProject) throw "Remove Member Failed";
    const fetchUpdatedProject = await projectCollection.findOne({ _id: new ObjectId(projectId) });
    return fetchUpdatedProject;
//     if(!projectId||!memberId||!ObjectId.isValid(projectId)||!ObjectId.isValid(memberId)) throw "Invalid Id provided"
//     const projectCollection=await projects();
//     const project=await projectCollection.findOne({_id:new ObjectId(projectId)});
//     memberId=new ObjectId(memberId);
//     let index = project.members.indexOf(memberId); 
//     if (index !== -1) {
//         project.members.splice(index, 1); 
//         console.log(project.members)
//     }
//     const updatedproject=await projectCollection.findOneAndUpdate({"_id":new ObjectId(projectId)},{$set:project},{returnDocument:'after'});
//     // console.log(updatedproject);
//     if(!updatedproject) throw "Delete Member Failed";
//     const fetchupdatedproject= await  projectCollection.findOne({_id: new ObjectId(projectId)});
//     return fetchupdatedproject;
//     // console.log(project["members"])
//     // return project;
};
export default {createProjects,getAllProjects,getProject,deleteProject,updateProject,addMember,deleteMember};