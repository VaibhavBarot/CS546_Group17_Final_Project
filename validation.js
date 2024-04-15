import {ObjectId} from 'mongodb';
import moment from 'moment';

const exportedMethods = {
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== 'string') throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },

  checkNumber(strNum, varName)
  {
    // if(!strNum) throw `Error: You must supply a ${varName}!`;
    if(typeof strNum !== 'number') throw `Error: ${varName} must be a number!`;
    if(isNaN(strNum)) throw `Error:${varName} must be a valid Number. ${strNum} is not a number`
    return strNum;

  },

  checkDate(strDate, varName)
  {
    // const date_format = "ddd MMM DD YYYY HH:mm:ss GMTZ (ZZ)"
    const date_format = "ddd MMM DD YYYY HH:mm:ss"
    if(!moment(strDate, date_format, true).isValid()) throw `Error: Invalid ${varName} format. Use ${date_format}`

    const created_date = moment(strDate, date_format)
    const current_date = moment()

    if(created_date.isAfter(current_date)) throw `Error: ${varName} must be a current or past date.`

    return created_date;
    
  },

  checkStringArray(arr, varName) {
    //We will allow an empty array for this,
    //if it's not empty, we will make sure all tags are strings
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${varName}`;
    for (let i in arr) {
      if (typeof arr[i] !== 'string' || arr[i].trim().length === 0) {
        throw `One or more elements in ${varName} array is not a string or is an empty string`;
      }
      arr[i] = arr[i].trim();
    }

    return arr;
  },

  checkBug(updateObject){
    let {title, description,creator,status,priority,assignedTo,members,projectId,estimatedTime,createdAt} = updateObject;
    this.checkString(title, 'Title');
    this.checkString(description, 'Desription');
    this.checkString(status, 'Status');
    this.checkString(priority, 'Priority');
    this.checkNumber(estimatedTime, 'Estimated Time');
    this.checkId(creator, 'Creator');
    this.checkId(assignedTo,'Assigned To');
    this.checkId(projectId,'Project Id');
    this.checkStringArray(members,'Members');
    this.checkDate(createdAt,'Created At');
  },

  checkComment(updateObject_comment)
  {
    let {bugId, userId, timestamp,content,files} = updateObject_comment;
    this.checkId(bugId, 'Bug Id'),
    this.checkDate(timestamp,'TimeStamp'),
    this.checkString(content,'Content'),
    this.checkId(userId,'User Id'),
    this.checkStringArray(files,'Files')
  }
};

export default exportedMethods;