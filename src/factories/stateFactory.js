import newProject from './projectFactory'

function newState (height, width, gridUnit, cornerSize, gapSize, project) {
  const h = height / gridUnit
  const w = width / gridUnit
  const _matrix = []
  for (let i = 0; i < h; i++) {
    const row = []
    for (let j = 0; j < w; j++) {
        row.push(0)
    }
    _matrix.push(row)
  }
  if (project) {
    project.pages[0].children.forEach(el => {
      _matrix[el.top / (gridUnit / 10)][el.left / (gridUnit / 10)] = 1
    })
  }
  return {
    app: {
      svgContent: '',
      apiStatus: false,
      isLoading: false,
      isBlockLoading: false,
      hasChanges: false,
      isSyncing: false,
      canUndo: false,
      canRedo: false,
      openContextMenu: false,
      openSidebar: false,
      squareSize: gridUnit,
      pageDialog: {
        isNew: true,
        isOpen: false
      },
      selectedPage: null,
      selectedElements: [],
      editorZoom: 0.2,
      gridUnit: {
        origin: gridUnit,
        current: gridUnit
      },
      routingUnit: 0.2,
      cornerSize: cornerSize,
      gapSize: gapSize,
      chip: {
        matrix: _matrix,
        height: 40000,
        width: 80000
      },
      stagePosTop: 0,
      stagePosLeft: 0,
      edit: {
        paint: false,
        moveStage: false
      }
    },
    oauth: {
      isAuthorized: false,
      authenticatedUser: null
    },
    project: project || newProject('My Project', gridUnit, cornerSize, gapSize, height, width)
  }
}

export default newState
