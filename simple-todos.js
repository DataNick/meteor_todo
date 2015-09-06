Tasks = new Mongo.Collection("tasks");

if (Meteor.isServer) {
    // code to run on server at startup
    // Only publish tasks that are public or belong to the current user
    Meteor.publish("tasks", function () {
      return Tasks.find({
        $or: [
          { private: {$ne: true} },
          { owner: this.userId }
        ]
      });
    });
}

if (Meteor.isClient) {
// this code only runs on the client
  Meteor.subscribe("tasks");

  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        //if hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});

} else {
        return Tasks.find({}, {sort: {createdAt: -1}});
        }
      },
      hideCompleted: function () {
        return Session.get("hideCompleted");
      },
      incompleteCount: function () {
        return Tasks.find({checked: {$ne: true}}).count();
      }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      console.log(event);
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.word.value;

      // Insert task into the collection
      Meteor.call("addTask", text);

      // Clear form
      event.target.word.value = ""
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Template.task.events ({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

  Meteor.methods ({
    addTask: function (text) {
      // Make sure user is logged in before submitting a task
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
      Tasks.insert({
        text: text,
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().username
      });
    },
    deleteTask: function (taskId) {
      var task = Tasks.findOne(taskId);
      if (task.private && task.owner !== Meteor.userId()) {
        // if the task is private, make sure only the user can delete it
        throw new Meteor.Error("not-authorized"); 
      }
      if (task.owner === Meteor.userId()) {
        Tasks.remove(taskId);
      }
    },
    setChecked: function (taskId, setChecked) {
      var task = Tasks.findOne(taskId);
      if (task.private && task.owner !== Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
      if (task.owner === Meteor.userId()) {
      Tasks.update(taskId, { $set: { checked: setChecked} }); 
      }
    },
    setPrivate: function (taskId, setToPrivate) {
      var task = Tasks.findOne(taskId);
      // make sure only task owner can make task private
      if (task.owner !== Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
      Tasks.update(taskId, { $set: { private: setToPrivate} }); 
    }
  });

