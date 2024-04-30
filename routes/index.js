import bugRoutes from './bugs.js';
import commentRoutes from './comments.js'
import userRoutes from './users.js'
import projectRoutes from './projects.js';


const constructorMethod = (app) => {
  app.use('/bugs', bugRoutes);
  app.use('/comments', commentRoutes);
  app.use('/projects',projectRoutes);
  app.use('/',userRoutes)

  app.use('*', (req, res) => {
    res.status(404).json({error: 'Route Not found'});
  });
};

export default constructorMethod;