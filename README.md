
GraphQL API // Codeboxx Week-8

This project is using Node.js and Express to create a GraphQL Api.

Answer to the 3 questions:

1. Retrieving the address of the building, the beginning and the end of the intervention for a specific intervention.
Please try intervention building_id between 1 - 20 to get address.

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
Please try building id between 1 - 20 to get customer.
query {
    buildings(id: 20){
        customer {
            company_name
            company_contact_full_name              
        }
        interventions{
          building_id
        }
    }
}

3. Retrieval of all interventions carried out by a specified employee with the buildings associated with these interventions including the details (Table BuildingDetails) associated with these buildings.
Please try employee id: 1, 2, 17, 45, 51, 53 to get building details

query {
    employees(id: 53) {
        firstname
        lastname
        interventions{
            building_id
        }
        building_details {
            building_id
            information_key
            value
        }
    }
}






