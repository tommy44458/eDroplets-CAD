import shortid from 'shortid'

function newPage (name, path, gridUnit, height, width) {
  const unit = gridUnit / 10
  return {
    id: shortid.generate(),
    name: name,
    path: path,
    width: width / 10 + 'px', // 8000 px == 80000 um
    height: height / 10 + 'px', // 4000 px == 40000 um

    styles: {
      '--mdc-theme-primary': '#673ab7',
      '--mdc-theme-secondary': '#f44336',
      '--mdc-theme-background': '#ffffff',
      'position': 'relative',
      'margin': 'auto',
      'background-color': '#ced4b2',
      // 'background-image':
      //   'linear-gradient(rgba(0,0,0,.1) 2px, transparent 2px),' +
      //   'linear-gradient(90deg, rgba(0,0,0,.1) 2px, transparent 2px),' +
      //   'linear-gradient(rgba(0,0,0,.15) 2px, transparent 2px),' +
      //   'linear-gradient(90deg, rgba(0,0,0,.15) 2px, transparent 2px)',
      'background-size': unit + 'px ' + unit + 'px, ' + unit + 'px ' + unit + 'px, ' + (2 * unit) + 'px ' + (2 * unit) + 'px, ' + (2 * unit) + 'px ' + (2 * unit) + 'px',
      'overflow': 'scroll' // 'hidden',
    },
    classes: [],
    children: []
  }
}

export default newPage
