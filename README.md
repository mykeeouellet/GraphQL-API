
GraphQL API // Codeboxx Week-8

This project is using Node.js and Express to create a GraphQL Api.

Answer to the 3 questions:

1. Retrieving the address of the building, the beginning and the end of the intervention for a specific intervention.
query {
    interventions(building_id: 20){
        address {
            street_number
            street_name
            suite_or_apartment
            city
            postal_code
            country
        }
        start_date_time_intervention
        end_date_time_intervention
    }
}

2. Retrieving customer information and the list of interventions that took place for a specific building.
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






