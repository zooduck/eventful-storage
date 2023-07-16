/* -------------------------------- */
/* @zooduck/eventful-storage v0.0.1 */
/* -------------------------------- */
class EventfulStorage extends EventTarget {
  static STORAGE_EVENT = 'storage';
  #onstorage = null;
  constructor(storage) {
    super();
    const storageEventfulInstance = this;
    return new Proxy(storage, {
      deleteProperty(target, property) {
        const oldValue = target[property];
        delete target[property];
        storageEventfulInstance.#fire(property, oldValue, target[property]);
        return true;
      },
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
      set(target, property, newValue) {
        if (typeof target[property] === 'function') {
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
  get onstorage() {
    return this.#onstorage;
  }
  set onstorage(value) {
    this.#onstorage = value;
  }
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
class LocalStorageEventful extends EventfulStorage {
  constructor() {
    super(localStorage);
  }
}
class SessionStorageEventful extends EventfulStorage {
  constructor() {
    super(sessionStorage);
  }
}
window.localStorageEventful = new LocalStorageEventful();
window.sessionStorageEventful = new SessionStorageEventful();