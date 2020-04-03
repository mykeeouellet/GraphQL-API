
// =========== DEPENDENCIES ==============//
require('dotenv').config();
const express = require('express');
const graphqlHTTP = require('express-graphql');
const graphql = require('graphql'); 
const joinMonster = require('join-monster');
//========================================//

//=============== CONNECTING TO THE DATABASES =======================//
// == Connecting to PSQL == //
const { Client } = require('pg')
const client = new Client({
  host: process.env.PSQL_HOST,
  user: process.env.PSQL_USER,
  password: process.env.PSQL_PASSWORD,
  database: process.env.PSQL_DATABASE
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


//===================== CREATING THE SCHEMA =========================//
// const QueryRoot defines all the fields can be queried at the first level
//====================================================================//
const QueryRoot = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        hello: {
            type: graphql.GraphQLString,
            resolve: () => "Hello world!"
        },

        interventions: {
            type: new graphql.GraphQLList(Intervention),
            resolve: (parent, args, context, resolveInfo) => {
              return joinMonster.default(resolveInfo, {}, sql => {
                return client.query(sql)
              })
            }
        },

        intervention: {
            type: Intervention,
            args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) } },
            where: (factinterventionTable, args, context) => `${factinterventionTable}.building_id = ${args.id}`,
            resolve: (parent, args, context, resolveInfo) => {
            return joinMonster.default(resolveInfo, {}, sql => {
                return client.query(sql)
                })
            }
        },

        buildings: {
            type: new graphql.GraphQLList(Building),
            resolve: (parent, args, context, resolveInfo) => {
              return joinMonster.default(resolveInfo, {}, sql => {
                return client.query(sql)
              })
            }
        },

        building: {
            type: Building,
            args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) } },
            where: (buildingsTable, args, context) => `${buildingsTable}.id = ${args.id}`,
            resolve: (parent, args, context, resolveInfo) => {
            return joinMonster.default(resolveInfo, {}, sql => {
                return client.query(sql)
                })
            }
        },

    })


  })
//====================== DEFINING EACH TYPE ==========================//
//{Intervention, Building, Adress, Customer, Employee and Building_detail}
//====================================================================//
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
        sqlTable: 'factintervention', // the SQL table for this object type is called "factintervention"
        uniqueKey: 'building_id', // id is different for every row
    }

    const Building = new graphql.GraphQLObjectType({
        name: 'Building',
        fields: () => ({
          id: { type: graphql.GraphQLInt },
          addresse: {
            type: Address,
            sqlJoin: (buildingsTable, addressesTable, args) => `${buildingsTable}.id = ${addressesTable}.entity_id`
          }
        })
      });
    
        //specified the name of the table as well as the unique id of the rows inside the type's configuration object, _typeConfig. 
        //that way, Join Monster will know how to construct a proper SQL statement for your table.
        Building._typeConfig = {
            sqlTable: 'buildings',
            uniqueKey: 'id',
        }

        const Address = new graphql.GraphQLObjectType({
            name: 'Address',
            fields: () => ({
              entity_id: { type: graphql.GraphQLInt },
              street_number: { type: graphql.GraphQLString },
              street_name: { type: graphql.GraphQLString },
              suite_or_apartment: { type: graphql.GraphQLString },
              city: { type: graphql.GraphQLString },
              postal_code: { type: graphql.GraphQLString },
              country: { type: graphql.GraphQLString },    
              building: {
                type: Building,
                sqlJoin: (addressesTable, buildingsTable, args) => `${addressesTable}.entity_id = ${buildingsTable}.id`
              }
            })
          });
        
            //specified the name of the table as well as the unique id of the rows inside the type's configuration object, _typeConfig. 
            //that way, Join Monster will know how to construct a proper SQL statement for your table.
            Address._typeConfig = {
                sqlTable: 'addresses',
                uniqueKey: 'entity_id',
            }
      
const schema = new graphql.GraphQLSchema({ 
    query: QueryRoot 
});


//================= CREATING THE EXPRESS SERVER =======================//
var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: global,
    graphiql: true
}));
app.listen(4000, () => console.log('Express graphQL server now running on localhost:4000/graphql'));
//====================================================================//
