/**
 * @typedef{import('./typedef.js')}
 */

/**
 * Class representing an eventful Proxy to the provided Storage object.
 *
 * @extends EventTarget
 */
class EventfulStorage extends EventTarget {
  static STORAGE_EVENT = 'storage';
  #onstorage = null;
  /**
   * Create an eventful Proxy to the provided Storage object.
   *
   * @param {Storage} storage
   */
  constructor(storage) {
    super();
    const storageEventfulInstance = this;
    return new Proxy(storage, {
      /**
       * Proxy trap for the storage object's internal deleteProperty method.
       *
       * @method
       * @param {Storage} target
       * @param {string} property
       * @returns {boolean}
       */
      deleteProperty(target, property) {
        const oldValue = target[property];
        delete target[property];
        storageEventfulInstance.#fire(property, oldValue, target[property]);

        return true;
      },
      /**
       * Proxy trap for the storage object's internal get method.
       *
       * @method
       * @param {Storage} target
       * @param {string} property
       * @returns {string}
       */
      get(target, property) {
        const value = target[property];

        if (property === `on${EventfulStorage.STORAGE_EVENT}`) {
          return storageEventfulInstance.onstorage;
        }

        if (typeof property === 'string' && /^(addEventListener|dispatchEvent|removeEventListener)$/.test(property)) {
          return function(...args) {
            return storageEventfulInstance[property](...args);
          }
        }

        if (typeof value === 'function' && /^(remove|set)Item$/.test(property)) {
          return function(...args) {
            const oldValue = storage.getItem(args[0]);
            const valueToReturn = value.apply(target, args);
            const newValue = storage.getItem(args[0]);

            storageEventfulInstance.#fire(args[0], oldValue, newValue);

            return valueToReturn;
          }
        }

        return value;
      },
      /**
       * Proxy trap for the storage object's internal set method.
       *
       * @method
       * @param {Storage}
       * @param {string} property
       * @param {*} newValue - if newValue is not a string, it is converted to a string
       * @returns {boolean}
       */
      set(target, property, newValue) {
        if (typeof target[property] === 'function') {
          // -------------------------------------------------------------------------------------------------
          // Block overwriting method values (Firefox and JSDOM already do this by default, Chrome does not).
          // -------------------------------------------------------------------------------------------------
          return true;
        }
        if (property === `on${EventfulStorage.STORAGE_EVENT}`) {
          storageEventfulInstance.onstorage = newValue;
        } else {
          const oldValue = target[property];
          target[property] = newValue;
          storageEventfulInstance.#fire(property, oldValue, target[property]);
        }

        return true;
      }
    });
  }
  /**
   * @type {listenerCallback}
   */
  get onstorage() {
    return this.#onstorage;
  }
  set onstorage(value) {
    this.#onstorage = value;
  }
  /**
   * @method
   * @private
   * @param {string} property
   * @param {string|null|undefined} oldValue
   * @param {string|null|undefined} newValue
   * @returns {boolean} isNotCancelled
   */
  #fire(property, oldValue, newValue) {
    if (newValue === oldValue) {
      return;
    }

    const customStorageEvent = new CustomEvent(EventfulStorage.STORAGE_EVENT, {
      detail: {
          key: property,
          newValue: newValue,
          oldValue: oldValue
        }
    });

    this.dispatchEvent(customStorageEvent);

    if (typeof this.onstorage === 'function') {
      this.onstorage(customStorageEvent);
    }

    return true;
  }
}

/**
 * Class representing an eventful Proxy to the localStorage global Storage API.
 *
 * @extends EventfulStorage
 */
class LocalStorageEventful extends EventfulStorage {
  /**
   * Create an eventful Proxy to the localStorage global Storage API.
   */
  constructor() {
    super(localStorage);
  }
}

/**
 * Class representing an eventful Proxy to the sessionStorage global Storage API.
 *
 * @extends EventfulStorage
 */
class SessionStorageEventful extends EventfulStorage {
  /**
   * Create an eventful Proxy to the sessionStorage global Storage API.
   */
  constructor() {
    super(sessionStorage);
  }
}

window.localStorageEventful = new LocalStorageEventful();
window.sessionStorageEventful = new SessionStorageEventful();
