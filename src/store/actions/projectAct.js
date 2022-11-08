import localforage from 'localforage'
import * as download from 'downloadjs'
import showSnackbar from '@/helpers/showSnackbar'
import newState from '@/factories/stateFactory'
import types from '@/store/types'
import store from '@/store'
import api from '@/api'

// import DxfParser from 'dxf-parser'

const generateEWD = function (state) {
  const scale = (80000 / 8000)
  const gapSize = state.project.gapSize * scale
  let electrods = state.project.pages[0].children

  let dataElectrode = ''
    dataElectrode = dataElectrode + 'contactpad circle r 750\n'

    const electrodsShape = {}
    electrods.forEach(el => {
      // console.log(el)
      if (!(el.name in electrodsShape)) {
        electrodsShape[el.name] = []
        let path = ''
        const pathlist = el.children[0].attrs.d.split(' ')
        pathlist.forEach(p => {
          if (p === 'M' || p === 'L') {
            path += p
          } else if (p !== '' && p !== 'Z') {
            path += parseInt(p * scale) + ' '
          } else {
            path += 'Z\n'
          }
        })
        for (let i = 0; i < pathlist.length - 1; i = i + 3) {
          if (pathlist[i] !== '') {
            electrodsShape[el.name].push([parseInt(pathlist[i] * scale), parseInt(pathlist[i + 1] * scale)])
          }
        }
        dataElectrode = dataElectrode + el.name + ' path ' + path
      }
    })
    // dataElectrode = dataElectrode + "square path M0 100 L0 1900 L100 2000 L1900 2000 L2000 1900 L2000 100 L1900 0 L100 0 Z\n";
    dataElectrode = dataElectrode + '#ENDOFDEFINITION#\n'
    let tx = 0
    let ty = 0
    for (var i = 0; i < 8; i++) {
      tx = 0
      for (var j = 0; j < 32; j++) {
        dataElectrode = dataElectrode + 'contactpad ' + tx + ' ' + ty + '\n'
        tx = tx + 2540
      }
      if (ty === 7620) {
        ty = 56896
      } else {
        ty = ty + 2540
      }
    }

    electrods.forEach(getPos)

    function getPos (item, index) {
      dataElectrode = dataElectrode + item.name + ' ' + (parseFloat(item.left) * scale + 1000 - 1630 + gapSize / 2) + ' ' + (parseFloat(item.top) * scale + 12258 + (gapSize / 2)) + '\n'
    }

    dataElectrode = dataElectrode + '#ENDOFLAYOUT#\n'
    dataElectrode = dataElectrode + '0,0,0,0,0,0,0,0;100\n'
    dataElectrode = dataElectrode + '#ENDOFSEQUENCE#'

    return dataElectrode
}

const projectActions = {
  /**
   * Checks if the current project definition (in base64)
   * is the same as the last one saved in GH (also stored in local as base64)
   *
   * As an extra, saves the current b64 project in local as well (as a checkpoint)
   *
   * TODO: review all this check/save workflow since it may get real heavy
   * (alternatives... check after certain time, if there's been changes?)
   */
  [types.checkLastSaved]: async function ({ state, dispatch, commit }) {
    const currentProjectB64 = btoa(JSON.stringify(state.project))
    let lastSavedProjectB64 = await localforage.getItem('gh-last-saved')

    if (currentProjectB64 === lastSavedProjectB64) {
      commit(types._toggleHasChanges, false)
    } else {
      commit(types._toggleHasChanges, true)
    }

    dispatch(types.syncLocal, currentProjectB64)
  },

  /**
   * Syncronizes the local cache of the project definition
   *
   * @param  {string|null} [projectB64] [description]
   */
  [types.syncLocal]: async function ({ state, commit }, projectB64) {
    commit(types._toggleIsSyncing, true)

    let pB64 = projectB64
    if (!pB64) { pB64 = btoa(JSON.stringify(state.project)) }

    await localforage.setItem('local-checkpoint', pB64)
    commit(types._toggleIsSyncing, false)
  },

  /**
   * Uploads the vuegg project definition to github
   * and saves one copy in local storage
   *
   * @param  {string} repoName : name of the repository where to save the vuegg project
   */
  [types.uploadProjectToGH]: async function ({ state, dispatch, commit }, { repoName }) {
    commit(types._toggleLoadingStatus, true)

    const token = await localforage.getItem('gh-token')
    const project = state.project
    const owner = state.oauth.authenticatedUser.login
    // repoNameconst parsedRepoName = project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')

    const projectB64 = btoa(JSON.stringify(project))
    localforage.setItem('gh-last-saved', projectB64)
    localforage.setItem('gh-repo-name', repoName)

    let resp = await api.saveVueggProject(project, owner, repoName, token)

    if (resp) {
      await dispatch(types.checkLastSaved)
      showSnackbar('See your project in GitHub', 'Go', 'https://github.com/' + owner + '/' + repoName)
    } else {
      showSnackbar('Unable to save, please check your permissions',
        'Review', 'https://github.com/settings/connections/applications/' + process.env.CLIENT_ID)
    }

    commit(types._toggleLoadingStatus, false)
  },

  /**
   * Downloads the current vuegg project definition as a .gg (base64 json) file
   *
   * @return {download} : [project-name].gg file containing the vuegg project definition
   */
  [types.downloadProjectEWD]: async function ({ state, dispatch, commit }) {
    commit(types._toggleLoadingStatus, true)
    const parsedRepoName = state.project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')

    const dataElectrode = generateEWD(state)

    // const projectB64 = btoa(data)
    download(dataElectrode, parsedRepoName + '.ewd')
    commit(types._toggleLoadingStatus, false)
  },

  /**
   * Downloads the current vuegg project definition as a .gg (base64 json) file
   *
   * @return {download} : [project-name].gg file containing the vuegg project definition
   */
  [types.downloadProjectEWDS]: async function ({ state, dispatch, commit }) {
    commit(types._toggleLoadingStatus, true)

    const parsedRepoName = state.project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')

    const projectB64 = btoa(JSON.stringify(state.project))
    download(projectB64, parsedRepoName + '.ewds', 'appliction/json')
    commit(types._toggleLoadingStatus, false)
  },

  /**
   * Downloads the current project routing result and electrode position
   * Used for GUI
   *
   * @return {download} : [project-name].ecc file containing routing result and electrode position
   */
  [types.downloadProjectECC]: async function ({ state, dispatch, commit }) {
    commit(types._toggleLoadingStatus, true)
    commit(types._toggleApiStatus, true)

    const parsedRepoName = state.project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')

    const dataElectrode = generateEWD(state)

    const ewd = {
      electrode_size: state.app.gridUnit.origin,
      unit: 4,
      output_format: 'ecc_pattern',
      ewd_content: dataElectrode
    }

    const resp = await api.nrrouter(ewd)

    if (resp.status === 200) {
      download(resp.data, parsedRepoName + '.ecc')
      commit(types._toggleLoadingStatus, false)
    } else {
      commit(types._toggleLoadingStatus, false)
      commit(types._toggleApiStatus, false)
    }
  },

  /**
   * Downloads the current vuegg project definition as a .gg (base64 json) file
   *
   * @return {download} : [project-name].gg file containing the vuegg project definition
   */
  [types.downloadProjectDXF]: async function ({ state, dispatch, commit }) {
    commit(types._toggleLoadingStatus, true)
    commit(types._toggleApiStatus, true)

    const parsedRepoName = state.project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')

    const dataElectrode = generateEWD(state)

    const ewd = {
      electrode_size: state.app.gridUnit.origin,
      unit: 4,
      output_format: 'dxf',
      ewd_content: dataElectrode
    }

    const resp = await api.nrrouter(ewd)

    if (resp.status === 200) {
      download(resp.data, parsedRepoName + '.dxf')
      commit(types._toggleLoadingStatus, false)
      return true
    } else {
      commit(types._toggleLoadingStatus, false)
      commit(types._toggleApiStatus, false)
      return false
    }
  },

  /**
   * Downloads the current vuegg project definition as a .gg (base64 json) file
   *
   * @return {download} : [project-name].gg file containing the vuegg project definition
   */
   [types.getSVG]: async function ({ state, dispatch, commit }) {
    commit(types._toggleLoadingStatus, true)
    commit(types._toggleApiStatus, true)

    const dataElectrode = generateEWD(state)

    const ewd = {
      electrode_size: state.app.gridUnit.origin,
      unit: 4,
      output_format: 'svg',
      ewd_content: dataElectrode
    }

    const resp = await api.nrrouter(ewd)
    if (resp.status === 200) {
      commit(types._toggleSvg, resp.data)
      commit(types._toggleLoadingStatus, false)
      return true
    } else {
      commit(types._toggleLoadingStatus, false)
      commit(types._toggleApiStatus, false)
      return false
    }
  },

  /**
   * Loads a previously saved vuegg project.
   * If origin is not passed through, the project will load from local by default
   *
   * @param {string} origin : From where the project is beign loaded (local, pc, github)
   * @param {string|null} [owner] : (github-origin) Github login (username) of the repository
   * @param {string|null} [repo] : (github-origin) Repository name from where to fetch project (vue.gg)
   * @param {string|null} [repo] : (github-origin) Repository name from where to fetch project (vue.gg)
   * @param {string|null} [content] : (pc-origin) The content of the selected file
   */
  [types.loadVueggProject]: async function ({ state, dispatch, commit }, { origin, userName, repoName, content }) {
    commit(types._toggleBlockLoadingStatus, true)
    let project
    switch (origin) {
      case 'local': project = await localforage.getItem('local-checkpoint'); break
      case 'pc': project = content; break
      default: project = await localforage.getItem('local-checkpoint')
    }

    if (project) {
      const _project = JSON.parse(atob(project))
      if (!_project.gridUnit || !_project.chip) {
        store.replaceState(newState(
            parseInt(state.app.chip.height),
            parseInt(state.app.chip.width),
            parseInt(2000),
            parseInt(3),
            parseInt(3),
            null
        ))
        commit(types.addProject)
      } else {
        store.replaceState(newState(parseInt(_project.chip.height), parseInt(_project.chip.width), parseInt(_project.gridUnit), _project.cornerSize, _project.gapSize, _project))
        commit(types.addProject)
        await dispatch(types.checkAuth)
      }
    } else {
        store.replaceState(newState(
            parseInt(state.app.chip.height),
            parseInt(state.app.chip.width),
            parseInt(2000),
            parseInt(3),
            parseInt(3),
            null
        ))
        commit(types.addProject)
        // await dispatch(types.checkAuth)
    }
    commit(types._toggleBlockLoadingStatus, false)
  },

  /**
   * Clears the editing project from vuegg and replaces it with a plain one.
   * (or better to say, resets vuegg to initial state)
   */
  [types.resetProject]: async function ({ state, dispatch }) {
    await dispatch(types.newProject, {
        height: state.app.chip.height,
        width: state.app.chip.width,
        gridUnit: state.app.gridUnit ? state.app.gridUnit.origin : 2000,
        cornerSize: state.app.cornerSize,
        gapSize: state.app.gapSize
    })
  },

  /**
   * Clears the editing project from vuegg and replaces it with a plain one.
   * (or better to say, resets vuegg to initial state)
   */
  [types.newProject]: async function ({ dispatch, commit }, payload) {
    const { height, width, gridUnit, cornerSize, gapSize } = payload
    commit(types._toggleBlockLoadingStatus, true)

    store.replaceState(newState(height, width, gridUnit, cornerSize, gapSize))
    commit(types.deleteProject)

    await dispatch(types.checkAuth)
    commit(types._toggleBlockLoadingStatus, false)
  }
}

export default projectActions
