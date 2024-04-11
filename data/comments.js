import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { ObjectId, ServerApiVersion } from 'mongodb'

const createComment = async (
    bugId,
    timestamp,
    content,
    files
)