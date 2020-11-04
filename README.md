## About edrop-design-tool

This is a website-based design tool for EWOD chips, users can free to draw electrodes with various shapes and get the routing result via the cloud-based algorithm.

## Actions

### Select
* **Mouse down + Drag + Mouse up**: Draw a selection area
* **Ctrl [or Meta] + Click**: Select outer-most item, or parent container
* **Ctrl [or Meta] + Shift + Click**: Add [outer-most] item to selection
* **Esc**: Clear selection

### Move
* **Mouse drag & drop**: The standard way
* **ArrowKeys**: Moves the selected elements 1px
* **Shift + ArrowKeys**: Moves the selected elements 10px

### Copy / Cut / paste
* **Ctrl [or Meta] + C**: Copy selection
* **Ctrl [or Meta] + X**: Cut selection
* **Ctrl [or Meta] + V**: paste selection

### Delete
* **Delete [or Backspace]**: Deletes selection

### Undo / Redo
* **Ctrl [or Meta] + Z / click icon**: Undo last action
* **Ctrl [or Meta] + Shift + Z / Click icon**: Redo last action

### Paint
* **Click icon**: Start/Stop electrode painting mode (add base electrode in mouse point) 

### Combine
* **Click icon**: Combine the selected electrodes

### Download
* **Click icon**: Download .ewd, .edp, .dwg(routing result)

<br>

## Run edrop-design-tool locally

### Auto-run
``` bash
# install, build and serve
npm run edrop-design-tool
```
Navigate to `localhost:5000` to serve it.

</br>

### Step-by-step setup

##### 1. installation
``` bash
# install client & server dependencies
npm run install:all

# OR install only client / server
npm run install:client
npm run install:server
```

##### 2. development
``` bash
# serve client with hot reload
npm run client

# start server (auto-restarts on changes)
npm run server
```
Navigate to `localhost:8080` to serve *client* with hot-reload (development server).

> For detailed explanation on how things work on the client side, checkout the **[vuejs-templates/webpack](http://vuejs-templates.github.io/webpack/)** guide and docs for **[vue-loader](http://vuejs.github.io/vue-loader)**.

> For development *server* will only generate vuejs projects (it won't be serving *client* resources). Auto-restart capabilities possible thanks to **[nodemon](https://github.com/remy/nodemon)**.

> The above commands should be run in separate terminal instances.

##### 3. production
``` bash
# build client for production with minification
npm run build

# start server at localhost:5000
npm run start
```
Navigate to `localhost:5000` to serve (a production-ready) edrop-design-tool.