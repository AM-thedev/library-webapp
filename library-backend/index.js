// Apollo Express dependencies
const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const express = require('express')
const http = require('http')

// Subscriptions dependencies
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { makeExecutableSchema } = require('@graphql-tools/schema')


const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const resolvers = require('./resolvers')
const typeDefs = require('./typeDefs')
const User = require('./models/user')


const JWT_SECRET = 'YOUR_SECRET_KEY_HERE'
const MONGODB_URI = process.env.MONGODB_URI


console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })
mongoose.set('debug', true)

async function startApolloServer() {
  // Required logic for integrating with Express
  const app = express()
  const httpServer = http.createServer(app)
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  // ApolloServer initialization plus drain plugin
  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodedToken = jwt.verify(
          auth.substring(7), JWT_SECRET
        )
        const currentUser = await User.findById(decodedToken.id).populate('friends')
        return { currentUser }
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            }
          }
        }
      }
    ]
  })

  // SubscriptionServer initialization
  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: server.graphqlPath }
  )

  // More required logic for integrating with Express
  await server.start()
  server.applyMiddleware({
    app,
    // Use the default apollo-server GraphQL endpoint
    path: '/'
  })


  // Server startup
  httpServer.listen(4000, () =>
    console.log(`🚀 Server is now running on http://localhost:4000${server.graphqlPath}`)
  );
}
startApolloServer()