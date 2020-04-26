'use strict';

require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000 ;
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error' , err => console.error(err));
const app = express();
const methodOverride = require('method-override');


app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

// Route
app.get('/',indexHandler);
app.get('/digimonDetail/:digimon_id', detailFunction);
app.put('/update/:digimon_id', updateFunction);
app.delete('/delete/:digimon_id', deleteFunction);

app.get('/searches/render',renderFunction);
app.post('/digimonForm', formFunction);
app.use('*',notFoundHandler);


function indexHandler(req,res){
    const sql = 'SELECT * FROM digimon;';
    client.query(sql).then(result => {
        res.render('./index',{dataBaseDigimon:result.rows})
    })
    .catch(err =>{
        errorHandler(err,req,res);
    })
    
}
function detailFunction(req,res) {
    let sql = 'SELECT * FROM digimon WHERE id=$1;';
    let values = [req.params.digimon_id];
    client.query(sql,values).then(result1 => {
        res.render('./detail',{result:result1.rows[0]});
    })
    .catch(err =>{
        errorHandler(err,req,res);
    })
    
}
function updateFunction(req,res) {
    let {name,level}=req.body;
    let sql = 'UPDATE digimon SET name=$1,level=$2 WHERE id=$3;';
    let safeValue =[name,level,req.params.digimon_id];
    client.query(sql,safeValue).then(() =>{
        res.redirect(`/digimonDetail/${req.params.digimon_id}`);
    })
    .catch(err =>{
        errorHandler(err,req,res);
    })
    
}

function deleteFunction(req,res) {
    let sql = 'DELETE FROM digimon WHERE id=$1;';
    let values =[req.params.digimon_id];
    client.query(sql,values).then(() =>{
        res.redirect('/');
    })
    .catch(err =>{
        errorHandler(err,req,res);
    })
}

function renderFunction(req,res){
    res.render('./searches/render');
}
function formFunction(req,res){
    const enter = req.body.enter;
    const radio = req.body.radio;
    console.log('enter',enter);
    console.log('radio',radio);
    let url;
    if(radio ==='name'){
        url = `https://digimon-api.herokuapp.com/api/digimon?q=${enter}`; 
    }else if(radio ==='level'){
        url = `https://digimon-api.herokuapp.com/api/digimon?q=${enter}`;
    }
    return superagent.get(url).then(digimonData => {
        console.log(url);
        
        const digimonSummary = digimonData.body.map(digimonValue =>{
            return new Digimon(digimonValue);
        })
        res.render('./searches/favorite',{searchShow:digimonSummary});
    })
    .catch(err =>{
        errorHandler(err,req,res);
    })
    
}
function Digimon(digimons){
    this.img = digimons.img ? digimons.img : 'no result' ;
    this.name = digimons.name ? digimons.name : 'no result';
    this.level = digimons.level ? digimons.level :  'no result';
    
}
function notFoundHandler(req,res){
    res.status(404).send('page not found');
}
function errorHandler(err,req,res) {
    res.status(500).render('./error',{error:err});
}
client.connect().then(() =>{
    app.listen(PORT,() => console.log(`up on ${PORT}`));
});