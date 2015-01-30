/**
 * An event emitter class
 * 
 * @returns Emitter
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(function () {
  /**
   * Constructor
   */
  function Emitter () {
    this.listeners = [];
  }

  // TODO somehow restrict the events that can be emitted. This has to be
  // visible to the user (i.e. programmers)!

  /**
   * Emits an event to all registered listeners by calling the callback
   * functions of format 'on'+event, if available
   * 
   * The callback functions' parameters are the emitter (this) and the event
   * string (without 'on'), in this order.
   * 
   * @param event
   *          a string containing the name of the event. Callback functions need
   *          to have a function name in the format 'on'+event
   * @param data
   *          arbitrary additional data. Please keep it simple!
   * @returns true if the some listener received the event, false otherwise
   */
  Emitter.prototype.emit = function (event, data) {
    var success;

    success = false;

    this.listeners.map(function (listener) {
      if (listener['on' + event]) {
        listener['on' + event].call(listener, this, event, data);
        success = true;
      }
    }, this);

    return success;
  };

  /**
   * register an event listener
   * 
   * @param listener
   *          an event listener instance, which should define the necessary
   *          callback functions
   * @returns this
   */
  Emitter.prototype.registerListener = function (listener) {
    this.unregisterListener(listener);
    this.listeners.push(listener);

    return this;
  };

  /**
   * Makes sure that the event listener is not receiving event callbacks anymore
   * 
   * @param listener
   *          an instance of the View class, which may have already been
   *          registered
   * @returns this
   */
  Emitter.prototype.unregisterListener = function (listener) {
    var index;

    index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }

    return this;
  };

  return Emitter;
});
