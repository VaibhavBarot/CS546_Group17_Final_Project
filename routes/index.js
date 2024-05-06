import bugRoutes from './bugs.js';
import commentRoutes from './comments.js'
import userRoutes from './users.js'
import projectRoutes from './projects.js';


const constructorMethod = (app) => {
  app.use('/projects/:projectId', bugRoutes);
  app.use('/comments', commentRoutes);
  app.use('/projects',projectRoutes);
  app.use('/',userRoutes)
  app.use('/error',(req, res) => {
    res.status(404).render('error',{'status':403,'msg':'Access Denied'});
  });

  app.use('*', (req, res) => {
    res.status(404).render('error',{'status':404,'msg':'Page Not Found'});
  });
};

export default constructorMethod;