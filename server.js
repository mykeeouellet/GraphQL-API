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
        chatbot2(id: Int!): Elevator
    }

    type Elevator {
        elevator_serial_number: String
        elevator_model: String
        building_type: String
        elevator_status: String
        elevator_commissioning_date: String
        elevator_last_inspection_date: String
        elevator_inspection_certificate: String
        elevator_information: String
        elevator_notes: String
        created_at: String
        updated_at: String
        column_id: Int
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
    //Google ChatBot for brief
    chatbot: getChatBot,
    //Google ChatBot for elevator status
    chatbot2: getChatBot2
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

    // [ RowDataPacket { nb_elevators: 770 } ] I received an object in response with array.
    // I have the value of the property as a response, however it comes inside an array, using [0] access the first index of this array.

    // get the number of elevators
    var nb_elevators =  await query('SELECT COUNT(id) AS nb_elevators FROM elevators')
    resolve = nb_elevators
    console.log(nb_elevators)
    let nb_elevators_json = JSON.parse(JSON.stringify(nb_elevators[0]))
    console.log(nb_elevators_json)

    // get the number of not active elevators
    nb_not_active_elevators = await query('SELECT COUNT(id) AS nb_not_active_elevators FROM elevators WHERE elevator_status != "Active" ')
    let nb_not_active_elevators_json = JSON.parse(JSON.stringify( nb_not_active_elevators[0]))
    console.log(nb_not_active_elevators_json)

    // get the number of building
    nb_buildings =  await query('SELECT COUNT(id) AS nb_buildings FROM buildings')
    let nb_buildings_json = JSON.parse(JSON.stringify(nb_buildings[0]))
    console.log(nb_buildings_json)

    // get the number of customers
    nb_customers =  await query('SELECT COUNT(id) AS nb_customers FROM customers')
    let nb_customers_json = JSON.parse(JSON.stringify(nb_customers[0]))
    console.log(nb_customers_json)
    
    // get the number of batteries
    nb_batteries =  await query('SELECT COUNT(id) AS nb_batteries FROM batteries')
    let nb_batteries_json = JSON.parse(JSON.stringify(nb_batteries[0]))
    console.log(nb_batteries_json)

    // get the number of cities
    nb_cities =  await query('SELECT COUNT(city) AS nb_cities FROM addresses WHERE entity_type = "Building"')
    let nb_cities_json = JSON.parse(JSON.stringify(nb_cities[0]))
    console.log(nb_cities_json)

    // get the number of queries
    nb_quotes =  await query('SELECT COUNT(id) AS nb_quotes FROM quotes')
    let nb_quotes_json = JSON.parse(JSON.stringify(nb_quotes[0]))
    console.log(nb_quotes_json)

    // get the number of leads
    nb_leads =  await query('SELECT COUNT(id) AS nb_leads FROM leads')
    let nb_leads_json = JSON.parse(JSON.stringify(nb_leads[0]))
    console.log(nb_leads_json)
  
    resolve['nb_elevators'] = nb_elevators_json['nb_elevators']
    resolve['nb_not_active_elevators'] = nb_not_active_elevators_json['nb_not_active_elevators'];
    resolve['nb_buildings'] = nb_buildings_json['nb_buildings'];
    resolve['nb_customers'] = nb_customers_json['nb_customers'];
    resolve['nb_batteries'] = nb_batteries_json['nb_batteries'];
    resolve['nb_cities'] = nb_cities_json['nb_cities'];        
    resolve['nb_quotes'] = nb_quotes_json['nb_quotes'];
    resolve['nb_leads'] = nb_leads_json['nb_leads'];

    return resolve
};

async function getChatBot2({id}){
    var elevators = await query('SELECT * FROM elevators WHERE id = ' + id )
    resolve = elevators[0]
    console.log(elevators)

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
