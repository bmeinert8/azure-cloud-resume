import azure.functions as func
import json
import logging

# app level set to anonymous for frontend counter without authentication
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

#-- Decorators --#
# 1. HTTP Trigger
@app.route(route="GetResumeCounter")

#2. Cosmos DB Input
@app.cosmos_db_input(arg_name="indoc",
database_name="AzureResume",
container_name="Counter",
id="1",
partition_key="1",
connection="CosmosDbConnectionString")

# 3. Cosmos DB output
@app.cosmos_db_output(arg_name="outdoc",
database_name="AzureResume",
container_name="Counter",
connection="CosmosDbConnectionString")

#-- Function --#
def GetResumeCounter(req: func.HttpRequest, indoc: func.DocumentList, outdoc: func.Out[func.Document]) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    #Error handling: If the database is empty or the ID doesn't exist
    if not indoc:
        return func.HttpResponse("Could not find the counter document.", status_code= 404)
    
    # Grab the JSON document
    doc = indoc[0]

    # Get the current count and add 1
    current_count = doc['count']
    new_count = current_count + 1
    doc['count'] = new_count

    # Save the updated document back to Cosmos DB
    outdoc.set(func.Document.from_dict(doc))

    # Return the new count to the frontend as a JSON response
    return func.HttpResponse(
        json.dumps({"count": new_count}),
        mimetype="application/json"
    )