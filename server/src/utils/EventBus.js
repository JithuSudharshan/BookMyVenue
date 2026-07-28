import EventEmitter from 'events';

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    // Increase limit if many listeners are attached
    this.setMaxListeners(20);
  }

  /**
   * Publish a domain event.
   * @param {string} eventName - The name of the event (use DOMAIN_EVENTS constant)
   * @param {Object} payload - The event payload
   */
  publish(eventName, payload) {
    // We wrap emit in a setImmediate or nextTick so that event handlers run 
    // asynchronously and don't block or crash the main execution pipeline.
    setImmediate(() => {
      try {
        this.emit(eventName, payload);
      } catch (error) {
        console.error(`[EventBus] Error emitting event ${eventName}:`, error);
      }
    });
  }
}

export default new DomainEventBus();
