

<p align="center">
  <img width="160px" src="https://github.com/tommy44458/eDroplets-CAD/blob/master/static/edrop_logo.png">
</p>

<h2 align="center">eDroplets CAD</h2>

This website provides a design tool for EWOD chips, allowing users to freely draw electrodes of different shapes and obtain routing results using the cloud-based algorithm.

Experience our cutting-edge CAD service for online digital microfluidic EWOD (Electrowetting on Dielectric) chips optimization: https://dmf-web-cad-git-master-tommy44458s-projects.vercel.app/

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
* **right-click menu**: Combine the selected electrodes

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
