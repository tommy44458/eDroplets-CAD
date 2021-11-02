import shortid from 'shortid'

function newPage (name, path, gridUnit, height, width) {
  return {
    id: shortid.generate(),
    name: name,
    path: path,
    width: '8000px', // width || '100%', 10x
    height: '4000px', // height || '70%', 10x

    styles: {
      '--mdc-theme-primary': '#673ab7',
      '--mdc-theme-secondary': '#f44336',
      '--mdc-theme-background': '#ffffff',
      'position': 'relative',
      'margin': 'auto',
      'background-color': '#ced4b2',
      'background-image':
        'linear-gradient(rgba(0,0,0,.1) 2px, transparent 0),' +
        'linear-gradient(90deg, rgba(0,0,0,.1) 2px, transparent 0),' +
        'linear-gradient(rgba(0,0,0,.15) 2px, transparent 0),' +
        'linear-gradient(90deg, rgba(0,0,0,.15) 2px, transparent 0)',
      'background-size': gridUnit + 'px ' + gridUnit + 'px, ' + gridUnit + 'px ' + gridUnit + 'px, ' + (2 * gridUnit) + 'px ' + (2 * gridUnit) + 'px, ' + (2 * gridUnit) + 'px ' + (2 * gridUnit) + 'px',
      'overflow': 'scroll' // 'hidden',
    },
    classes: [],
    children: []
  }
}

export default newPage
