import { bugs } from "../config/mongoCollections.js";
import { ObjectId, UnorderedBulkOperation } from 'mongodb';
import moment from 'moment';
import validation from '../validation.js';
import { getUsers } from '../data/users.js'
import exportedHelpers from "../helpers.js";
import MiniSearch from 'minisearch'
import { isAxiosError } from "axios";
import { getProject } from "./projects.js";
import { projectData } from "./index.js";

const createBug = async (bug_obj) => {
    // console.log("dsfc ",bug_obj)
   
    if (!bug_obj.title || !bug_obj.description || !bug_obj.priority || !bug_obj.status) throw "Missing Required Fields"

    bug_obj.title =validation.checkString(bug_obj.title, 'Title')
    bug_obj.description = validation.checkString(bug_obj.description, 'Description')
    bug_obj.priority=validation.checkString(bug_obj.priority, 'Priority')
    if(validation.checkPriority(bug_obj.priority))
    bug_obj.status=validation.checkString(bug_obj.status, 'Status')
    // bug_obj.status=validation.checkStatus(bug_obj.status)
    if(validation.checkStatus(bug_obj.status))
    if(!ObjectId.isValid(bug_obj.assignedManager)){
        throw "Assigned Manager must be a valid object"
    }


    if (bug_obj.role === 'user') {
        const not_assigned = 'notassigned'
        if (bug_obj.priority !== not_assigned && bug_obj.status !== not_assigned && bug_obj.assignedDeveloper !== not_assigned && bug_obj.assignedTester !== not_assigned) {
            throw "For user role, priority, status, assigned developer, and assigned tester must not be assigned."
        }


    }

    if (bug_obj.hasOwnProperty('role')) {
        const bugsCollection = await bugs()
        let role = bug_obj.role

        let createdAt = new Date()
        bug_obj.creator = new ObjectId(bug_obj.creator)
        bug_obj.assignedManager = new ObjectId(bug_obj.assignedManager)
        bug_obj.createdAt = createdAt
        bug_obj.comments = []
        if (bug_obj.role === 'tester') {
            bug_obj.assignedTester = bug_obj.creator
        }
        if (bug_obj.role === 'manager') {
            bug_obj.assignedManager = bug_obj.creator
        }
        delete bug_obj.role



        const createdBug = await bugsCollection.insertOne(bug_obj)
        if (createdBug.insertedId) {
            if (role === 'user') {
                let user = await getUsers(bug_obj.assignedManager)
                if (user) {
                    exportedHelpers.sendEmail(user.email, 'A user has created a new bug', 'A new bug has been created by the user please check it out!!')
                }


            }
            return createdBug

        }
        else {
            throw { status: 500, msg: 'Error in inserting to database' }
        }
    }
    else {
        throw { status: 400, msg: 'No role found for user' }
    }
}

const getAll = async (projectId) => {
    const bugsCollection = await bugs()
    if (!projectId) throw "Invalid Project ID"
    validation.checkString(projectId, 'Project ID')
    validation.checkId(projectId, 'Project ID')
    projectId = new ObjectId(projectId)
    const bugsdata = await bugsCollection.find({ projectId: projectId }).toArray()
    return bugsdata;


}

export const getAllUserBugs = async (userId, role, projectId) => {
    const bugsCollection = await bugs()
    if (!userId) throw "Invalid Project ID"
    validation.checkString(userId, 'Project ID')
    validation.checkString(role, 'Role')
    validation.checkRole(role)
    userId = new ObjectId(userId)
    let allBugs = []
    if (role === 'tester') {
        allBugs = await bugsCollection.find({
            $or: [
                { assignedTester: userId },
                { creator: userId }
            ]
        }).toArray();
        allBugs.filter(bug => bug.projectId.toString() === projectId)
        return allBugs;

    }
    if (role === 'developer') {
        allBugs = await bugsCollection.find({
            $or: [
                { assignedDeveloper: userId },
                { creator: userId }
            ]
        }).toArray();
        allBugs.filter(bug => bug.projectId.toString() === projectId)
        return allBugs;

    }
    if (role === 'manager') {
        allBugs = await bugsCollection.find({
            $or: [
                { assignedManager: userId },
                { creator: userId }
            ]
        }).toArray();
        allBugs = allBugs.filter(bug => bug.projectId.toString() === projectId)
        return allBugs;

    }
    if (role === 'user') {
         allBugs = await bugsCollection.find({ creator: userId }).toArray();
        allBugs.filter(bug => bug.projectId.toString() === projectId)
        return allBugs;

    }


}

const getBug = async (bugId) => {
    const bugsCollection = await bugs()
    if (!bugId) throw "Invalid bug Id"
    validation.checkString(bugId, 'BugId')
    validation.checkId(bugId, 'BugId')
    const get_bug = await bugsCollection.findOne({ _id: new ObjectId(bugId) })
    return get_bug

}

const updateBug = async (
    bugId,
    updateObject,
    role
) => {
    // console.log("update obj ",updateObject)
    validation.checkId(bugId, 'Bug Id')
    validation.checkBug(updateObject,role)
    const bugsCollection = await bugs()
    const bug = await bugsCollection.updateOne({ _id: new ObjectId(bugId) }, { $set: updateObject })
    return bug
}


const deleteBug = async (bugId) => {
    //error handling
    validation.checkId(bugId, 'BugId')
    const bugsCollection = await bugs()
    const delete_bug = await getBug(bugId)
    const delete_bug1 = await bugsCollection.deleteOne({ _id: new ObjectId(bugId) });
    if (delete_bug1.deletedCount === 0) {
        throw "Bug not deleted"
    }

    return { _id: delete_bug._id, deleted: true }
}

const sortBugs = (order, bugsArray) => {

    if (!Array.isArray(bugsArray)) {
        throw "bugsArray must be an array"
    }
    const HighToLowpriorityOrder = { "high": 1, "medium": 2, "low": 3, "notassigned":4 }
    const LowToHighpriorityOrder = { "low": 1, "medium": 2, "high": 3, "notassigned":4 }


    if (order === 'H2L') {
        bugsArray.sort((bug1, bug2) => {
            return HighToLowpriorityOrder[bug1.priority] - HighToLowpriorityOrder[bug2.priority];
        });
    }
    if (order === 'L2H') {
        bugsArray.sort((bug1, bug2) => {
            return LowToHighpriorityOrder[bug1.priority] - LowToHighpriorityOrder[bug2.priority];
        });

    }


}

const filterBugs = async (filterParams, userId, role, projectId) => {
    validation.checkId(userId, 'User Id')
    validation.checkString(role, 'Role')
    let results = await getAllUserBugs(userId, role, projectId)
    // console.log(filterParams,results)

    if (results) {
        if (filterParams.search.trim().length > 0) {
            let searchTerm = filterParams.search.trim()
            let miniSearch = new MiniSearch({
                idField: '_id',
                fields: ['title', 'description'],
                storeFields: ['title', 'description', 'priority', 'status']
            })

            miniSearch.addAll(results)

            results = miniSearch.search(searchTerm)

        }
        let status_arr = filterParams.filterStatus
        let priority_arr = filterParams.filterPriority
        let filteredBugs = []
        if (status_arr.length > 0 && priority_arr.length > 0) {
            for (let bug of results) {
                if (status_arr.includes(bug.status) && priority_arr.includes(bug.priority)) { filteredBugs.push(bug) }
            }
            results = filteredBugs

        }
        else if (priority_arr.length > 0) {
            for (let bug of results) {
                if (priority_arr.includes(bug.priority)) { filteredBugs.push(bug) }
            }
            results = filteredBugs

        }
        else if (status_arr.length > 0) {
            for (let bug of results) {
                if (status_arr.includes(bug.status)) { filteredBugs.push(bug) }
            }
            results = filteredBugs

        }
        if (filterParams.toSort === 'L2H') {
            // console.log("Innn")
            // console.log("Results before ",results)
            sortBugs('L2H', results)
            // console.log("Results before ",results)
        }
        if (filterParams.toSort === 'H2L') {
            sortBugs('H2L', results)
        }
        // console.log("Sorted results ",results)

    }
    return results

}

// console.log(await filterBugs({'search':'image','filterPriority':['high'],'filterStatus':['todo'],'toSort':'L2H'},'6636c78d1cc7cc084e123642','manager'))

const search = async (searchInput) => {
    const query = { $text: { $search: `\"${searchInput}\"` } };
    const dbCon = await dbConnection()
    const bugsCollection = await dbCon.collection('bugs')
    const searchResult = await bugsCollection.find(query).toArray()
    return searchResult
}

const bugsSummary = async (projectId) => {
    validation.checkId(projectId, 'Project Id')
    let result = {
        total_bugs: 0,
        status: {

            'todo': 0,
            'inprogress': 0,
            'completed': 0,
            'inreview': 0,
            'intesting': 0
        },
        priority: {
            'high': 0,
            'medium': 0,
            'low': 0
        }
    }
    const bugsdata = await getAll(projectId)
    result['total_bugs'] = bugsdata.length
    for (let bug of bugsdata) {
        result['status'][bug['status']] += 1
        result['priority'][bug['priority']] += 1
    }

    return result


}

// console.log(await bugsSummary('6633d3dc2380ed6a4e0a963d'))
// console.log(await filterBugs({'filterStatus':['To Do'],'filterPriority':['High'],'sortBugs':'L2H'},'6633d3dc2380ed6a4e0a963e'))
// console.log(await search('search'))
export default { createBug, getAll, getBug, updateBug, deleteBug, getAllUserBugs, filterBugs, search, bugsSummary }
