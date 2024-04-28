import express from 'express';
const app = express();
app.use(express.json());

export const root_middleware = (req,res,next) =>{
    if(!req.session.user){
        if(req.url !=='/login')
        return res.redirect('/login')
        next()
    }
    else{
    next();
    }
};

export const redirect_admin = (req,res,next) =>{
    if(req.session && req.session.user){
        return res.redirect('/admin')
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


