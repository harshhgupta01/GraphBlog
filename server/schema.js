const axios = require("axios");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLError,
} = require("graphql");
const { buildResolveInfo } = require("graphql/execution/execute");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    age: { type: GraphQLInt },
    password: { type: GraphQLString },
    blogs: {
      type: new GraphQLList(BlogType),
      async resolve(parentValue, args) {
        let blogsArray = await axios.get("http://localhost:3000/blogs");
        blogsArray = blogsArray.data;

        let result = blogsArray.filter(
          (blog) => blog.user_id == parentValue.id
        );
        console.log(result);
        if (!result.length) {
          result = [result];
        }
        return result;
      },
    },
  }),
});

const BlogType = new GraphQLObjectType({
  name: "Blog",
  fields: () => ({
    id: { type: GraphQLString },
    user_id: { type: GraphQLString },
    user: {
      type: UserType,
      async resolve(parentValue, args) {
        let result = await axios.get(
          "http://localhost:3000/users/" + parentValue.user_id
        );
        return result.data;
      },
    },
    title: { type: GraphQLString },
    body: { type: GraphQLString },
    upVotes: {
      type: GraphQLList(GraphQLString),
      resolve(parentValue, args) {
        console.log(parentValue);
        return [parentValue.upVotes.length];
      },
    },
    downVotes: {
      type: GraphQLList(GraphQLString),
      resolve(parentValue, args) {
        console.log(parentValue);
        return [parentValue.downVotes.length];
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        return axios
          .get("http://localhost:3000/users/" + args.id)
          .then((res) => res.data);
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios.get("http://localhost:3000/users").then((res) => res.data);
      },
    },
    blog: {
      type: BlogType,
      args: {
        id: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        return axios
          .get("http://localhost:3000/blogs/" + args.id)
          .then((res) => res.data);
      },
    },
    blogs: {
      type: new GraphQLList(BlogType),
      resolve(parentValue, args) {
        return axios.get("http://localhost:3000/blogs").then((res) => res.data);
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    login: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parentValue, args) {
        const users = await axios
          .get("http://localhost:3000/users")
          .then((res) => res.data);
        console.log(users);
        var id = null;
        users.forEach((user) => {
          if (user.email == args.email && user.password == args.password) {
            console.log(user.id);
            id = user.id;
          }
        });
        if (id) {
          console.log(id);
          return await axios
            .get("http://localhost:3000/users/" + id)
            .then((res) => res.data);
        } else {
          return new GraphQLError("User not found");
        }
      },
    },
    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, args) {
        return axios
          .post("http://localhost:3000/users", {
            id: args.id,
            name: args.name,
            email: args.email,
            age: args.age,
            password: args.password,
          })
          .then((res) => res.data);
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, args) {
        return axios
          .delete("http://localhost:3000/users/" + args.id)
          .then((res) => res.data);
      },
    },
    createBlog: {
      type: BlogType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: GraphQLString },
        user_id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, args) {
        return axios
          .post("http://localhost:3000/blogs", {
            title: args.title,
            body: args.body,
            user_id: args.user_id,
            upVotes: [],
            downVotes: [],
          })
          .then((res) => res.data);
      },
    },
    deleteBlog: {
      type: BlogType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        user_id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, args) {
        let blog = axios
          .get("http://localhost:3000/blogs/" + args.id)
          .then((res) => res.data);
        if (blog.user_id == args.user_id) {
          return axios
            .delete("http://localhost:3000/blogs/" + args.id)
            .then((res) => res.data);
        } else {
          return new GraphQLError("Invalid Request");
        }
      },
    },
    editBlog: {
      type: BlogType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLString },
        body: { type: GraphQLString },
        user_id: { type: GraphQLNonNull(GraphQLString) },
      },
      async resolve(parentValue, args) {
        let blog = await axios
          .get("http://localhost:3000/blogs/" + args.id)
          .then((res) => res.data);
        if (blog.user_id == args.user_id) {
          return axios
            .patch("http://localhost:3000/blogs/" + args.id, args)
            .then((res) => res.data);
        } else {
          return new GraphQLError("Invalid Request");
        }
      },
    },
    upVote: {
      type: BlogType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        upVotes: { type: new GraphQLNonNull(GraphQLList(GraphQLString)) },
      },
      async resolve(parentValue, args) {
        let users = await axios
          .get("http://localhost:3000/users/")
          .then((res) => res.data);
        var exist = false;
        users.forEach((user) => {
          if (user.id == args.upVotes[0]) {
            exist = true;
          }
        });
        if (exist) {
          let blog = await axios
            .get("http://localhost:3000/blogs/" + args.id)
            .then((res) => res.data);
          if (!blog.upVotes.includes(args.upVotes[0])) {
            blog.upVotes.push(args.upVotes[0]);
            args.upVotes = blog.upVotes;
            return axios
              .patch("http://localhost:3000/blogs/" + args.id, args)
              .then((res) => res.data);
          } else {
            return new GraphQLError("Already Voted");
          }
        } else {
          return new GraphQLError("User does not exist");
        }
      },
    },
    downVote: {
      type: BlogType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        downVotes: { type: new GraphQLNonNull(GraphQLList(GraphQLString)) },
      },
      async resolve(parentValue, args) {
        console.log(args);
        let users = await axios
          .get("http://localhost:3000/users/")
          .then((res) => res.data);
        var exist = false;
        users.forEach((user) => {
          if (user.id == args.downVotes[0]) {
            exist = true;
          }
        });
        if (exist) {
          let blog = await axios
            .get("http://localhost:3000/blogs/" + args.id)
            .then((res) => res.data);
          if (!blog.downVotes.includes(args.downVotes[0])) {
            blog.downVotes.push(args.downVotes[0]);
            args.downVotes = blog.downVotes;
            return axios
              .patch("http://localhost:3000/blogs/" + args.id, args)
              .then((res) => res.data);
          } else {
            return new GraphQLError("Already Voted");
          }
        } else {
          return new GraphQLError("User does not exist");
        }
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
