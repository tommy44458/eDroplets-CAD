/**
 * Keeps an index of all the "types" of functions of the store
 * (Getters, Actions, Mutations --internal/external)
 *
 * TODO: it may be smart to granulate this file (either by type or by context)
 */

// GETTERS
export const getPageIndexById = 'getPageIndexById'
export const getPageById = 'getPageById'
export const pageExists = 'pageExists'
export const pathInUse = 'pathInUse'
export const nameInUse = 'nameInUse'

export const getComponentRefIndexByName = 'getComponentRefIndexByName'
export const getComponentRefByName = 'getComponentRefByName'
export const getComponentRefByIndex = 'getComponentRefByIndex'
export const componentExist = 'componentExist'

export const getSelectedElIndexById = 'getSelectedElIndexById'

// ACTIONS
export const logIn = 'logIn'
export const logOut = 'logOut'
export const checkAuth = 'checkAuth'

export const downloadProjectEWD = 'downloadProjectEWD'
export const downloadProjectEDP = 'downloadProjectEDP'
export const downloadProjectECC = 'downloadProjectECC'
export const downloadProjectDXF = 'downloadProjectDXF'
export const getSVG = 'getSVG'

export const uploadProjectToGH = 'uploadProjectToGH'
export const downloadVueSources = 'downloadVueSources'
export const uploadVueSourcesToGH = 'uploadVueSourcesToGH'
export const checkLastSaved = 'checkLastSaved'
export const syncLocal = 'syncLocal'
export const loadVueggProject = 'loadVueggProject'
export const clearProject = 'clearProject'
export const newProject = 'newProject'

export const savePageAndClose = 'savePageAndClose'
export const duplicatePage = 'duplicatePage'
export const removePage = 'removePage'

export const registerElement = 'registerElement'
export const resizeElement = 'resizeElement'
export const moveElement = 'moveElement'
export const changeElementParent = 'changeElementParent'
export const removeElement = 'removeElement'
export const margeSelectedElements = 'margeSelectedElements'
export const separateElement = 'separateElement'
export const rebaseSelectedElements = 'rebaseSelectedElements'

// MUTATIONS
export const addProject = 'addProject'
export const updateProject = 'updateProject'
export const deleteProject = 'deleteProject'

export const createPage = 'createPage'
export const updatePage = 'updatePage'
export const deletePage = 'deletePage'

export const createEgglement = 'createEgglement'
export const updateElement = 'updateElement'
export const deleteEgglement = 'deleteEgglement'

export const sortSelectedElement = 'sortSelectedElement'

// INTERNAL-MUTATIONS
export const _toggleAuthorizationStatus = '_toggleAuthorizationStatus'
export const _addAuthenticatedUser = '_addAuthenticatedUser'
export const _removeAuthenticatedUser = '_removeAuthenticatedUser'

export const _toggleApiStatus = '_toggleApiStatus'
export const _toggleSvg = '_toggleSvg'
export const _toggleLoadingStatus = '_toggleLoadingStatus'
export const _toggleBlockLoadingStatus = '_toggleBlockLoadingStatus'
export const _toggleHasChanges = '_toggleHasChanges'
export const _toggleIsSyncing = '_toggleIsSyncing'
export const _toggleCanRedo = '_toggleCanRedo'
export const _toggleCanUndo = '_toggleCanUndo'
export const _togglePageDialog = '_togglePageDialog'
export const _updateEditorZoom = '_updateEditorZoom'

export const _changeActivePage = '_changeActivePage'
export const _rebaseActivePage = '_rebaseActivePage'

export const _clearSelectedElements = '_clearSelectedElements'
export const _addSelectedElements = '_addSelectedElements'
export const _addSelectedElement = '_addSelectedElement'
export const _removeSelectedElement = '_removeSelectedElement'

export const _saveComponentRef = '_saveComponentRef'
export const _updateComponentRef = '_updateComponentRef'
export const _removeComponentRef = '_removeComponentRef'

export const _updateGridUnit = '_updateGridUnit'

export const _updateChipMatrix = '_updateChipMatrix'

const types = {
// GETTERS
  getPageIndexById,
  getPageById,
  pageExists,
  pathInUse,
  nameInUse,

  getComponentRefIndexByName,
  getComponentRefByName,
  getComponentRefByIndex,
  componentExist,

  getSelectedElIndexById,

// ACTIONS
  logIn,
  logOut,
  checkAuth,

  downloadVueSources,
  downloadProjectEWD,
  downloadProjectEDP,
  downloadProjectECC,
  downloadProjectDXF,
  getSVG,
  uploadVueSourcesToGH,
  uploadProjectToGH,
  checkLastSaved,
  syncLocal,
  loadVueggProject,
  clearProject,
  newProject,

  savePageAndClose,
  duplicatePage,
  removePage,

  registerElement,
  resizeElement,
  moveElement,
  changeElementParent,
  removeElement,
  margeSelectedElements,
  separateElement,
  rebaseSelectedElements,

// MUTATIONS
  addProject,
  updateProject,
  deleteProject,

  createPage,
  updatePage,
  deletePage,

  createEgglement,
  updateElement,
  deleteEgglement,
  sortSelectedElement,

// INTERNAL-MUTATIONS
  _toggleAuthorizationStatus,
  _addAuthenticatedUser,
  _removeAuthenticatedUser,

  _toggleApiStatus,
  _toggleSvg,
  _toggleLoadingStatus,
  _toggleBlockLoadingStatus,
  _toggleHasChanges,
  _toggleIsSyncing,
  _toggleCanRedo,
  _toggleCanUndo,
  _togglePageDialog,
  _updateEditorZoom,

  _changeActivePage,
  _rebaseActivePage,

  _clearSelectedElements,
  _addSelectedElements,
  _addSelectedElement,
  _removeSelectedElement,

  _saveComponentRef,
  _updateComponentRef,
  _removeComponentRef,

  _updateGridUnit,
  _updateChipMatrix
}

export default types
