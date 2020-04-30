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

// Greetings
// There are currently XXX elevators deployed in the XXX buildings of your XXX customers
// Currently, XXX elevators are not in Running Status and are being serviced
// XXX Batteries are deployed across XXX cities
// On another note you currently have XXX quotes awaiting processing
// You also have XXX leads in your contact requests

var schema = buildSchema(`
    type Query {
        interventions(building_id: Int!): Intervention
        buildings(id: Int!): Building
        employees(id: Int!): Employee
        chatbot: Chatbot
    }

    type Chatbot {
        nb_elevators: Int
        nb_buildings: Int
        nb_customers: Int
        nb_not_active_elevators: Int
        nb_batteries: Int
        nb_cities: Int
        nb_quotes: Int
        nb_leads: Int
    }

    type Intervention {
        building_id: Int!
        building_details: [Building_detail]
        start_date_time_intervention: String
        end_date_time_intervention: String
        employee_id: Int!
        address: Address
    }

    type Building {
        id: Int!
        building_administrator_full_name: String
        address: Address
        customer: Customer
        building_details: [Building_detail]
        interventions: [Intervention]
    }
    
    type Address {
        street_number: String
        street_name: String
        suite_or_apartment: String
        city: String
        postal_code: String
        country: String
    }

    type Customer {
        company_name: String
        company_contact_full_name: String
    }

    type Employee {
        id: Int!
        firstname: String
        lastname: String
        building_details: [Building_detail]
        interventions: [Intervention]
    }

    type Building_detail {
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
    // first question
    interventions: getInterventions,
    // second question
    buildings: getBuildings,
    //third question
    employees: getEmployees,
    //Google chatbot
    chatbot: getChatBot,
};
//====================================================================//

//======= DEFINING EACH RESOLVER FUNCTION WITH ITS SQL QUERY =========//
// This is where the resolver functions are defined. When they are called
// the associated SQL query that we need will be sent to the databases with
// the right query function (i.e {await querypg('SELECT * FROM ....')});
//====================================================================//
async function getInterventions({building_id}) {
    // get intervention
    var intervention = await querypg('SELECT * FROM "factintervention" WHERE building_id = ' + building_id)
    resolve = intervention[0]
    // get address
    address = await query('SELECT * FROM addresses WHERE entity_type = "Building" AND entity_id = ' + building_id)

    resolve['address']= address[0];

    return resolve
};

async function getBuildings({id}) {
    // get building
    var buildings = await query('SELECT * FROM buildings WHERE id = ' + id )
    resolve = buildings[0]

    // get interventions
    interventions = await querypg('SELECT * FROM "factintervention" WHERE building_id = ' + id)

    // get customer
    customer = await query('SELECT * FROM customers WHERE id = ' + resolve.customer_id)

    resolve['customer']= customer[0];
    resolve['interventions']= interventions;

    return resolve
};

async function getEmployees({id}) {
    // get employee
    var employees = await query('SELECT * FROM employees WHERE id = ' + id )
    resolve = employees[0]
    
    // get interventions
    interventions = await querypg('SELECT * FROM "factintervention" WHERE employee_id = ' + id)
    result = interventions[0]
    console.log(interventions)


    // get building details
    building_details = await query('SELECT * FROM building_details WHERE building_id = ' + result.building_id)
    console.log(building_details)

    resolve['interventions']= interventions;
    resolve['building_details']= building_details;

    return resolve
};

async function getChatBot(){
    // get the number of elevators
    var nb_elevator =  await query('SELECT id, SUM(id) AS nb_elevator FROM elevators')
    resolve = nb_elevator

    // get the not active elevators
    nb_not_active_elevators = await query('SELECT id, SUM(id) AS nb_not_active_elevators FROM elevators WHERE status != "Active" ')
    // get the number of building
    // get the number of customers
    // get the number of batteries
    // get the number of queries
    // get the number of leads
    // get the number of cities
    resolve['nb_not_active_elevators'] = nb_not_active_elevators;

    return resolve
};

//====================================================================//



//================== DEFINING EACH QUERY FUNCTION ====================//
// Each query function is defined here with their associated database 
// connection. query => MySQL // querypg => PostGreSQL .
//====================================================================//
function query (queryString) {
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Express GraphQL server is running");
});
//====================================================================//
