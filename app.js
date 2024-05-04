import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import session from 'express-session';
import {root_middleware,redirect_admin,redirect_dashboard,redirect_login,redirect_logout,redirect_register} from './middleware.js'
import helpers from 'handlebars-helpers';
helpers();

import customHelpers from './helpers.js';

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', exphbs.engine({defaultLayout: 'main', helpers:customHelpers}));
app.set('view engine', 'handlebars');

app.use(session({
  name: 'AuthenticationState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false
}))

app.use('/',root_middleware);
app.use('/admin',redirect_admin);
app.use('dashboard',redirect_dashboard);
app.use('/login',redirect_login);
app.use('/logout',redirect_logout);
// app.use('/manager',redirect_manager);
app.use('/register',redirect_register);




configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
