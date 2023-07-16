/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import './eventfulStorage.globals.js';

describe('localStorageEventful / sessionStorageEventful', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  describe('methods', () => {
    it.each([
      ['localStorage', window.localStorageEventful],
      ['sessionStorage', window.sessionStorageEventful]
    ])('it should not be possible to overwrite %s storage methods', async (_storageType, storageEventful) => {
      ['clear', 'getItem', 'removeItem', 'setItem'].forEach((methodName) => {
        expect(typeof storageEventful[methodName]).toBe('function');

        storageEventful[methodName] = 1;

        expect(typeof storageEventful[methodName]).toBe('function');
      });
    });
    describe('setItem', () => {
      it.each([
        ['localStorage', window.localStorage, window.localStorageEventful],
        ['sessionStorage', window.sessionStorage, window.sessionStorageEventful]
      ])('it should modify the %s storage area', (_storageType, storage, storageEventful) => {
        expect(storage.getItem('test')).toEqual(null);
        expect(storageEventful.getItem('test')).toEqual(null);

        storageEventful.setItem('test', 123);

        expect(storage.getItem('test')).toEqual('123');
        expect(storageEventful.getItem('test')).toEqual('123');
      });
    });
    describe('removeItem', () => {
      it.each([
        ['localStorage', window.localStorage, window.localStorageEventful],
        ['sessionStorage', window.sessionStorage, window.sessionStorageEventful]
      ])('it should modify the %s storage area', (_storageType, storage, storageEventful) => {
        expect(storage.getItem('test')).toEqual(null);
        expect(storageEventful.getItem('test')).toEqual(null);

        storageEventful.setItem('test', 123);

        expect(storage.getItem('test')).toEqual('123');
        expect(storageEventful.getItem('test')).toEqual('123');

        storageEventful.removeItem('test');

        expect(storage.getItem('test')).toEqual(null);
        expect(storageEventful.getItem('test')).toEqual(null);
      });
    });
    describe('clear', () => {
      it.each([
        ['localStorage', window.localStorage, window.localStorageEventful],
        ['sessionStorage', window.sessionStorage, window.sessionStorageEventful]
      ])('it should clear the %s storage area', (_storageType, storage, storageEventful) => {
        storageEventful.setItem('a', 123);
        storageEventful.setItem('b', 234);

        expect(storage.length).toEqual(2);
        expect(storageEventful.length).toEqual(2);

        storageEventful.clear();

        expect(storage.length).toEqual(0);
        expect(storageEventful.length).toEqual(0);
      });
    });
  });
  describe('events', () => {
    describe('storage', () => {
      it.each([
        ['localStorage', window.localStorageEventful],
        ['sessionStorage', window.sessionStorageEventful]
      ])('it should fire when the %s storage area is modified', (_storageType, storageEventful) => {
        const mockListener = jest.fn().mockImplementation((event) => {
          return event.detail;
        });
        storageEventful.addEventListener('storage', mockListener);
        expect(mockListener).toHaveBeenCalledTimes(0);
        storageEventful.setItem('test', 123);
        storageEventful.setItem('test', 123);
        storageEventful.setItem('test', 123);
        expect(mockListener).toHaveBeenCalledTimes(1);
        expect(mockListener).toHaveReturnedWith({ key: 'test', oldValue: null, newValue: '123' });
        storageEventful.removeItem('test');
        expect(mockListener).toHaveBeenCalledTimes(2);
        expect(mockListener).toHaveReturnedWith({ key: 'test', oldValue: '123', newValue: null });
      });
    });
    describe('onstorage', () => {
      it.each([
        ['localStorage', window.localStorageEventful],
        ['sessionStorage', window.sessionStorageEventful]
      ])('it should fire when the %s storage area is modified', (_storageType, storageEventful) => {
        const mockListener = jest.fn().mockImplementation((event) => {
          return event.detail;
        });
        storageEventful.onstorage = mockListener;
        expect(storageEventful.onstorage).toBe(mockListener);
        expect(mockListener).toHaveBeenCalledTimes(0);
        storageEventful.setItem('test', 123);
        storageEventful.setItem('test', 123);
        storageEventful.setItem('test', 123);
        expect(mockListener).toHaveBeenCalledTimes(1);
        expect(mockListener).toHaveReturnedWith({ key: 'test', oldValue: null, newValue: '123' });
        storageEventful.removeItem('test');
        expect(mockListener).toHaveBeenCalledTimes(2);
        expect(mockListener).toHaveReturnedWith({ key: 'test', oldValue: '123', newValue: null });
      });
      describe('methods', () => {
        describe('addEventListener', () => {
          it.each([
            ['localStorageEventful', 'localStorage', window.localStorageEventful],
            ['sessionStorageEventful', 'sessionStorage', window.sessionStorageEventful]
          ])('it should let you add an event listener to the %s %s proxy', (_storageProxy, _storageType, storageEventful) => {
            const mockListener = jest.fn();
            storageEventful.addEventListener('storage', mockListener);
            expect(mockListener).toHaveBeenCalledTimes(0);
            storageEventful.setItem('test', 123);
            expect(mockListener).toHaveBeenCalledTimes(1);
          });
        });
        describe('dispatchEvent', () => {
          it.each([
            ['localStorageEventful', 'localStorage', window.localStorageEventful],
            ['sessionStorageEventful', 'sessionStorage', window.sessionStorageEventful]
          ])('it should let you programmatically dispatch events from the %s %s proxy', (_storageProxy, _storageType, storageEventful) => {
            const mockListener = jest.fn();
            storageEventful.addEventListener('test', mockListener);
            expect(mockListener).toHaveBeenCalledTimes(0);
            storageEventful.dispatchEvent(new CustomEvent('test'));
            expect(mockListener).toHaveBeenCalledTimes(1);
          });
        });
        describe('removeEventListener', () => {
          it.each([
            ['localStorageEventful', 'localStorage', window.localStorageEventful],
            ['sessionStorageEventful', 'sessionStorage', window.sessionStorageEventful]
          ])('it should let you remove an event listener from the %s %s proxy', (_storageProxy, _storageType, storageEventful) => {
            const mockListener = jest.fn();
            storageEventful.addEventListener('storage', mockListener);
            expect(mockListener).toHaveBeenCalledTimes(0);
            storageEventful.setItem('test', 123);
            expect(mockListener).toHaveBeenCalledTimes(1);
            storageEventful.removeEventListener('storage', mockListener);
            storageEventful.setItem('test', 123456);
            expect(mockListener).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
  describe('property mutators (setters)', () => {
    it.each([
      ['localStorage', window.localStorage, window.localStorageEventful],
      ['sessionStorage', window.sessionStorage, window.sessionStorageEventful]
    ])('it should let you modify the %s storage area using property mutators (although you should never do this)', (_storageType, storage, storageEventful) => {
      const mockListener = jest.fn().mockImplementation((event) => {
        return event.detail;
      });
      storageEventful.addEventListener('storage', mockListener);
      expect(storage.test).toBeUndefined();
      expect(storageEventful.test).toBeUndefined();
      expect(mockListener).toHaveBeenCalledTimes(0);
      storageEventful.test = 123;
      expect(storage.test).toEqual('123');
      expect(storageEventful.test).toEqual('123');
      expect(storage.getItem('test')).toEqual('123');
      expect(storageEventful.getItem('test')).toEqual('123');
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveReturnedWith({ key: 'test', newValue: '123', oldValue: undefined });
      delete storageEventful.test;
      expect(storage.test).toBeUndefined();
      expect(storageEventful.test).toBeUndefined();
      expect(storage.getItem('test')).toBeNull();
      expect(storageEventful.getItem('test')).toBeNull();
      expect(mockListener).toHaveBeenCalledTimes(2);
      expect(mockListener).toHaveReturnedWith({ key: 'test', newValue: undefined, oldValue: '123' });
    });
  });
});
