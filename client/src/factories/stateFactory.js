import newProject from './projectFactory'

function newState (height, width, gridUnit, cornerSize, project) {
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
      originalGridUnit: gridUnit,
      gridUnit: gridUnit,
      cornerSize: cornerSize,
      chip: {
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
    project: project || newProject('ewod chip project', gridUnit, height, width)
  }
}

export default newState
