import express from 'express';
const app = express();
app.use(express.json());

export const root_middleware = (req,res,next) =>{
    if(!req.session.user){
        if(req.url !=='/login' && req.url !== '/register')
        return res.redirect('/login')
        next()
    }
    
    else if(req.session.user.role === 'admin')   
        {
            res.locals.isLoggedIn = true;
            res.locals.user = req.session.user;
            if(req.url !== '/admin' && req.url !== '/logout' && req.url!=='/register'){
                return res.redirect('/admin')
            }
            next()
        }
    else{
        if(req.url === '/register' && req.session.user.role !== 'manager') return res.redirect('/dashboard')
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user;
    next();
    }
};

export const redirect_admin = (req,res,next) =>{
    if(req.session && req.session.user && req.session.user.role !== 'admin'){
        return res.redirect('/error')
    }
    else{
       next();
    }

};

export const redirect_dashboard = (req,res,next) =>{
   
}

export const redirect_login = (req,res,next) =>{
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
      }
      else{
        next();
      }
    
};

export const redirect_logout = (req,res,next) =>{
    if(!req.session || !req.session.user)
    {
        return res.redirect('/login')
    }
    next();
};



export const redirect_register = (req,res,next) =>{
    if(req.session && req.session.user){
        if(req.session.user.role === 'user'){
            return res.redirect('/login')
        }
    }
   
        next();
    
};


