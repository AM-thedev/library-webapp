const { UserInputError, AuthenticationError } = require('apollo-server-express')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const jwt = require('jsonwebtoken')
const JWT_SECRET = 'YOUR_SECRET_KEY_HERE'

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

module.exports = {
  Query: {
    me: (root, args, { currentUser }) => {
      return currentUser
    },
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({}).populate("author")
      }
      if (!args.genre) {
        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: { $in: author.id } }).populate("author")
      }
      if (!args.author) {
        return Book.find({ genres: { $in: [args.genre] } }).populate("author") //may need a YES
      }
      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: { $in: author.id }, genres: { $in: [args.genre] } }).populate("author")
      }
    },
    allAuthors: () => Author.find({}).populate("books"),
    findAuthor: (root, args) =>
      Author.findOne({ name: args.name }),
    findBook: (root, args) =>
      Book.findOne({ title: args.title })
  },
  Author: {
    bookCount: (root) => {
      return root.books.length
    }
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const bookExists = await Book.exists({ title: args.title })
      if (bookExists) {
        throw new UserInputError('Title must be unique!', {
          invalidArgs: args.title
        })
      }

      let book
      let author
      try {
        author = await Author.findOne({ name: args.author })

        if (!author) {
          author = new Author({ name: args.author })
        }

        book = new Book({ ...args, author })
        await book.save()

        author.books = author.books.concat(book)
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },
    editBorn: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
  
      const author = await Author.findOne({ name: args.name })
      author.born = args.born
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      return author
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}
  