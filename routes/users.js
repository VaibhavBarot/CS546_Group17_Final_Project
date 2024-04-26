import {Router} from 'express';
import { registerUser, loginUser } from '../data/users.js';
import {getAllUserBugs} from '../data/bugs.js';
import validation from '../validation.js';
import moment from 'moment';

const router = Router()
router.route('/').get(async(req,res) => {
    return res.json({error: 'YOU SHOULD NOT BE HERE!'});
});

router.route('/register')
.get(async(req,res)=>{
    return res.render('users',{title:'User Register'})
})

.post(async(req,res) => {
    try{
        let {fname,lname,email,password,role} = req.body;

        if(!fname || !lname || !email || !password || !role) throw "All fields must be supplied";
    
        ({fname,lname,email,password,role} = validation.checkUser(req.body));
    
        let result = await registerUser(fname,lname,email,password,role);

        if(!result) return res.status(500).send({error:'Internal Server Error'});

        req.session.user = result;

        return res.redirect('/dashboard');
    } catch(e){
        console.log(e);
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
    
})

router.route('/dashboard')
.get(async (req, res) => {
    try{
        const result = await getAllUserBugs(req.session.user.id);
        return res.render('dashboard');
    } catch(e){
        console.log(e);
    }
})

export default router;

