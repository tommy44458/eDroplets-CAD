import shortid from 'shortid'

function newElectrodeUnit (name, size, cornerSize) {
  const _matrix = [
    [1]
  ]
  const _Vertax = []
  
  return {
    'name': name,
    'type': 'svg',
    'egglement': true,
    'wrappegg': true,
    'width': size - cornerSize,
    'height': size - cornerSize,
    'attrs': {},
    'styles': {
    },
    'classes': {
      'matrix': _matrix
    },
    'children': [
        {
            'name': 'path',
            'type': 'path',
            'attrs': {
              // 'd': 'M1 2 L2 1 L3 0 L5 2 L7 0 L9 2 L11 0 L13 2 L15 0 L17 2 L 19 0 L20 1 L21 2 L22 3 L20 5 L22 7 L20 9 L22 11 L20 13 L22 15 L20 17 L22 19 L21 20 L20 21 L19 20 L17 22 L15 20 L13 22 L11 20 L9 22 L7 20 L5 22 L3 20 L2 21 L1 20 L2 19 L0 17 L2 15 L0 13 L2 11 L0 9 L2 7 L0 5 L2 3 Z'
              // 'd': 'M 0 1 L 0 19 L 1 20 L 19 20 L 20 19 L 20 1 L 19 0 L 1 0 Z'
              'd': 'M0 1.5 L1.5 0 L197 0 L197 1.5 L198.5 197 L197 198.5 L1.5 198.5 L0 197 Z'
            }
        }
    ]
}
}

export default newElectrodeUnit
