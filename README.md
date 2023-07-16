# zooduck/eventful-storage

Adds eventful proxies for `localStorage` and `sessionStorage` to the global namespace.

## Installation

### For users with an access token

Add a `.npmrc` file to your project, with the following lines:

```text
@zooduck:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_ACCESS_TOKEN
```

Install from the command line:

```node
npm install @zooduck/eventful-storage@latest
```

Install via package.json:

```json
"@zooduck/eventful-storage": "latest"
```

### For users without an access token

Clone or [Download](https://github.com/zooduck/eventful-storage/archive/refs/heads/master.zip) the repository to your machine.

## Getting started

Copy the `eventful-storage` folder to your project.

## Import

Import using a module file:

```javascript
import 'path/to/eventful-storage/dist/index.module.js'
```

Import using a module script:

```html
<script src="path/to/eventful-storage/dist/index.module.js" type="module"></script>
```

## Globals

### localStorageEventful

Can be accessed via `window.localStorageEventful` or `localStorageEventful`.

### sessionStorageEventful

Can be accessed via `window.sessionStorageEventful` or `sessionStorageEventful`.

## Event handling

Both proxies implement the `EventTarget` API and dispatch a custom `storage` event when the storage area is modified.

They also include a mock implementation of an `onstorage` "onevent" property.

The event includes a `detail` object with the following format:

```javascript
{
  key: string,
  newValue: string,
  oldValue: string
}
```

## Examples

```javascript
import 'path/to/storage-eventful/dist/index.module.js'

// Using addEventListener():
localStorageEventful.addEventListener('storage', (event) => {
  console.log(event.detail)
})

// Using the onstorage "onevent" property:
localStorageEventful.onstorage = (event) => {
  console.log(event.detail.newValue)
}

localStorageEventful.setItem('a', 1)

// Logs: { key: 'a', newValue: '1', oldValue: null }
// Logs: '1'
```

## Additional information

These `storage` events should not be confused with the `storage` event of the window, which is fired when a storage area has been modified in the context of another document.
