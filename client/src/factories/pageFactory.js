import shortid from 'shortid'

function newPage (name, path, height, width) {
  return {
    id: shortid.generate(),
    name: name,
    path: path,
    width: width || '100%',
    height: height || '70%',
    styles: {
      '--mdc-theme-primary': '#673ab7',
      '--mdc-theme-secondary': '#f44336',
      '--mdc-theme-background': '#ffffff',
      'position': 'relative',
      'margin': 'auto',
      'background-color': '#ffffff',
      'background-image':
        'linear-gradient(rgba(0,0,0,.1) 1px, transparent 0),' +
        'linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 0),' +
        'linear-gradient(rgba(0,0,0,.15) 1px, transparent 0),' +
        'linear-gradient(90deg, rgba(0,0,0,.15) 1px, transparent 0)',
      'background-size': '10px 10px, 10px 10px, 50px 50px, 50px 50px',
      'overflow': 'hidden'
    },
    classes: [],
    children: []
  }
}

export default newPage
