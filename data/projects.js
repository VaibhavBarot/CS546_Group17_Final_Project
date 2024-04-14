import {projects} from "../config/mongoCollections.js"
import { ObjectId } from "mongodb";
// import { projects } from "../config/mongoConnection.js";
import validation from '../validation.js';
const createProjects=async(
    projectName,
    projectDescription,
    creator,
    projectMembers
)=>{
    let project={name:projectName.trim(),description:projectDescription.trim(),creator:creator,members:projectMembers};
    if(!projectName || !projectDescription || !creator || !projectMembers )
    {
        throw "All project fields must be provided."
    }
    validation.checkString(projectName,"ProjectName");
    validation.checkString(projectDescription,"ProjectDescription");
    if(!ObjectId.isValid(creator))
    {
        throw "Invalid creator Id."
    }
    if(projectMembers.length===0)
    {
        throw "Members cant be zero."
    }
    const proj=await projects();
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
    return allProjects.map((project)=>({name:project.name,description:project.description}));
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
        validation.validateMembers(updateProductObject.members,"Members")
        project.members=updateProductObject.members;
    }
    else{
        project.name=project.name;
        project.description=project.description;
        project.creator=project.creator;
        project.members=project.members;
    }
    const updatedproject=await projectCollection.findOneAndUpdate({"_id":new ObjectId(projectId)},{$set:project},{returnDocument:'after'});
    console.log(updatedproject);
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
export default {createProjects,getAllProjects,getProject,deleteProject,updateProject};