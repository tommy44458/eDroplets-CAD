import newProject from './projectFactory'

function newState (project) {
  return {
    app: {
      svgContent: '123',
      apiStatus: true,
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
      unit: 200
    },
    oauth: {
      isAuthorized: false,
      authenticatedUser: null
    },
    project: project || newProject('ewod chip project')
  }
}

export default newState
