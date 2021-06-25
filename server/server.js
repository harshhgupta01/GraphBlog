const express = require("express");
const cors = require("cors");
const schema = require("./schema.js");
const { graphqlHTTP } = require("express-graphql");

const app = express();

// const loginMiddleware = (req, res, next) => {
//     console.log(req.cookies['id'])
// }

app.use(cors());
// app.use(express.cookieParser());
// app.use(loginMiddleware)
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(4000, () => {
  console.log("Server is running on port 4000.. ");
});
