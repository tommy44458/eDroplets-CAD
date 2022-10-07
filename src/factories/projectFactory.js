import shortid from 'shortid'
import newPage from './pageFactory'

function newProject (title, gridUnit, cornerSize, gapSize, height, width) {
  return {
    id: shortid.generate(),
    title: title,
    gridUnit: gridUnit,
    cornerSize: cornerSize,
    gapSize: gapSize,
    chip: {
      height: height,
      width: width
    },
    components: [],
    pages: [newPage('Layer1', '/', gridUnit, height, width)]
  }
}

export default newProject
