# Personal Budget project

### This is an API that functions as a budget system using the "Envelope budgeting" system.

What this API currently offers:

1. Displaying all currently stored envelopes.
2. Adding new envelopes to the database.
3. Calling, updating and deleting specific envelopes.
4. Transfering amounts of money between 2 different envelopes.


## How to use this API using Postman

- To GET **all** envelopes, just simply choose the GET method and type in (*localhost:8080*) as the URL.
- To GET a specific envelope, choose the GET method and type in (*localhost:8080/id*) whereas the **id** is the ID of the envelope you want to retrieve.
- To Update a specific envelope, choose the PUT method and type in (*localhost:8080/id*). Then in the request body, choose raw and JSON, then update it as you like in a JSON form (parameters are name and budget).
- To Create a new envelope, choose the POST method and type in (*localhost:8080*). Then in the request body, choose raw and JSON, then create it as you like in a JSON form (parameters are name and budget).
- To Delete a specific envelope, choose the GET method and type in (*localhost:8080/id*) whereas the **id** is the ID of the envelope you want to delete.
- To transfer money between 2 envelopes, choose the POST method and type in (*localhost:8080/transfer/sourceId/targetId*). Where as the **sourceId** is the ID of the envelope you want to transfer money from, and **targetId** is the ID of the envelope you want to trasnfer money to.

### More features coming soon.
  
