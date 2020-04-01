var express = require('express');
var express_graphql = require('express-graphql');
var {buildSchema} = require('graphql');
// var query = require('./sql.js');
const { Client }  = require('pg');
const client = new Client({
    user: 'codeboxx',
    host: 'localhost',
    database: 'postgres',
    password: 'Bobek',
    port: 5432
});

client.connect(function(error){
    if (!!error) {
        console.log("Unable to connect to PSQL database.")
    } else {
        console.log("You are connected to PSQL database.")
    }
});

var mysql = require('mysql');
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Rocket_Elevators_Information_System_development"
});

con.connect(function(error){
    if (!!error) {
        console.log("Unable to connect to mySQL database.");
    } else {
        console.log("You are connected to mySQL database.");
    }
});
// GraphQL Schema
// type Query: special root type, entry points for the request sent by client
var schema = buildSchema(`
    type Employee {
        id: Int!
        firstname: String
        lastname: String
        email: String
        function: String
    }
    type Intervention {
        id: Int!
    }
    type Query {
        intervention(id: Int!): Intervention
        building(id: Int!): Building
        customer(id: Int!): Customer
        employee(id: Int!): Employee
        building_detail(id: Int!): Building_detail       
        message: String
        employees(id: Int!): Employee
    }

    type Intervention{
        id: Int!
        start_date_time_intervention: String
        end_date_time_intervention: String
    }
    type Building{
        id: Int!
        building_detail: [Building_detail]

    }
    type Customer{
        id: Int!
    }
    type Employee{
        id: Int!
    }
    type Building_detail{
        id: Int!
    }
    type Address{}
`);

Root Resolver
var root = {
    message: () => 'Hello World!',
    employees: getEmployees
};

function query(queryString) {
    console.log(queryString)
    return new Promise((resolve, reject) => {
        con.query(queryString, function(err, result) {
            if (err) {
                return reject(err);
            } 
            return resolve(result)
        })
    })
}
// var root = {
// intervention: testing
// };

async function getEmployees({id}) {
    var employees = await query('SELECT * FROM employees WHERE id = ' +id )
    return employees[0]
};

function testing()

Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('Express graphQL server now running on localhost:4000/graphql'));


