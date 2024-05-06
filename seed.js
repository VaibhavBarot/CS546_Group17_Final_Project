import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import {bugs as bugc,projects as projectsc} from './config/mongoCollections.js'
import bcrypt from 'bcryptjs';
import { ObjectId } from "mongodb";

let users,projects,bugs
// Dummy data for MongoDB collection
const dummyUserData = async () => { return [
    {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alicejohnson@example.com",
      password: await bcrypt.hash("Password123!",10),
      role: "manager"
    },
    {
      firstName: "Bob",
      lastName: "Smith",
      email: "bobsmith@example.com",
      password: await bcrypt.hash("!SecurePassword1",10),
      role: "user"
    },
    {
      firstName: "Charlie",
      lastName: "Brown",
      email: "charliebrown@example.com",
      password: await bcrypt.hash("Brownie123!",10),
      role: "tester"
    },
    {
      firstName: "David",
      lastName: "Lee",
      email: "davidlee@example.com",
      password: await bcrypt.hash("LeeDavid@123",10),
      role: "developer"
    }
  ]}

const dummyProjectData = (users) => { return [
    {
        "name":"Website Redesign",
        "description":"Revamp the company website to enhance user experience and modernize its design.",
        "creator":users[0],
        "members":[users[0],users[1],users[2],users[3]]
    },
    {
        "name":"Mobile App Development",
        "description":"Develop a cross-platform mobile application for better reach and accessibility.",
        "creator":users[0],
        "members":[users[0],users[1],users[2],users[3]]
    },
    {
        "name":"Data Analytics Platform",
        "description":"Build a robust platform for analyzing and visualizing data to drive insights and decision-making.",
        "creator":users[0],
        "members":[users[0],users[1],users[2],users[3]]
    }
    
  ]}

const dummyBugData = (users,projects) => { return [
    {
        "title": "Image upload not working",
        "description": "Users are unable to upload images to their profiles.",
        "creator": users[1],
        "status": "inprogress",
        "priority": "medium",
        "assignedManager": users[0],
        "assignedTester": users[2],
        "assignedDeveloper": users[3],
        "projectId": projects[0],
        "estimatedTime": 6,
        "createdAt": "2024-04-26T12:00:00Z",
        "comments": [
          {
            "userId": users[3],
            "content": "I'll look into this issue.",
            "createdAt": "2024-04-26T12:10:00Z",
          }
        ]
      },
      {
        "title": "Search functionality not returning results",
        "description": "When users search for keywords, no results are displayed.",
        "creator": users[1],
        "status": "todo",
        "priority": "high",
        "assignedManager": users[0],
        "assignedTester": users[2],
        "assignedDeveloper": users[3],
        
        "projectId": projects[1],
        "estimatedTime": 8,
        "createdAt": "2024-04-26T12:30:00Z",
        "comments": [
          {
            "userId": users[0],
            "content": "This issue needs immediate attention.",
            "createdAt": "2024-04-26T12:35:00Z"
          }
        ]
      }
  ]}
  
  const insertDummyData = async () => {
    try {
        const dbcon = await dbConnection();
        await dbcon.dropDatabase();
        users = await dbcon.collection('users').insertMany(await dummyUserData());
        console.log(`${users.insertedCount} Users inserted`);

        projects = await dbcon.collection('projects').insertMany(await dummyProjectData(users.insertedIds));
        console.log(`${projects.insertedCount} Projects inserted`);

        bugs = await dbcon.collection('bugs').insertMany(await dummyBugData(users.insertedIds,projects.insertedIds));
        console.log(`${bugs.insertedCount} Bugs inserted`)
    } catch (error) {
      console.error("Error inserting documents:", error);
    }
  };

  const createIndex = async () =>{
    try{
      const bugsCollection = await bugc()
      const projectCollection = await projectsc()
      const result = await bugsCollection.createIndex({ title: "text",description:"text" },{ default_language: "english" });
      const projectIndex = await projectCollection.createIndex({ name: "text",description:"text" },{ default_language: "english" });
      await closeConnection();
      

    }
    catch (err){
      console.log(err)
    }
  }
  
  // Call function to insert dummy data
  await insertDummyData();
  await createIndex()

  console.log("Seed Completed")

  