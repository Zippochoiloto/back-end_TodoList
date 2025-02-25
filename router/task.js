const express = require("express");
const { ObjectId } = require("mongodb");
const todoRouter = express.Router();
const { db } = require("../db");

todoRouter.get("/", async (req, res) => {
  try {
    const { id, level, enddate, startday, title, type, icontype } = req.headers;
    const userId = req.headers.userid;
    console.log("head", req.headers);
    let todo;
    if (level) {
      todo = await db.todos
        .find({
          level: level,
        })
        .toArray();
    } else if (enddate) {
      console.log("date", enddate);
      todo = await db.todos
        .find({
          enddate: new Date(enddate),
        })
        .toArray();
    } else if (startday) {
      todo = await db.todos
        .find({
          startday: new Date(startday),
        })
        .toArray();
    } else if (id) {
      todo = await db.todos.findOne({
        _id: new ObjectId(id),
      });
    } else if (title) {
      todo = await db.todos.findOne({
        title: title,
      });
    } else if (userId) {
      todo = await db.todos.findOne({
        userId: userId,
      });
      console.log("todoUserId", todo);
    } else if (type) {
      todo = await db.todos.findOne({
        type: type,
      });
    } else if (icontype) {
      todo = await db.todos.findOne({
        icontype: icontype,
      });
    } else {
      // todo = await db.items.find({}).toArray();
      todo = await db.todos.find({}).toArray();
      console.log("todoAr", todo);
    }
    res.status(200);
    res.json(todo);
  } catch (error) {
    res.status(500);
    res.json("some thing went wrong " + error);
  }
});

// create task
todoRouter.post("/", async (req, res) => {
  const {
    complete,
    description,
    enddate,
    startday,
    level,
    title,
    userId,
    type,
    icontype,
    itemId,
  } = req.body;

  if (
    !complete ||
    !description ||
    !enddate ||
    !startday ||
    !level ||
    !title ||
    !userId ||
    !type ||
    !icontype ||
    !itemId
  ) {
    res.status(500).json("Task creation failed: " + error);
  }

  try {
    let todoData = await handleTodo(
      complete,
      description,
      enddate,
      startday,
      level,
      title,
      userId,
      type,
      icontype,
      itemId
    );
    console.log("todoData", todoData);
    res.status(200).json(todoData);
  } catch (error) {
    res.status(error.statusCode).json({ message: error.message });
  }
});

let handleTodo = async (
  complete,
  description,
  enddate,
  startday,
  level,
  title,
  userId,
  type,
  icontype,
  itemId
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let isUserId = await checkUserId(userId);

      if (isUserId) {
        const respond = await db.todos.insertOne({
          complete,
          description,
          enddate,
          startday,
          level,
          title,
          userId,
          type,
          icontype,
          itemId,
        });
        resolve(respond);
      } else {
        reject({ statusCode: 500, message: "User is not exsit!" });
      }
    } catch (error) {
      reject({
        statusCode: 500,
        message: " Error: " + error,
      });
    }
  });
};

let checkUserId = (userIdreq) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.todos.findOne({ userId: userIdreq });
      if (user) {
        resolve(user);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

//update task
todoRouter.put("", async (req, res) => {
  try {
    const id = req.headers.id;

    const body = req.body;

    const filter = {
      _id: new ObjectId(id),
    };
    const updateDoc = {
      $set: body,
    };
    const todo = await db.todos.updateOne(filter, updateDoc);
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json("Some thing went wrong!" + error);
  }
});

//statistic
todoRouter.get("/statistic", async (req, res) => {
  try {
    console.log("req.headers: ", req.headers);
    const userId = req.headers.userid;

    let percent = 0;

    if (userId) {
      const tasks = await db.todos
        .find({
          userId: userId,
        })
        .toArray();
      // const result = checkUserId.length;
      // console.log(result);
      console.log("checkUserId: ", tasks);
      const listTasks = [];
      for (let i = 0; i < tasks.length; i++) {
        console.log("enddateTask: ", tasks[i].enddate);
        let endDate = tasks[i].enddate;
        console.log("enddate: ", endDate);

        endDate = new Date(endDate);
        Year = endDate.getFullYear();
        Month = endDate.getMonth() + 1;
        console.log("year: ", Year);
        console.log("Month: ", Month);

        const monthReq = req.body.Month;
        const yearReq = req.body.year;

        console.log("monthReq: ", monthReq);
        console.log("yearReq: ", yearReq);

        if (Year == yearReq && Month == monthReq) {
          listTasks.push(tasks[i]);
        }
      }
      console.log("listTasks: ", listTasks);

      const totalTasks = listTasks.length;
      console.log("totalTasks: ", totalTasks);

      const listDoneTasks = [];
      for (let i = 0; i < listTasks.length; i++) {
        let completeTask = listTasks[i].complete;
        if (completeTask === "Yes") {
          listDoneTasks.push(completeTask);
        }
      }
      const totalListDoneTask = listDoneTasks.length;

      console.log("listDoneTasks: ", listDoneTasks);

      percent = (totalListDoneTask / totalTasks) * 100;
      console.log("percent", percent);

      // console.log("Date", endDate);
    }

    res.status(200).json({ " Successful": percent });
  } catch (error) {
    res.status(500).json("Some thing went wrong: " + error);
  }
});

module.exports = todoRouter;
