// =========== DEPENDENCIES ==============//
require('dotenv').config();
var express = require('express');
var express_graphql = require('express-graphql');
var {buildSchema} = require('graphql');
//========================================//

//=============== CONNECTING TO THE DATABASES =======================//
// == Connecting to PSQL == //
const { Client }  = require('pg');
const client = new Client({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: 5432
});
client.connect(function(error){
    if (!!error) {
        console.log("Unable to connect to PSQL database.")
    } else {
        console.log("You are connected to PSQL database.")
    }
});
// === MySQL Connection === //
var mysql = require('mysql');
const con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});
con.connect(function(error){
    if (!!error) {
        console.log("Unable to connect to mySQL database.");
    } else {
        console.log("You are connected to mySQL database.");
    }
});
//====================================================================//


//=========== CREATING THE SCHEMA AND DEFINING EACH TYPE =============//
// Query is special schema root type, this is the entry point for the client request.
//====================================================================//
var schema = buildSchema(`
    type Query {
        factinterventions(building_id: Int!): Intervention
        buildings(id: Int!): Building
        customers(id: Int!): Customer
        employees(id: Int!): Employee
        building_details(id: Int!): Building_detail
    }
    type Intervention {
        building_id: Int!
        start_date_time_intervention: String!
        end_date_time_intervention: String
        buildings: [Building]
        status: String
        result: String
    }
    type Building {
        id: Int!
        entity_id: Int!
        building_administrator_full_name: String
        addresses: [Address]
        customer: Customer
        interventions: [Intervention]
        building_details: Building_detail  
    }
    type Address {
        entity_id: Int!
        address_type: String
        address_status: String
        street_number: String
        street_name: String
        suite_or_apartment: String
        city: String
        postal_code: String
        country: String
        address_notes: String
    }
    type Customer {
        id: Int!
        company_name: String
        company_contact_full_name: String
        building: [Building]
    }
    type Employee {
        id: Int!
        firstname: String
        lastname: String
        email: String
        function: String
        building: [Building]
        intervention: [Intervention]
    }
    type Building_detail {
        id: Int!
        building_id: Int!
        information_key: String
        value: String
    }
`);

//====== LISTING THE POSSIBLE QUERIES AND ASSIGNING RESOLVERS ========//
// This is where we assign resolver to GraphQL queries.
// ( i.e employees triggers the getEmployees function or resolver )
//====================================================================//
var root = {
    factinterventions: getInterventions,
    buildings: getBuildings,
    customers: getCustomers,
    employees: getEmployees,
    building_details: getBuildingDetails,
};
//====================================================================//

//======= DEFINING EACH RESOLVER FUNCTION WITH ITS SQL QUERY =========//
// This is where the resolver functions are defined. When they are called
// the associated SQL query that we need will be sent to the databases with
// the right query function (i.e {await querypg('SELECT * FROM ....')});
//====================================================================//
async function getInterventions() {
    console.log("Sending Query...")
    var factintervention = await querypg('SELECT * FROM factintervention WHERE employee_id = 341')
    resolve = factintervention[0]
    return resolve
};

async function getBuildings({id}) {
    var buildings = await query('SELECT * FROM buildings WHERE id = ' +id )
    return buildings[0]
};

async function getCustomers({id}) {
    var customers = await query('SELECT * FROM customers WHERE id = ' +id )
    return customers[0]
};

async function getEmployees({id}) {
    var employees = await query('SELECT * FROM employees WHERE id = ' +id )
    return employees[0]
};

async function getBuildingDetails({id}) {
    var buildingdetails = await query('SELECT * FROM building_details WHERE id = ' +id )
    return buildingdetails[0]
};


//================== DEFINING EACH QUERY FUNCTION ====================//
// Each query function is defined here with their associated database 
// connection. querymysql => MySQL // querypg => PostGreSQL .
//====================================================================//
function querymysql(queryString) {
    console.log(queryString)
    return new Promise((resolve, reject) => {
        con.query(queryString, function(err, result) {
            if (err) {
                return reject(err);
            } 
            return resolve(result)
        })
    })
};
function querypg(queryString) {
    console.log("Bonjour! - PostGres -")
    console.log(queryString)
    return new Promise((resolve, reject) => {
        client.query(queryString, function(err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(result.rows)
        })
    })
};
//====================================================================//


//================= CREATING THE EXPRESS SERVER =======================//
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('Express graphQL server now running on localhost:4000/graphql'));
//====================================================================//