Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
// this code only runs on the client
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
      Tasks.insert({
        text: text,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.word.value = ""
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.events ({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Tasks.update(this._id, {
        $set: {checked: ! this.checked}
      });
    },
    "click .delete": function () {
      Tasks.remove(this._id);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
