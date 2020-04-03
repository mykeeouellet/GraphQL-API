GraphQL API // Codeboxx Week-8
=============================
This project is using Node.js and Express to create a GraphQL Api.
The API is deployed on heroku with the GraphiQL interface at this URL

    https://rocketelevatorgraphql.herokuapp.com/graphql

The goal this week was to answer 3 separate queries made to 2 different databases 
using a GraphQL API. 

The 3 requests were :

1. Retrieving the address of the building, the beginning and the end of the intervention for a specific intervention.

    Include this query to get back data 

    query {
        intervention(building_id){
            building {
                addresse {
                    street_number
                    street_name
                    suite_or_apartment
                    city
                    postal_code
                    country
                }
            }
            start_date_time_intervention
            end_date_time_intervention
        }

2. Retrieving customer information and the list of interventions that took place for a specific building.

    Include this query to get back data 

    query {
        building(id){
            customer {
                company_name
                company_contact_full_name              
            }
            interventions
        }
    }

3. Retrieval of all interventions carried out by a specified employee with the buildings associated with these interventions including the details (Table BuildingDetails) associated with these buildings.

    Include this query to get back data 
    
    query {
        employee(id) {
            interventions {
                buildings {
                    building_details {
                        building_id
                        information_key
                        value
                    }
                }
            }
        }
    }

