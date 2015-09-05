Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
// this code only runs on the client
  Template.body.helpers({
    tasks: function () {
      return Tasks.find({}, {sort: {createdAt: -1}});
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

    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
