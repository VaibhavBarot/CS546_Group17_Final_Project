import {Router} from 'express';
import { registerUser, loginUser } from '../data/users.js';
import validation from '../validation.js';
import moment from 'moment';

const router = Router()
router.route('/').get(async(req,res) => {
    return res.json({error: 'YOU SHOULD NOT BE HERE!'});
});

router.route('/register')
.get(async(req,res)=>{
    return res.render('register',{title:'User Register'})
})

.post(async(req,res) => {

})

router.route('/login')
.get(async (req, res) => {
    //code here for GET
    return res.render('login',{title:"login"})
  })

.post(async(req,res)=>{
    
})

export default router;

