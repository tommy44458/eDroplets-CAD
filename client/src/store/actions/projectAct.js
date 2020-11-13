import localforage from 'localforage'
import * as download from 'downloadjs'
import showSnackbar from '@/helpers/showSnackbar'
import newState from '@/factories/stateFactory'
import types from '@/store/types'
import store from '@/store'
import api from '@/api'

import DxfParser from 'dxf-parser'
import { dxfToSvg } from './dxf'

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
  [types.downloadProject]: async function ({ state, dispatch, commit }) {
    commit(types._toggleLoadingStatus, true)

    const parsedRepoName = state.project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')

    // console.log('**************************')
    // let resp = await api.test()
    // console.log(resp)

    // customer
    console.log(JSON.stringify(state.project))

    // const projectB64 = btoa(JSON.stringify(state.project))
    // download(projectB64, parsedRepoName + '.ewd', 'appliction/json')

    var electrods = state.project.pages[0].children

    var dataElectrode = ''
    dataElectrode = dataElectrode + 'contactpad circle r 750\n'
    dataElectrode = dataElectrode + 'base path M0 100 L0 1900 L100 2000 L1900 2000 L2000 1900 L2000 100 L1900 0 L100 0 Z\n'
    dataElectrode = dataElectrode + 'customer2 path M0 100 L0 3905 L100 4005 L1900 4005 L2000 3905 L2000 2000 L4005 2000 L4005 3905 L4105 4005 L5905 4005 L6005 3905 L6005 100 L5905 0 L100 0 Z\n'
    dataElectrode = dataElectrode + 'customer1 path M0 100 L0 5910 L100 6010 L3905 6010 L4005 5910 L4005 4110 L3905 4010 L2000 4010 L2000 2000 L3905 2000 L4005 1900 L4005 100 L3905 0 L100 0 Z\n'
    dataElectrode = dataElectrode + 'customer3 path M0 100 L0 9920 L100 10020 L5910 10020 L6010 9920 L6010 100 L5910 0 L100 0 Z\n'
    dataElectrode = dataElectrode + 'Referenceelectrode path M0 0 L0 10000 L10000 10000 L10000 0 Z\n'

    electrods.forEach(el => {
      console.log(el)
      if (el.name !== 'base' && el.name !== 'customer1' && el.name !== 'customer2' && el.name !== 'customer3') {
        let path = ''
        const pathlist = el.children[0].attrs.d.split(' ')
        pathlist.forEach(p => {
          if (p !== '') {
            path += p + '00 '
          } else {
            path += 'Z\n'
          }
        })
        dataElectrode = dataElectrode + el.name + ' path ' + path
      }
    })
    // dataElectrode = dataElectrode + "square path M0 100 L0 1900 L100 2000 L1900 2000 L2000 1900 L2000 100 L1900 0 L100 0 Z\n";
    dataElectrode = dataElectrode + '#ENDOFDEFINITION#\n'
    var tx = 0
    var ty = 0
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
      dataElectrode = dataElectrode + item.name + ' ' + (parseFloat(item.left) * parseFloat(80000 / 800) + parseFloat(-50)) + ' ' + (parseFloat(item.top) * parseFloat(40000 / 400) + parseFloat(12255)) + '\n'
    }

    dataElectrode = dataElectrode + 'Referenceelectrode -14835 13689\n'
    dataElectrode = dataElectrode + '#ENDOFLAYOUT#\n'
    dataElectrode = dataElectrode + '0,0,0,0,0,0,0,0;100\n'
    dataElectrode = dataElectrode + '#ENDOFSEQUENCE#'

    console.log(dataElectrode)

    // const projectB64 = btoa(data)
    download(dataElectrode, parsedRepoName + '.ewd')

    commit(types._toggleLoadingStatus, false)
  },

/**
 * Downloads the current vuegg project definition as a .gg (base64 json) file
 *
 * @return {download} : [project-name].gg file containing the vuegg project definition
 */
[types.downloadProject2]: async function ({ state, dispatch, commit }) {
  commit(types._toggleLoadingStatus, true)

  const parsedRepoName = state.project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')

  // customer

  const projectB64 = btoa(JSON.stringify(state.project))
  download(projectB64, parsedRepoName + '.edp', 'appliction/json')
  commit(types._toggleLoadingStatus, false)
},

/**
 * Downloads the current vuegg project definition as a .gg (base64 json) file
 *
 * @return {download} : [project-name].gg file containing the vuegg project definition
 */
[types.downloadProject3]: async function ({ state, dispatch, commit }) {
  commit(types._toggleLoadingStatus, true)
  commit(types._toggleApiStatus, true)

  const parsedRepoName = state.project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')

  // axios.get('http://localhost:3000/api/todo', {
  // })
  // .then(function (response) {
  //   console.log(response)
  // })
  // .catch(function (error) {
  //   console.log(error)
  // })

  var electrods = state.project.pages[0].children

  var dataElectrode = ''
  dataElectrode = dataElectrode + 'contactpad circle r 750\n'
  // dataElectrode = dataElectrode + 'base path M0 100 L0 1900 L100 2000 L1900 2000 L2000 1900 L2000 100 L1900 0 L100 0 Z\n'
  // dataElectrode = dataElectrode + 'customer2 path M0 100 L0 3905 L100 4005 L1900 4005 L2000 3905 L2000 2000 L4005 2000 L4005 3905 L4105 4005 L5905 4005 L6005 3905 L6005 100 L5905 0 L100 0 Z\n'
  // dataElectrode = dataElectrode + 'customer1 path M0 100 L0 5910 L100 6010 L3905 6010 L4005 5910 L4005 4110 L3905 4010 L2000 4010 L2000 2000 L3905 2000 L4005 1900 L4005 100 L3905 0 L100 0 Z\n'
  // dataElectrode = dataElectrode + 'customer3 path M0 100 L0 9920 L100 10020 L5910 10020 L6010 9920 L6010 100 L5910 0 L100 0 Z\n'
  dataElectrode = dataElectrode + 'Referenceelectrode path M0 0 L0 10000 L10000 10000 L10000 0 Z\n'

  const electrodsShape = {}
  electrods.forEach(el => {
    // console.log(el)
    if (!(el.name in electrodsShape)) {
      electrodsShape[el.name] = []
      let path = ''
      const pathlist = el.children[0].attrs.d.split(' ')
      pathlist.forEach(p => {
        if (p !== '' && p !== 'Z') {
          path += p + '00 '
        } else {
          path += 'Z\n'
        }
      })
      for (let i = 0; i < pathlist.length - 1; i = i + 2) {
        if (pathlist[i] !== '') {
          electrodsShape[el.name].push([ parseInt(pathlist[i].substr(1) + '00'), parseInt(pathlist[i + 1] + '00') ])
        }
      }
      console.log(path)
      dataElectrode = dataElectrode + el.name + ' path ' + path
    }
  })
  // dataElectrode = dataElectrode + "square path M0 100 L0 1900 L100 2000 L1900 2000 L2000 1900 L2000 100 L1900 0 L100 0 Z\n";
  dataElectrode = dataElectrode + '#ENDOFDEFINITION#\n'

  console.log(electrodsShape)

  var dataContactPad = ''
  var tx = 0
  var ty = 0
  for (var i = 0; i < 8; i++) {
      tx = 0
      for (var j = 0; j < 32; j++) {
        dataContactPad = dataContactPad + 'contactpad ' + tx + ' ' + ty + '\n'
          tx = tx + 2540
      }
      if (ty === 7620) {
        ty = 56896
      } else {
        ty = ty + 2540
      }
  }

  var dataElectrodePos = ''
  let _path = ''

  electrods.forEach((item, index) => {
    const x = (parseFloat(item.left) * parseFloat(80000 / 800) + parseFloat(-50))
    const y = (parseFloat(item.top) * parseFloat(40000 / 400) + parseFloat(12255))
    dataElectrodePos = dataElectrodePos + item.name + ' ' + (parseFloat(item.left) * parseFloat(80000 / 800) + parseFloat(-50)) + ' ' + (parseFloat(item.top) * parseFloat(40000 / 400) + parseFloat(12255)) + '\n'
    // pos.push([x, y])
    _path = _path + '<path d="M'
    electrodsShape[item.name].forEach(v => {
      _path = _path + ((x + v[0]) / 100) + ' ' + ((y + v[1]) / 100) + ' L'
    })
    _path = _path.substr(0, _path.length - 1) + 'Z" />\n'
  })

  dataElectrodePos = dataElectrodePos + 'Referenceelectrode -14835 13689\n'
  dataElectrodePos = dataElectrodePos + '#ENDOFLAYOUT#\n'
  dataElectrodePos = dataElectrodePos + '0,0,0,0,0,0,0,0;100\n'
  dataElectrodePos = dataElectrodePos + '#ENDOFSEQUENCE#'

  const ewd = {
    ewd1: dataElectrode,
    ewd2: dataContactPad,
    ewd3: dataElectrodePos,
    name: parsedRepoName
  }

  // console.log('***', _path)

  let resp = await api.cad(ewd)
  // console.log(resp)

  if (resp.status === 200) {
    const parser = new DxfParser()
    const dxf = parser.parseSync(resp.data)
    console.log(dxf)
    let _svg = dxfToSvg(resp.data) + '\n'
    // 'M0 1 L0 19 L1 20 L19 20 L20 19 L20 1 L19 0 L1 0 Z'
    // pos.forEach(_pos => {
    //   let _path = '<path d="M'
    //   _path = _path + ((_pos[0]) / 100) + ' ' + ((_pos[1] + 100) / 100) + ' L' + ((_pos[0]) / 100) + ' ' + ((_pos[1] + 1900) / 100) + ' L' + ((_pos[0] + 100) / 100) + ' ' + ((_pos[1] + 2000) / 100) + ' L' + ((_pos[0] + 1900) / 100) + ' ' + ((_pos[1] + 2000) / 100) + ' L' + ((_pos[0] + 2000) / 100) + ' ' + ((_pos[1] + 1900) / 100) + ' L' + ((_pos[0] + 2000) / 100) + ' ' + ((_pos[1] + 100) / 100) + ' L' + ((_pos[0] + 1900) / 100) + ' ' + ((_pos[1] + 0) / 100) + ' L' + ((_pos[0] + 100) / 100) + ' ' + ((_pos[1] + 0) / 100) + ' Z" />'
    //   _svg = _svg + _path + '\n'
    _svg = _svg + _path
    console.log(_svg)

    download(resp.data, parsedRepoName + '.dwg')
    commit(types._toggleLoadingStatus, false)
  } else {
    commit(types._toggleLoadingStatus, false)
    commit(types._toggleApiStatus, false)
  }
},

/**
 * Downloads the current vuegg project definition as a .zip file with the vuejs sources
 *
 * @return {download} [project-name].zip file containing the vuejs sources of the vuegg project
 */
  [types.downloadVueSources]: async function ({ state, dispatch, commit }) {
    commit(types._toggleBlockLoadingStatus, true)

    let resp = await api.generateVueSources(state.project)
    const parsedProjectName = state.project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')
    download(resp.data, parsedProjectName + '.zip', resp.data.type)

    commit(types._toggleBlockLoadingStatus, false)
  },

  [types.getSVG]: async function ({ state, dispatch, commit }) {
    commit(types._toggleLoadingStatus, true)
    commit(types._toggleApiStatus, true)

    const parsedRepoName = state.project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')

    // axios.get('http://localhost:3000/api/todo', {
    // })
    // .then(function (response) {
    //   console.log(response)
    // })
    // .catch(function (error) {
    //   console.log(error)
    // })

    var electrods = state.project.pages[0].children

    var dataElectrode = ''
    dataElectrode = dataElectrode + 'contactpad circle r 750\n'
    // dataElectrode = dataElectrode + 'base path M0 100 L0 1900 L100 2000 L1900 2000 L2000 1900 L2000 100 L1900 0 L100 0 Z\n'
    // dataElectrode = dataElectrode + 'customer2 path M0 100 L0 3905 L100 4005 L1900 4005 L2000 3905 L2000 2000 L4005 2000 L4005 3905 L4105 4005 L5905 4005 L6005 3905 L6005 100 L5905 0 L100 0 Z\n'
    // dataElectrode = dataElectrode + 'customer1 path M0 100 L0 5910 L100 6010 L3905 6010 L4005 5910 L4005 4110 L3905 4010 L2000 4010 L2000 2000 L3905 2000 L4005 1900 L4005 100 L3905 0 L100 0 Z\n'
    // dataElectrode = dataElectrode + 'customer3 path M0 100 L0 9920 L100 10020 L5910 10020 L6010 9920 L6010 100 L5910 0 L100 0 Z\n'
    dataElectrode = dataElectrode + 'Referenceelectrode path M0 0 L0 10000 L10000 10000 L10000 0 Z\n'

    const electrodsShape = {}
    electrods.forEach(el => {
      // console.log(el)
      if (!(el.name in electrodsShape)) {
        electrodsShape[el.name] = []
        let path = ''
        const pathlist = el.children[0].attrs.d.split(' ')
        pathlist.forEach(p => {
          if (p !== '' && p !== 'Z') {
            path += p + '00 '
          } else {
            path += 'Z\n'
          }
        })
        for (let i = 0; i < pathlist.length - 1; i = i + 2) {
          if (pathlist[i] !== '') {
            electrodsShape[el.name].push([ parseInt(pathlist[i].substr(1) + '00'), parseInt(pathlist[i + 1] + '00') ])
          }
        }
        console.log(path)
        dataElectrode = dataElectrode + el.name + ' path ' + path
      }
    })
    // dataElectrode = dataElectrode + "square path M0 100 L0 1900 L100 2000 L1900 2000 L2000 1900 L2000 100 L1900 0 L100 0 Z\n";
    dataElectrode = dataElectrode + '#ENDOFDEFINITION#\n'

    console.log(electrodsShape)

    var dataContactPad = ''
    var tx = 0
    var ty = 0
    for (var i = 0; i < 8; i++) {
        tx = 0
        for (var j = 0; j < 32; j++) {
          dataContactPad = dataContactPad + 'contactpad ' + tx + ' ' + ty + '\n'
            tx = tx + 2540
        }
        if (ty === 7620) {
          ty = 56896
        } else {
          ty = ty + 2540
        }
    }

    var dataElectrodePos = ''
    let _path = ''

    electrods.forEach((item, index) => {
      const x = (parseFloat(item.left) * parseFloat(80000 / 800) + parseFloat(-50))
      const y = (parseFloat(item.top) * parseFloat(40000 / 400) + parseFloat(12255))
      dataElectrodePos = dataElectrodePos + item.name + ' ' + (parseFloat(item.left) * parseFloat(80000 / 800) + parseFloat(-50)) + ' ' + (parseFloat(item.top) * parseFloat(40000 / 400) + parseFloat(12255)) + '\n'
      // pos.push([x, y])
      _path = _path + '<path d="M'
      electrodsShape[item.name].forEach(v => {
        _path = _path + ((x + v[0]) / 100) + ' ' + ((y + v[1]) / 100) + ' L'
      })
      _path = _path.substr(0, _path.length - 1) + 'Z" />\n'
    })

    dataElectrodePos = dataElectrodePos + 'Referenceelectrode -14835 13689\n'
    dataElectrodePos = dataElectrodePos + '#ENDOFLAYOUT#\n'
    dataElectrodePos = dataElectrodePos + '0,0,0,0,0,0,0,0;100\n'
    dataElectrodePos = dataElectrodePos + '#ENDOFSEQUENCE#'

    const ewd = {
      ewd1: dataElectrode,
      ewd2: dataContactPad,
      ewd3: dataElectrodePos,
      name: parsedRepoName
    }

    // console.log('***', _path)

    let resp = await api.cad(ewd)
    // console.log(resp)

    if (resp.status === 200) {
      const parser = new DxfParser()
      const dxf = parser.parseSync(resp.data)
      console.log(dxf)
      let _svg = dxfToSvg(resp.data) + '\n'
      // 'M0 1 L0 19 L1 20 L19 20 L20 19 L20 1 L19 0 L1 0 Z'
      // pos.forEach(_pos => {
      //   let _path = '<path d="M'
      //   _path = _path + ((_pos[0]) / 100) + ' ' + ((_pos[1] + 100) / 100) + ' L' + ((_pos[0]) / 100) + ' ' + ((_pos[1] + 1900) / 100) + ' L' + ((_pos[0] + 100) / 100) + ' ' + ((_pos[1] + 2000) / 100) + ' L' + ((_pos[0] + 1900) / 100) + ' ' + ((_pos[1] + 2000) / 100) + ' L' + ((_pos[0] + 2000) / 100) + ' ' + ((_pos[1] + 1900) / 100) + ' L' + ((_pos[0] + 2000) / 100) + ' ' + ((_pos[1] + 100) / 100) + ' L' + ((_pos[0] + 1900) / 100) + ' ' + ((_pos[1] + 0) / 100) + ' L' + ((_pos[0] + 100) / 100) + ' ' + ((_pos[1] + 0) / 100) + ' Z" />'
      //   _svg = _svg + _path + '\n'
      _svg = _svg + _path
      // console.log(_svg)
      // svgContent = _svg
      commit(types._toggleSvg, _svg)

      // download(resp.data, parsedRepoName + '.dwg')
      commit(types._toggleLoadingStatus, false)
    } else {
      commit(types._toggleLoadingStatus, false)
      commit(types._toggleApiStatus, false)
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
      case 'github':
        // const token = await localforage.getItem('gh-token')
        const owner = userName || state.oauth.authenticatedUser.login
        const repo = repoName || state.project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')

        // let ghFile = await api.getVueggProject(owner, repo, token)
        let ghFile = await api.getVueggProject(owner, repo)

        ghFile
          ? project = ghFile.data.data.content
          : showSnackbar(owner + '/' + repo + ' is not a valid repository')
        break
      default: project = await localforage.getItem('local-checkpoint')
    }

    if (project) {
      store.replaceState(newState(JSON.parse(atob(project))))
      commit(types.addProject)
      if (origin === 'github') localforage.setItem('gh-repo-name', repoName)

      await dispatch(types.checkAuth)
    }
    commit(types._toggleBlockLoadingStatus, false)
  },

/**
 * Clears the editing project from vuegg and replaces it with a plain one.
 * (or better to say, resets vuegg to initial state)
 */
  [types.clearProject]: async function ({ dispatch, commit }) {
    commit(types._toggleBlockLoadingStatus, true)

    store.replaceState(newState())
    commit(types.deleteProject)

    await dispatch(types.checkAuth)
    commit(types._toggleBlockLoadingStatus, false)
  }
}

export default projectActions
