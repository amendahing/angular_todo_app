var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session");
var path = require('path');

var app = express();

app.use(express.static( __dirname + '/public/dist' ));
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.use(bodyParser.json());
mongoose.connect("mongodb://localhost/notes");

// ---------------- DEFINE SCHEMA ---------------- //

var TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, midlength: 3 },
  detail: { type: String, required: true, midlength: 3 },
  dueDate: { type: Date, required: true }
});

mongoose.model("Task", TaskSchema);
var Task = mongoose.model("Task");


// ---------------- SET ROOT ROUTE ---------------- //

app.get("/", (req, res) => {
  res.send("Hello!");
});

// -------------- RETRIEVE ALL TASKS ------------- //

app.get("/tasks", (req, res) => {
  Task.find({}).sort('dueDate').exec(function(err, tasks) {
    if (err) {
      console.log("Unable to retrieve tasks");
      res.json({message: "Error", data: err})
    } else {
      var all_tasks = tasks;
      res.json({message: "Success", data: tasks})
      // console.log(tasks);
    }
  });
});

// ---------------- ADD NEW TASK ---------------- //

app.post("/process_task", (req, res) => {
  console.log('Hit the server!', req.body);

  var task = new Task({
      title: req.body.title,
      detail: req.body.detail,
      dueDate: req.body.dueDate
  })

  task.save(function(err, data){
      if(err){
          console.log('Task not added to db...');
          res.json({message: "Task not saved", error: err})
      }
      else{
          console.log('successfully added task!')
          res.json(data)
      }
  })


});

// ---------------- REMOVE TASK ---------------- //

app.delete('/task/delete/:id', (req, res) => {
    Task.remove({_id: req.params.id}, function(err, data) {
        if(err){
            console.log("Unable to remove task");
            res.send({message: "error", error: err})
        }
        else{
            console.log('removed', req.params.id)
            res.json({message: "Removed!"})
        }
    })


})

// ---------------- EDIT TASK ---------------- //

app.get("/tasks/edit/:id", (req, res) => {
    console.log("Hit the server for finding task", req.params.id)
    Task.findOne({_id: req.params.id}, (err, task) => {
        if(err){
            console.log("Unable to find task", req.params.id );
            res.send({message: "Unable to find task", error: err})
        }
        else {
            console.log("Success! Here is the task", task)
            res.send({message: "Success", data: task})
        }
    })
})

app.put('/tasks/edit/:id', (req, res) => {
    console.log("Hit the server", req.body)
    console.log(req.body.title, req.body.detail)
    console.log(req.body._id)

    Task.find({_id: req.body._id}, (err, data) => {
        if(err){
            res.status(500).send(err)
        }
        else {
            Task.update({_id: req.body._id}, {title: req.body.title, detail: req.body.detail, dueDate: req.body.dueDate},
                function (err, data) {
                    if (err) { res.json({message: "Error updated", error: err}) }
                    else { res.json({message: "Updated", task: data}) }
                }
            )
        }
    })
})


app.get('/tasks/day/:day', (req,res) => {
    console.log('Hit the server, day:', req.params.day);
    Task.find({dueDate: req.params.day}, (err, data) => {
        if (err){
            console.log({message: "Error in finding day of week", error: err})
        }
        else{
            console.log("Found Tasks!", data)
            res.send({message: "Success", data: data})
        }
    })
})

// ----------------- SET PORT ----------------- //

app.listen(8000, () => console.log(`Listening on Port 8000 ...`));
