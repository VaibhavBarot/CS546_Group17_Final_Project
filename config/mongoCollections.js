import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

// Note: You will need to change the code below to have the collection required by the assignment!


// contactsCollection.createIndex({ lastName: 1, firstName: -1 })
export const projects = getCollectionFn('projects');
export const users = getCollectionFn('users');
export const bugs = getCollectionFn('users');