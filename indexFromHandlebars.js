const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const myProjects = require('./projects.json');

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

app.use(express.static('./public'));
app.use(express.static('./projects'));
app.get('/', (request, response) => {
    response.render('welcome', {
        layout: 'main',
        myProjects,
    });
});

app.get('/about', (request, response) => {
    response.render('about', {
        layout: 'main',
        aboutMe: `I am ...`,
    });
});

app.listen(8080, () => console.log("I'm all ears!"));
