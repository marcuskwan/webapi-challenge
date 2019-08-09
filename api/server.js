const express = require("express");

// people array

let people = [
  {
    id: 1,
    name: "Frodo Baggins",
    chores: [
      {
        id: 1,
        description: "take the ring to Mordor",
        notes: "make your way to Mount Doom",
        assignedTo: 1, // the id of Frodo,
        completed: true,
      },
      {
        id: 2,
        description: "destroy the ring",
        notes: "cast the ring into the fire inside Mount Doom",
        assignedTo: 1,
        completed: false,
      },
    ],
  },
];

// logger
const morgan = require("morgan");
// http
const helmet = require("helmet");
// cors
const cors = require("cors");

const server = express();

// use json
server.use(express.json());

// query

server.get("/", (req, res) => {
  const queryParameters = req.query;

  res.status(200).json(queryParameters);
});

// // require the 2 routes
// const userRoutes = require("./users/userRouter");
// const postRoutes = require("./posts/postRouter");

// get
// get people
server.get("/people", (req, res) => {
  res.status(200).json(people);
  // res.json(people)
});

// get chores
server.get("/:userId/chores", (req, res) => {
  // store userId from url
  const userId = parseInt(req.params.userId);
  // store person that has userId
  const foundPerson = people.find(person => {
    console.log("person", person);
    return person.id === userId;
  });
  // if foundPerson exists..
  if (foundPerson) {
    // if chores exists, return chores
    if (foundPerson.chores) {
      res.status(200).json(foundPerson.chores);
      // if chores does not exist, return empty array
    } else {
      res.status(500).json([]);
    }
  }
  // if foundPerson doesn't exist, it means no person had the user Id
  else {
    res.status(400).json({ message: "User ID doesn't exist" });
  }
});

// post
// post new person
// add validateUser to ensure user added a name
server.post("/people", validateUser, (req, res) => {
  // create a variable that is one more than the last id in the people array
  const latestUserId = people[people.length - 1].id + 1;
  // store the new person into a var and add an id that auto increments
  const newPerson = { id: latestUserId, ...req.body };
  // add the new person to our people array
  people.push(newPerson);
  // send a 200 response with our updated people array
  res.status(200).json(people);
});

// post new chore
server.post("/chores", validateChore, (req, res) => {
  // store the id from the chore's assignedId
  const assignedId = req.body.assignedTo;
  // store person that has userId
  const foundPerson = people.find(person => person.id === assignedId);
  console.log("foundPerson", foundPerson);
  // if foundPerson exists..
  if (foundPerson) {
    // create a variable that is one more than the latest chores ID
    const latestChoreId =
      foundPerson.chores[foundPerson.chores.length - 1].id + 1 || 1;
    // create the newChore that we'll add to that person's chores array
    const newChore = {
      // fill out the newChore with the stuff our FE sent us..
      id: latestChoreId,
      description: req.body.description,
      //? optional, maybe you can make it that by default its an empty string?
      notes: req.body.notes,
      assignedTo: assignedId,
      // competed is either what the FE sent us, or by default false
      completed: req.body.completed || false,
    };
    // check to see if there is an existing chores array under that user, if they do, add it to the person's chores array
    if (foundPerson.chores) {
      foundPerson.chores = [...foundPerson.chores, newChore];
      res.status(200).json(people);
    } // otherwise, create one and add the the new chore object to it
    else {
      foundPerson.chores = [newChore];
      res.status(200).json(people);
    }
  }
  // if foundPerson doesn't exist, it means no person had the user Id, or a wrong assignedTo ID was given
  else {
    res.status(400).json({
      message: "User ID doesn't exist, please input a valid assignedTo ID",
    });
  }
});

//custom middleware

// function logger(req, res, next) {}

// middleware
server.use(morgan("dev"));
server.use(helmet());
server.use(cors());

// custom middlewares
// validate user is a normal function so it gets hoisted
function validateUser(req, res, next) {
  // destructure name
  const { name } = req.body;
  // if name exists, it means the user sent us a name
  if (name) {
    // proceed to next middleware
    next();
    // if they didn't, it means they didn't send us a name
  } else {
    res.status(404).json({ message: "Please input a name" });
  }
}

function validateChore(req, res, next) {
  // destructure description and assignedTo
  const { description, assignedTo } = req.body;
  // check to see if they exist
  if (description && assignedTo) {
    // proceed to next middleware
    next();
  }
  // otherwise send them an message to input them
  else {
    res
      .status(404)
      .json({ message: "Please input both a description and an assigned ID" });
  }
}

// server.use("/users", userRoutes);
// server.use("/posts", postRoutes);

module.exports = server;
