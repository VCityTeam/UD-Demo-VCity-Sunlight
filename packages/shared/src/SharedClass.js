/**
 * @class SharedClass is a class which be used by node and browsers interpreters.
 */
module.exports = class SharedClass {
  /**
   * This is a constructor function that takes in a parameter called "caller".
   *
   * @param {string} caller - The "caller" parameter specify what is the package who is calling
   */
  constructor(caller) {
    this.caller = caller;
  }

  /**
   * This is a JavaScript function that logs a message indicating that it is a shared class that can be
   * used by both node and browser packages.
   */
  print() {
    console.log(
      "Hello I'm shared class and i can be used by the node and the browser packages.",
      'Here I am on the ' + this.caller + ' side'
    );
  }
};
