# Pixel Craft

## Running server

Install modules

```
npm install
```

Start server

```
node index.js
```

## Additional Setup

Create a static/uploads directory to store design screenshots.

## Compiling sass files

```
npm run sass
```

Requires that the sass ruby gem be install

## Environment variables

- IMAGE_STORE_URL must be set to couchdb url (with database name) i.e. http://local:host@localhost:5984/image_store
- TWITTER_APP_TOKEN must be set to Twitter application's consumer key
- TWITTER_APP_SECRET must be set to Twitter application's consumer secret

## Data Structure

Data will be stored in a three-dimensional array based on the format
ScriptCraft uses to export data to the clipboard. Our readArt method will
eventually grab this JSON data remotely, assign it to a __data variable, then
add the direction the user is currently facing dynamically before adding to the
clipboard and pasting. This will need to happen each time it is pasted, and
should also include whether you're placing the design on the wall or floor to
determine if the arrays should be reordered before pasting. By default, they
will render two dimensionally on the floor, with the option to render on the
wall. The data structure should be formatted as follows:

```javascript
__data = {
  blocks: [
    [
      [//first width block user is pointing at, subsequent blocks placed on depth axis],
      [// first width block user is pointing at, next block height, subsequent blocks placed on depth axis]
    ], [
      [// second width block user is pointing at, subsequent blocks placed on depth axis],
      [// second width block user is pointing at, next block height, subsequent blocks placed on depth axis]
    ]
  ],
  dir: // 0 - 3, should be filled in from current direction of user and not saved in data
}
```
