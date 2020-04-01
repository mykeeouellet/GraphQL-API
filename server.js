var express = require('express');
var express_graphql = require('express-graphql');
var {buildSchema} = require('graphql');

// GraphQL Schema
// type Query: special root type, entry points for the request sent by client
var schema = buildSchema(`
    type Query {
        intervention(id: Int!): Intervention
        building(id: Int!): Building
        customer(id: Int!): Customer
        employee(id: Int!): Employee
        building_detail(id: Int!): Building_detail       
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
    intervention: testing

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


