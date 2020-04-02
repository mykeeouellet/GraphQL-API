const express = require('express')
const graphqlHTTP = require('express-graphql')
const graphql = require('graphql')
// translates the users GraphQL queries to SQL statements 
const joinMonster = require('join-monster')

// postgresql connection
const { Client } = require('pg')
const client = new Client({
  host: "localhost",
  user: "codeboxx",
  password: "Bobek",
  database: "postgres"
})
client.connect(function(error){
    if (!!error) {
        console.log("Unable to connect to PSQL database.")
    } else {
        console.log("You are connected to PSQL database.")
    }
});

// mysql connection
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

// create the schema
// const QueryRoot defines all the fields can be queried at the first level
const QueryRoot = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      hello: {
        type: graphql.GraphQLString,
        resolve: () => "Hello world!"
      }
    })
  })

const Intervention = new graphql.GraphQLObjectType({
    name: 'Intervention',
    fields: () => ({
      building_id: { type: graphql.GraphQLInt },
      start_date_time_intervention: { type: graphql.GraphQLString },
      end_date_time_intervention: { type: graphql.GraphQLString },
      buildings: {
        type: Building,
        sqlJoin: (factinterventionTable, buildingsTable, args) => `${factinterventionTable}.building_id = ${buildingsTable}.id`
      }
    })
  });

//specified the name of the table as well as the unique id of the rows inside the type's configuration object, _typeConfig. 
//that way, Join Monster will know how to construct a proper SQL statement for your table.
Intervention._typeConfig = {
    sqlTable: 'factintervention',
    uniqueKey: 'building_id',
  }

  type Intervention {
    building_id: Int!
    start_date_time_intervention: String!
    end_date_time_intervention: String
    buildings: [Building]
}

      
const schema = new graphql.GraphQLSchema({ 
    query: QueryRoot 
});

// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: global,
    graphiql: true
}));

app.listen(4000, () => console.log('Express graphQL server now running on localhost:4000/graphql'));