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
      firstName: "admin",
      lastName: "admin",
      email: "admin@example.com",
      password: await bcrypt.hash("Admin@1234",10),
      role: "admin"
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
    },
    {
      firstName: "Virat",
      lastName: "Kohli",
      email: "vk18@example.com",
      password: await bcrypt.hash("Viratkohli@18",10),
      role: "developer"
    },
    {
      firstName: "Sachin",
      lastName: "Tendulkar",
      email: "srt10@example.com",
      password: await bcrypt.hash("SRT@123456",10),
      role: "developer"
    },
    {
      firstName: "Jasprit",
      lastName: "Bumrah",
      email: "Jsb0@example.com",
      password: await bcrypt.hash("SRT@123456",10),
      role: "tester"
    },
    {
      firstName: "Suresh",
      lastName: "Raina",
      email: "suresh@example.com",
      password: await bcrypt.hash("Suresh@123456",10),
      role: "tester"
    },
    {
      firstName: "Rahul",
      lastName: "Doshi",
      email: "rahuldoshi34@gmail.com",
      password: await bcrypt.hash("Rahul@123456",10),
      role: "Developer"
    },
    {
      firstName: "Shailja",
      lastName: "Maheshwari",
      email: "mshailja29@gmail.com",
      password: await bcrypt.hash("Shailja@123456",10),
      role: "tester"
    },
    {
      firstName: "Vaibhav",
      lastName: "Barot",
      email: "vaibhavbarot04@gmail.com",
      password: await bcrypt.hash("Vaibhav@123456",10),
      role: "Manager"
    },
    {
      firstName: "Harsh",
      lastName: "Patel",
      email: "hpatel9802@gmail.com",
      password: await bcrypt.hash("Harsh@123456",10),
      role: "Developer"
    }

  ]}

const dummyProjectData = (users) => { return [
    {
        "name":"Website Redesign",
        "description":"Revamp the company website to enhance user experience and modernize its design.",
        "creator":users[0],
        "members":[users[0],users[4],users[3]]
    },
    {
        "name":"Mobile App Development",
        "description":"Develop a cross-platform mobile application for better reach and accessibility.",
        "creator":users[0],
        "members":[users[0],users[5],users[3]]
    },
    {
        "name":"Data Analytics Platform",
        "description":"Build a robust platform for analyzing and visualizing data to drive insights and decision-making.",
        "creator":users[0],
        "members":[users[0],users[5],users[10]]
    },
    {
      "name":"Healthchain",
      "description":"A Blockchain based EHR platform.",
      "creator":users[11],
      "members":[users[9],users[11],users[8]]
  },
  {
    "name":"SmartTRader",
    "description":"A trading application",
    "creator":users[0],
    "members":[users[0],users[10],users[9]]
},
  {
    "name":"EduTech",
    "description":"An online education platform",
    "creator": users[11],
    "members": [users[11], users[6], users[8]]
  },
    
  ]}

const dummyBugData = (users,projects) => { return [
    {
        "title": "Image upload not working",
        "description": "Users are unable to upload images to their profiles.",
        "creator": users[1],
        "status": "inprogress",
        "priority": "medium",
        "assignedManager": users[0],
        "assignedTester": users[3],
        "assignedDeveloper": users[4],
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
        "assignedManager": users[11],
        "assignedTester": users[8],
        "assignedDeveloper": users[9],
        
        "projectId": projects[3],
        "estimatedTime": 8,
        "createdAt": "2024-04-26T12:30:00Z",
        "comments": [
          {
            "userId": users[0],
            "content": "This issue needs immediate attention.",
            "createdAt": "2024-04-26T12:35:00Z"
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
        "assignedTester": users[3],
        "assignedDeveloper": users[4],
        
        "projectId": projects[0],
        "estimatedTime": 8,
        "createdAt": "2024-04-26T12:30:00Z",
        "comments": [
          {
            "userId": users[0],
            "content": "This issue needs immediate attention.",
            "createdAt": "2024-04-26T12:35:00Z"
          }
        ]
      },
      {
        "title": "Search functionality not returning results",
        "description": "When users search for keywords, no results are displayed.",
        "creator": users[5],
        "status": "todo",
        "priority": "high",
        "assignedManager": users[11],
        "assignedTester": users[8],
        "assignedDeveloper": users[9],
        
        "projectId": projects[3],
        "estimatedTime": 8,
        "createdAt": "2024-04-26T12:30:00Z",
        "comments": [
          {
            "userId": users[6],
            "content": "This issue needs immediate attention.",
            "createdAt": "2024-04-26T12:35:00Z"
          }
        ]
      },
      {
        "title": "Search functionality not returning results",
        "description": "When users search for keywords, no results are displayed.",
        "creator": users[5],
        "status": "todo",
        "priority": "high",
        "assignedManager": users[11],
        "assignedTester": users[8],
        "assignedDeveloper": users[9],
        
        "projectId": projects[3],
        "estimatedTime": 8,
        "createdAt": "2024-04-26T12:30:00Z",
        "comments": [
          {
            "userId": users[6],
            "content": "This issue needs immediate attention.",
            "createdAt": "2024-04-26T12:35:00Z"
          }
        ]
      },
      {
        "title": "Data not loading in discover page",
        "description": "some fields are not loading properly and are null",
        "creator": users[5],
        "status": "todo",
        "priority": "high",
        "assignedManager": users[11],
        "assignedTester": users[8],
        "assignedDeveloper": users[9],
        
        "projectId": projects[1],
        "estimatedTime": 8,
        "createdAt": "2024-04-26T12:30:00Z",
        "comments": [
          {
            "userId": users[6],
            "content": "This issue needs immediate attention.",
            "createdAt": "2024-04-26T12:35:00Z"
          }
        ]
      },
      {
        "title": "Profile picture upload error",
        "description": "Users cannot upload profile pictures; file size error being thrown.",
        "creator": users[6],
        "status": "todo",
        "priority": "high",
        "assignedManager": users[0],
        "assignedTester": users[3],
        "assignedDeveloper": users[4],
        
        "projectId": projects[0],
        "estimatedTime": 6,
        "createdAt": "2024-04-29T08:00:00Z",
        "comments": [
          {
            "userId": users[2],
            "content": "File size limit needs to be increased.",
            "createdAt": "2024-04-29T08:05:00Z"
          }
        ]
      },
      {
        "title": "Incorrect data in reports",
        "description": "Reports generated for the last quarter show incorrect totals.",
        "creator": users[4],
        "status": "todo",
        "priority": "medium",
        "assignedManager": users[11],
        "assignedTester": users[8],
        "assignedDeveloper": users[6],
        
        "projectId": projects[5],
        "estimatedTime": 9,
        "createdAt": "2024-05-04T08:20:00Z",
        "comments": [
          {
            "userId": users[3],
            "content": "Review the calculation logic in the report generation module.",
            "createdAt": "2024-05-04T08:25:00Z"
          }
        ]
      },
      {
        "title": "User feedback feature not updating",
        "description": "The user feedback submission feature freezes and does not update the database with new entries.",
        "creator": users[7],
        "status": "inprogress",
        "priority": "high",
        "assignedManager": users[11],
        "assignedTester": users[8],
        "assignedDeveloper": users[6],
        
        "projectId": projects[5],
        "estimatedTime": 11,
        "createdAt": "2024-05-05T14:00:00Z",
        "comments": [
        ]
      },
      {
        "title": "Email notification failure",
        "description": "Email notifications are not being sent to users after registration.",
        "creator": users[5],
        "status": "inreview",
        "priority": "low",
        "assignedManager": users[0],
        "assignedTester": users[3],
        "assignedDeveloper": users[4],
        
        "projectId": projects[0],
        "estimatedTime": 3,
        "createdAt": "2024-04-27T15:45:00Z",
        "comments": [
          {
            "userId": users[2],
            "content": "SMTP settings may need to be checked.",
            "createdAt": "2024-04-27T16:00:00Z"
          }
        ]
      },
      {
        "title": "Intermittent server downtime",
        "description": "Server goes down randomly during peak usage hours.",
        "creator": users[0],
        "status": "todo",
        "priority": "low",
        "assignedManager": users[0],
        "assignedTester": users[3],
        "assignedDeveloper": users[4],
        
        "projectId": projects[3],
        "estimatedTime": 10,
        "createdAt": "2024-04-29T11:30:00Z",
        "comments": [
          {
            "userId": users[2],
            "content": "Monitor server load and consider scaling options.",
            "createdAt": "2024-04-29T11:40:00Z"
          }
        ]
      },
      {
        "title": "UI rendering issues on mobile",
        "description": "Mobile app UI elements overlap on smaller screens.",
        "creator": users[3],
        "status": "inreview",
        "priority": "medium",
        "assignedManager": users[0],
        "assignedTester": users[3],
        "assignedDeveloper": users[5],
        
        "projectId": projects[1],
        "estimatedTime": 7,
        "createdAt": "2024-05-02T09:45:00Z",
        "comments": [
          {
            "userId": users[4],
            "content": "Adjust CSS for responsive design.",
            "createdAt": "2024-05-02T10:00:00Z"
          }
        ]
      },
      {
        "title": "Data sync error across devices",
        "description": "Users are experiencing issues with data not syncing properly across different devices.",
        "creator": users[5],
        "status": "inprogress",
        "priority": "high",
        "assignedManager": users[0],
        "assignedTester": users[10],
        "assignedDeveloper": users[9],
        
        "projectId": projects[4],
        "estimatedTime": 10,
        "createdAt": "2024-05-06T10:45:00Z",
        "comments": [
          {
            "userId": users[1],
            "content": "Check the synchronization logic and server response times.",
            "createdAt": "2024-05-06T10:50:00Z"
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

  