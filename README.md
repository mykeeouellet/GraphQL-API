
GraphQL API // Codeboxx Week-8

This project is using Node.js and Express to create a GraphQL Api.

Answer to the 3 questions:

1. Retrieving the address of the building, the beginning and the end of the intervention for a specific intervention.
query {
    intervention(building_id){
        start_time
        end_time
        buildings {
            addresses{
                street_number
                street_name
                suite_or_apartment
                city
                postal_code
                country
            }

        }
    }
}

2. Retrieving customer information and the list of interventions that took place for a specific building.

3. Retrieval of all interventions carried out by a specified employee with the buildings associated with these interventions including the details (Table BuildingDetails) associated with these buildings.





