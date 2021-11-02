import shortid from 'shortid'
import newPage from './pageFactory'

function newProject (title, gridUnit) {
  return {
    id: shortid.generate(),
    title: title,
    gridUnit: gridUnit,
    components: [],
    pages: [newPage('Layer1', '/', gridUnit)]
  }
}

export default newProject
