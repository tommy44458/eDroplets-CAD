import newProject from './projectFactory'

function newState (gridUnit, cornerSize, project) {
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
      pageDialog: {
        isNew: true,
        isOpen: false
      },
      selectedPage: null,
      selectedElements: [],
      editorZoom: 0.2,
      gridUnit: gridUnit,
      cornerSize: cornerSize
    },
    oauth: {
      isAuthorized: false,
      authenticatedUser: null
    },
    project: project || newProject('ewod chip project', gridUnit)
  }
}

export default newState
