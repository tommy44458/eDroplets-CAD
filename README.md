# DMF-Web-CAD

This is a website-based design tool for EWOD chips. Users can free to draw electrodes with various shapes and get the routing result via the cloud-based algorithm.

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
* **Ctrl [or Meta] + Shift + Z / click icon**: Redo last action

### Paint
* **click icon**: Start/Stop electrode painting mode (add base electrode in mouse point) 

### Combine
* **click icon**: Combine the selected electrodes

### Download
* **click icon**: Download .ewds, .dxf(routing result), .ecc

</br>

### Step-by-step setup

##### 1. Installation
``` bash
# install client dependencies
npm install
```

##### 2. Development
``` bash
# serve the client with hot reload
npm run dev
```
Navigate to `localhost:8080` to serve *client* with hot-reload (development server).

> The above commands should be run in separate terminal instances.

##### 3. Production
``` bash
# build a client for production with minification
npm run build
```
