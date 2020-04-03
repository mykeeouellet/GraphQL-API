var express = require('express');
var express_graphql = require('express-graphql');
var {buildSchema} = require('graphql');
// const { GraphQLObjectType, GraphQLString, GraphQLList  } = graphql;
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
  password: "Pepperm@nt1",
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
// type Query is special schema root type, this is the entry point for the client request.
// address: Address! belongs to one address
// customer: Customer! belongs to one customer
// interventions: [Intervention] belongs to many intervention

var schema = buildSchema(`
    type Query {
        interventions(building_id: Int!): Intervention
        buildings(id: Int!): Building
        customers(id: Int!): Customer
        employees(id: Int!): Employee
        building_details(id: Int!): Building_detail
    }

    type Intervention {
        building_id: Int!
        buildings: [Building]
        start_date_time_intervention: String!
        end_date_time_intervention: String
    }

    type Building {
        id: Int!
        building_administrator_full_name: String
        addresse: Address
        customer: Customer
        building_detail: Building_detail
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
    }

    type Customer {
        company_name: String
        company_contact_full_name: String
    }

    type Employee {
        id: Int!
        firstname: String
        lastname: String
        buildings: [Building]
        interventions: [Intervention]
    }

    type Building_detail {
        id: Int!
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
};

async function getInterventions({building_id}) {
    // get intervention
    var intervention = await querypg('SELECT * FROM factintervention WHERE building_id = ' + building_id)
    resolve = intervention[0]
    
    // get buildings
    buildings = await query('SELECT * FROM buildings WHERE id = ' + resolve.building_id)

    // get address
    address = await query('SELECT * FROM addresses WHERE entity_id = ' + resolve.building_id)
    
    resolve['buildings']= buildings;
    resolve['address']= address;

    return resolve
};

async function getBuildings({id}) {
    // get building
    var buildings = await query('SELECT * FROM buildings WHERE id = ' + id )

    // get customer
    customers = await query('SELECT * FROM customers WHERE building_id = ' + id)

    // get intervention
    intervention = await querypg('SELECT * FROM factintervention WHERE building_id = ' + id)
    resolve = intervention[0]

    buildings['customers']= customers
    buildings['intervention']= intervention

    return buildings
};

async function getEmployees({id}) {
    // get employee
    const employees = await query('SELECT * FROM employees WHERE id = ' + id )
    // get intervention
    intervention = await querypg('SELECT * FROM factintervention WHERE employee_id = ' + id)
    resolve = intervention[0]
    // get building
    buildings = await query('SELECT * FROM buildings WHERE id = ' + resolve.building_id)
    // get building details
    building_details = await query('SELECT * FROM building_details WHERE building_id = buildings.id')

    employee['intervention']= intervention
    employee['buildings']= buildings
    employee['building_details']=building_details

    return employees
};

// define what is query
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

// define what is querypg
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

// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('Express graphQL server now running on localhost:4000/graphql'));
