import {Router} from 'express';
import { ObjectId } from 'mongodb';
import moment from "moment";
const router = Router();
import validation from '../validation.js';
import { bugData } from '../data/index.js';

router
.route('/')
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
    validation.checkString(title, 'Title');
    validation.checkString(description, 'Description');
    validation.checkString(status, 'Status');
    validation.checkString(priority, 'Priority');
    validation.checkNumber(estimatedTime, 'Estimated Time');
    validation.checkId(creator, 'Creator');
    validation.checkId(assignedTo,'Assigned To');
    validation.checkId(projectId,'Project Id');
    validation.checkStringArray(members,'Members');
    validation.checkDate(createdAt,'Created At');

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
} );

export default router;
