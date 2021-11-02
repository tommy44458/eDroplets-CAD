
function newElectrodeUnit (name, gridUnit, cornerSize) {
  const _matrix = [
    [1]
  ]
  const elecSize = gridUnit - cornerSize
  const _vertax = [
    [0, cornerSize],
    [cornerSize, 0],
    [elecSize - cornerSize, 0],
    [elecSize, cornerSize],
    [elecSize, elecSize - cornerSize],
    [elecSize - cornerSize, elecSize],
    [cornerSize, elecSize],
    [0, elecSize - cornerSize]
  ]

  let dPath = ''

  _vertax.forEach((p, i) => {
    dPath += (i === 0) ? 'M ' : 'L '
    dPath += p[0] + ' ' + p[1] + ' '
  })

  dPath += 'Z'

  return {
    'name': name,
    'type': 'svg',
    'egglement': true,
    'wrappegg': true,
    'width': elecSize,
    'height': elecSize,
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
              'd': dPath
            }
        }
    ]
}
}

export default newElectrodeUnit
