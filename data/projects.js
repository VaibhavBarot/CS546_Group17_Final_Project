import { ObjectId } from "mongodb";
import {projects} from "../config/mongoCollections.js"
import {users} from '../config/mongoCollections.js'
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
    projectMembers.forEach(element => {
        validation.checkString(element,"Member");
        if (!ObjectId.isValid(element)){
            throw "One or more member ids are invalid.";
        }
    });
    const projectCollection = await projects()
    const projs=await projectCollection.find({}).toArray();
    // console.log(users);
    projs.forEach(element => {if(element.name.toLowerCase()===project.name.toLowerCase()) throw `A project with the name ${project.name} already exists.`
    });
    const result=await projectCollection.insertOne(project);
    if(!result || !result.acknowledged) throw "Project insertion failed!";
    return result;
};

export const getAllProjects = async () =>{
    const projectCollection= await projects()
    let allProjects=await projectCollection.find({}).toArray();
    if(!allProjects){throw "Failed to fetch Projects"};
    // convert ObjectId  to string
    allProjects=allProjects.map((proj)=> {proj._id=proj._id.toString();return proj;});
    return allProjects;
};
// console.log(await getAllProjects())
export const getProject=async(projectId)=>{
    // projectId=projectId.trim();
    if(!projectId || !ObjectId.isValid(projectId)){throw "Id is empty or invalid."}
    validation.checkString(projectId,"projectId");
    const projectsCollection=await projects();
    let requestedProject= projectsCollection.findOne({_id:new ObjectId(projectId)});
    if(!requestedProject) {throw "Project Not Found."}
    // requestedProject._id=requestedProject._id.toString();
    return requestedProject;
};
export const getAllUserProjects = async(userId) => { 
    const projectsCollection=await projects();   
    
    if(!userId) throw "Invalid User ID"
    validation.checkString(userId,'User ID')
    validation.checkId(userId,'User ID')
     const proj = await projectsCollection.find({members:new ObjectId(userId)}).toArray();
     return proj; 
 
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
    const updatedproject=await projectCollection.collection('projects').findOneAndUpdate({"_id":new ObjectId(projectId)},{$set:project},{returnDocument:'after'});
    // console.log(updatedproject);
    if(!updatedproject) throw "Update Failed";
    const fetchupdatedproject= await  projectCollection.findOne({_id: new ObjectId(projectId)});
    return fetchupdatedproject;
}
const  deleteProject=async (projectId)=>{
    if (!projectId||!ObjectId.isValid(projectId)) throw 'Invalid project ID';
    validation.checkString(projectId,'projectID');
    const projectsCollection=await projects()
    const deletingProject=await projectsCollection.findOneAndDelete({_id:new ObjectId(projectId)});
    if(!deletingProject) throw "Project deletion  Failed.";
    return true;
}
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
export const searchProjects =async(searchInput)=>{
    searchInput =searchInput.trim()
    const projectsCollection = await projects() 
    if (searchInput.length == 0){
        const searchResult = await projectsCollection.find({}).toArray()
        return searchResult
    }
    const query = {$text:{$search:`\"${searchInput}\"`}}
    const searchResult = await projectsCollection.find(query).toArray()
    return searchResult


}
// const deleteMember=async(projectId,memberEmail)=>{
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
// };
export default {createProjects,getAllProjects,getProject,deleteProject,updateProject,addMember,searchProjects};
