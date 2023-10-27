Express BizTime
Express BizTime is a simple API application that manages companies and their invoices. It's built using Express.js and interfaces with a database to store and retrieve information about companies and their associated invoices.

Features
CRUD operations for companies.
CRUD operations for invoices associated with companies.
Setup and Installation
Clone the repository:
bash
Copy code
git clone https://github.com/equansa00/express-biztime.git
cd express-biztime
Install the required dependencies:
bash
Copy code
npm install
Create a .env file with the required environment variables for your database connection.

To start the server, run:

bash
Copy code
npm start
The server will start and listen on port 3000.

API Endpoints
Companies
GET /companies: List all companies.
GET /companies/:code: Get details of a specific company by its code.
POST /companies: Add a new company. Requires company details in the request body.
PUT /companies/:code: Update a company by its code. Requires updated company details in the request body.
DELETE /companies/:code: Delete a company by its code.
Invoices
GET /invoices: List all invoices.
GET /invoices/:id: Get details of a specific invoice by its ID.
POST /invoices: Add a new invoice. Requires invoice details in the request body.
PUT /invoices/:id: Update an invoice by its ID. Requires updated invoice details in the request body.
DELETE /invoices/:id: Delete an invoice by its ID.
Contribution
Feel free to fork this repository and submit pull requests. All contributions are welcome.
