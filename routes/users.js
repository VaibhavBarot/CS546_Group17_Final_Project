import {Router} from 'express';
import { registerUser, loginUser } from '../data/users.js';
import {getAllUserBugs} from '../data/bugs.js';
import validation from '../validation.js';
import moment from 'moment';
import { getAllUserProjects,getAllProjects } from '../data/projects.js';

const router = Router()
router.route('/').get(async(req,res) => {
    return res.json({error: 'YOU SHOULD NOT BE HERE!'});
});

router.route('/register')
.get(async(req,res)=>{
    return res.render('register',{title:'User Register'})
})

.post(async(req,res) => {
    try{
        let {fname,lname,email,password,confirmPassword,role} = req.body;

        // if(!fname || !lname || !email || !password || !role) throw "All fields must be supplied";
        const fields = [
            { value: fname, name: 'First name' },
            { value: lname, name: 'Last name' },
            { value: email, name: 'Email' },
            { value: password, name: 'Password' },
            { value: confirmPassword, name:'Confirm Password'},
            { value: role, name: 'Role'}
        ];
        
        for (const field of fields) {
            if (!field.value) {
                throw (field.name + ' cannot be empty');
            }
        }
    
        ({fname,lname,email,password,role} = validation.checkUser(req.body));
        if(confirmPassword!==password)
        {
            return res.status(400).render('register',{error:'Password does not match'})
        }
    
        let result =    await registerUser(fname,lname,email,password,role);

        if(!result) return res.status(500).send({error:'Internal Server Error'});

        return res.redirect('/dashboard');
    } catch(e){
        res.status(400).render('register',{error:true,msg:e})
    }
})

router.route('/admin')
.get(async(req,res) => {
    return res.render('admin');
})

router.route('/manager')
.get(async(req,res) => {
    return res.render('manager');
})

router.route('/login')
.get(async (req, res) => {
    //code here for GET
    return res.render('login',{title:"login"})
 })
.post(async(req,res)=>{
    let {email,password} = req.body
   
    try{
        if(!email || !password){
            return res.status(400).render('login',{error:true,msg:'Both email and password are required.'})
        }
    
      
            email = email.toLowerCase()
        email = validation.checkString(email,'Email')
        // validation.checkEmail(email)
        
            password = validation.checkString(password,'password')
            validation.checkPassword(password,'Password')
       
        
        let result = await loginUser(email,password)
        if(!result) return res.status(500).send({error:'Internal Server Error'});
        req.session.user = result;
        res.locals.isLoggedIn = true;
        return res.redirect('/dashboard');
    }
        catch(e)
        {
            res.status(400).render('login',{error:true,msg:e})
            
        }

    
}) 

router.route('/dashboard')
.get(async (req, res) => {
    try{

        const result = (req.session.user.role === 'user') ? 
        await getAllProjects(): 
        await getAllUserProjects(req.session.user._id) 
        return res.render('dashboard',{packages:result});
    } catch(e){
        console.log(e);
    }
})

router.route('/logout')
.get(async(req,res) => {
    try{
        req.session.destroy()
         res.redirect('/login')
    }
    catch(e){
        console.log(e)
    }

})

export default router;

