import {Router} from 'express';
// import {} from './chart.js';
const router = Router()
router.route('/chart').get(async(req,res)=>{
    res.render('chart');
})