var express = require('express');
var express_graphql = require('express-graphql');
var {buildSchema} = require('graphql');

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
  host: 'localhost',
  user: 'root',
  password: 'Bobek',
  database: 'Rocket_Elevator_Foundation_development'
});

con.connect(function(error){
    if (!!error) {
        console.log("Unable to connect to mySQL database.");
    } else {
        console.log("You are connected to mySQL database.");
    }
});

// GraphQL Schema
// type Query is special schema root type, this is the entry point for the client request.
// address: Address! belongs to one address
// customer: Customer! belongs to one customer
// interventions: [Intervention] belongs to many intervention

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

// The root provides a resolver function for each API endpoint
var root = {
    // first question
    interventions: getInterventions,
    // second question
    buildings: getBuildings,
    //third question
    employees: getEmployees,
    //Google ChatBot
    chatbot: getChatBot
};

async function getInterventions({building_id}) {
    // get intervention
    var intervention = await querypg('SELECT * FROM factintervention WHERE building_id = ' + building_id)
    resolve = intervention[0]
    console.log(intervention)
    // get address
    address = await query('SELECT * FROM addresses WHERE entity_type = "Building" AND entity_id = ' + building_id)
    console.log(address)

    resolve['address']= address[0];

    return resolve
};

async function getBuildings({id}) {
    // get building
    var buildings = await query('SELECT * FROM buildings WHERE id = ' + id )
    resolve = buildings[0]

    // get interventions
    interventions = await querypg('SELECT * FROM factintervention WHERE building_id = ' + id)

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
    interventions = await querypg('SELECT * FROM factintervention WHERE employee_id = ' + id)
    result = interventions[0]
    console.log(interventions)

    // get building details
    building_details = await query('SELECT * FROM building_details WHERE building_id = ' + result.building_id)
    console.log(building_details)

    resolve['interventions']= interventions;
    result['building_details']= building_details;

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

// define what is query
function query (queryString) {
    return new Promise((resolve, reject) => {
        con.query(queryString, function(err, result) {
            if (err) {
                return reject(err);
            } 
            return resolve(result)
        })
    })
};

// define what is querypg
function querypg (queryString) {
    return new Promise((resolve, reject) => {
        client.query(queryString, function(err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(result.rows)
        })
    })
};

// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('Express graphQL server now running on localhost:4000/graphql'));
