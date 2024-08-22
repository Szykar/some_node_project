# Node JS Voting App - backend
## Functional requirements:
* Admin can create a Session
* A Session consists of Parts
* A Part can have multiple Votings
* Councilors can vote when Admin starts a Voting
* Votes are automatically counted
* Admin can generate PDF with Voting results

> [!IMPORTANT]
> Frontend code can't be shared, therefore this app can't be run.
> You can see at least the backend code.

### Quick run:
```sh
cp .env.example .env
nano .env # set variables
yarn
yarn start:dev
```

### The backend for voting application:
* expressJS for REST endpoints
* authorization via JWT and express-sessions
* socketIO for realtime voting
* Sequelize ORM and MySQL database

### This is 5-years old code, so I would change a few things today:
* use TypeScript
* rethink the architecture
* refactor SocketIO and endpoints code
* extract repeated code by creating service layer and repository layer
* improve error logging
* write tests :)