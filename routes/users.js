import {Router} from 'express';
import { registerUser, loginUser, updatePassword} from '../data/users.js';
import {getAllUserBugs} from '../data/bugs.js';
import validation from '../validation.js';
import moment from 'moment';
import { getAllUserProjects,getAllProjects } from '../data/projects.js';
import xss from 'xss'

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
        let fname=xss(req.body.fname);
        let lname=xss(req.body.lname);
        let email=xss(req.body.email);
        let password=xss(req.body.password);
        let confirmPassword=xss(req.body.confirmPassword);
        let role=xss(req.body.role);
        // let {fname,lname,email,password,confirmPassword,role} = req.body;

        // if(!fname || !lname || !email || !password || !role) throw "All fields must be supplied";
        const fields = [
            { value: fname, name: 'First name' },
            { value: lname, name: 'Last name' },
            { value: email, name: 'Email' },
            { value: password, name: 'Password' },
            { value: confirmPassword, name:'Confirm Password'},
            { value: role, name: 'Role'},            
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
    
        let result =  await registerUser(fname,lname,email,password,role);
        if(!result) return res.status(500).send({error:'Internal Server Error'});
        return res.redirect('/login');
    } catch(e){
        res.status(400).render('register',{error:true,msg:e})
    }
})

router.route('/admin')
.get(async(req,res) => {
    return res.render('admin');
})
<<<<<<< Updated upstream

router
.route('/dashboard/createProject')
.get(async(req,res)=>{
    return res.render('createProject',{title:'Create Project'});
})
.post(async(req,res)=>{
    let name=xss(req.body.pname);
    let description=xss(req.body.desc);
    let creator=req.session.user._id;
    let members=[];
    try{
        if(!name || !description)throw "All  fields must be filled out.";
        validation.checkString(name,'Name');
        validation.checkString(description,"Description");
    }catch(e){res.status(400).json({error: e.toString()});}
    try{
    let result=await projectData.createProjects( name,description,creator,members);
    if(!result){
        return res.status(400).json('Error creating new Project');
    }
    return res.redirect('/dashboard');
    }
    catch(e){return res.status(500).json({error: e.toString()});}
})

=======
>>>>>>> Stashed changes
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
    let email=xss(req.body.email);
    let password=xss(req.body.password);   
    try{
        if(!email || !password){
            return res.status(400).render('login',{error:true,msg:'Both email and password are required.'})
        }
            email = email.toLowerCase()
            email = validation.checkString(email,'Email')
        
            password = validation.checkString(password,'password')
            validation.checkPassword(password,'Password')
       
        
        let result = await loginUser(email,password)
        if(!result) return res.status(500).send({error:'Internal Server Error'});
        req.session.user = result;
        if(req.session.user.firstLogin)
        {
            return res.redirect('/firstLogin')
        }
        else{
            res.locals.isLoggedIn = true;
            return res.redirect('/dashboard');
        }   
    }
        catch(e)
        {
            res.status(400).render('login',{error:true,msg:e})
            
        }

    
}) 
router.route('/firstLogin')
.get(async(req,res)=>{
    return res.render('firstLogin')
})
.post(async(req,res)=>{
        let {email,oldPassword,newPassword} = req.body
    try{
        if(!oldPassword || !newPassword ){
            return res.status(400).render('firstLogin',{error:true})
          }
            email = req.session.user.email
            email = validation.checkString(email,'Email')
            oldPassword = validation.checkString(oldPassword,'Old Password')
            validation.checkPassword(oldPassword,'Old Password')
            newPassword = validation.checkString(newPassword,'New Password')
            validation.checkPassword(newPassword,'New Password')
            await updatePassword(email, oldPassword, newPassword);
            req.session.user.firstLogin = false;
            return res.redirect('/dashboard')

    }
    catch(e){
        res.render('firstLogin',{error:true,msg:e})
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

router.route('/getcurrentuserrole')
.get(async(req,res) => {
    return res.json(req.session.user.role);
})

export default router;

