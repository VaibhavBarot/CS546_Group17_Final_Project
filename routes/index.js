import bugRoutes from './bugs.js';
import commentRoutes from './comments.js'
import userRoutes from './users.js'


const constructorMethod = (app) => {
  app.use('/bugs', bugRoutes);
  app.use('/comments', commentRoutes);
  app.use('/',userRoutes)
//   app.use('/reviews', reviewRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({error: 'Route Not found'});
  });
};

export default constructorMethod;