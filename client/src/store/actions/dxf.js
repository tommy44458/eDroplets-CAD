// Dependencies:
// * http://jquery.com/
// * https://github.com/mondalaci/positional-format.js
// $ bower install jquery positional-format.js

import jquery from 'jquery'

// eslint-disable-next-line no-extend-native
String.prototype.format = function () {
    var args = arguments
    args['{'] = '{'
    args['}'] = '}'
    return this.replace(
        /{({|}|-?[0-9]+)}/g,
        function (item) {
            var result = args[item.substring(1, item.length - 1)]
            return typeof result === 'undefined' ? '' : result
            }
        )
}

function interpolate (t, degree, points, knots, weights, result) {
    var i, j, s, l              // function-scoped iteration variables
    var n = points.length    // points count
    var d = points[0].length // point dimensionality

    if (degree < 1) throw new Error('degree must be at least 1 (linear)')
    if (degree > (n - 1)) throw new Error('degree must be less than or equal to point count - 1')

    if (!weights) {
      // build weight vector of length [n]
      weights = []
      for (i = 0; i < n; i++) {
        weights[i] = 1
      }
    }

    if (!knots) {
      // build knot vector of length [n + degree + 1]
      knots = []
      for (i = 0; i < n + degree + 1; i++) {
        knots[i] = i
      }
    } else {
      if (knots.length !== n + degree + 1) throw new Error('bad knot vector length')
    }

    var domain = [
      degree,
      knots.length - 1 - degree
    ]

    // remap t to the domain where the spline is defined
    var low = knots[domain[0]]
    var high = knots[domain[1]]
    t = t * (high - low) + low

    if (t < low || t > high) throw new Error('out of bounds')

    // find s (the spline segment) for the [t] value provided
    for (s = domain[0]; s < domain[1]; s++) {
      if (t >= knots[s] && t <= knots[s + 1]) {
        break
      }
    }

    // convert points to homogeneous coordinates
    var v = []
    for (i = 0; i < n; i++) {
      v[i] = []
      for (j = 0; j < d; j++) {
        v[i][j] = points[i][j] * weights[i]
      }
      v[i][d] = weights[i]
    }

    // l (level) goes from 1 to the curve degree + 1
    var alpha
    for (l = 1; l <= degree + 1; l++) {
      // build level l of the pyramid
      for (i = s; i > s - degree - 1 + l; i--) {
        alpha = (t - knots[i]) / (knots[i + degree + 1 - l] - knots[i])

        // interpolate each component
        for (j = 0; j < d + 1; j++) {
          v[i][j] = (1 - alpha) * v[i - 1][j] + alpha * v[i][j]
        }
      }
    }

    // convert back to cartesian and return
    result = result || []
    for (i = 0; i < d; i++) {
      result[i] = v[s][i] / v[s][d]
    }

    return result
  }

/**
 * Convert DXF string to SVG format.
 * @param {string} dxfString The DXF string to be converted.
 * @returns {string|null} The converted SVG string or null if the conversion was unsuccessful.
 */
export const dxfToSvg = function (dxfString) {
    'use strict'
    function dxfObjectToSvgSnippet (dxfObject) {
      function getLineSvg (x1, y1, x2, y2) {
        return '<path d="M{0},{1} {2},{3}"/>\n'.format(x1, y1, x2, y2)
      }

      function deg2rad (deg) {
        return deg * (Math.PI / 180)
      }

      let svgSnippet = ''
      switch (dxfObject.type) {
        case 'LINE':
          return getLineSvg(dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1)
        case 'CIRCLE':
          return '<circle cx="{0}" cy="{1}" r="{2}"/>\n'.format((dxfObject.x / 100), -(dxfObject.y / 100), (dxfObject.r / 100))
        case 'ARC':
            // console.log('*****ARC', dxfObject)
          var x1 = (dxfObject.x / 100) + (dxfObject.r / 100) * Math.cos(deg2rad(dxfObject.a0))
          var y1 = (dxfObject.y / 100) + (dxfObject.r / 100) * Math.sin(deg2rad(dxfObject.a0))
          var x2 = (dxfObject.x / 100) + (dxfObject.r / 100) * Math.cos(deg2rad(dxfObject.a1))
          var y2 = (dxfObject.y / 100) + (dxfObject.r / 100) * Math.sin(deg2rad(dxfObject.a1))

          if (dxfObject.a1 < dxfObject.a0) { dxfObject.a1 += 360 }
          var largeArcFlag = dxfObject.a1 - dxfObject.a0 > 180 ? 1 : 0

          return '<path d="M{0},{1} A{2},{3} 0 {4},1 {5},{6}"/>\n'
                          .format(x1, -y1, (dxfObject.r / 100), (dxfObject.r / 100), largeArcFlag, x2, -y2)
        case 'LWPOLYLINE':
          for (let i = 0; i < dxfObject.vertices.length - 1; i++) {
            const vertice1 = dxfObject.vertices[i]
            const vertice2 = dxfObject.vertices[i + 1]
            svgSnippet += getLineSvg(vertice1.x, vertice1.y, vertice2.x, vertice2.y)
          }
          return svgSnippet
        case 'SPLINE':
          const controlPoints = dxfObject.vertices.map((value) => { return [value.x, value.y] })
        //   var numOfKnots = dxfObject.numOfKnots
          const knots = dxfObject.knots
          const degree = dxfObject.degree
        //   var vertices = []
          console.log('knots', knots)
          console.log('controlPoints', controlPoints)
          for (let t = 0; t <= 100; t = (t + 1) | 0) {
            dxfObject.vertices.push(interpolate(t / 100, degree, controlPoints, knots))
          }
          console.log('vertices', dxfObject.vertices)
          for (let i = 0; i < dxfObject.vertices.length - 1; i++) {
            const vertice1 = dxfObject.vertices[i]
            const vertice2 = dxfObject.vertices[i + 1]
            svgSnippet += getLineSvg(vertice1[0], vertice1[1], vertice2[0], vertice2[1])
          }
          return svgSnippet
        case 'SOLID':
            if (dxfObject.vertices.length > 0) {
                return '<path d="M{0},{1} L{2},{3} L{4} {5} L{6} {7} Z"/>\n'
                          .format((dxfObject.vertices[0].x / 100), -(dxfObject.vertices[0].y / 100), (dxfObject.vertices[1].x / 100), -(dxfObject.vertices[1].y / 100), (dxfObject.vertices[3].x / 100), -(dxfObject.vertices[3].y / 100), (dxfObject.vertices[2].x / 100), -(dxfObject.vertices[2].y / 100))
            } else {
                break
            }
        case 'VERTEX':
            console.log('*****', dxfObject)
            break
        default:
          console.log('other', dxfObject.type)
      }
    }

    var groupCodes = {
      0: 'entityType',
      2: 'blockName',
      10: 'x',
      11: 'x1',
      12: 'x2',
      13: 'x3',
      20: 'y',
      21: 'y1',
      22: 'y2',
      23: 'y3',
      40: 'r',
      50: 'a0',
      51: 'a1',
      71: 'degree',
      72: 'numOfKnots',
      73: 'numOfControlPoints',
      74: 'numOfFitPoints'
    }

    var supportedEntities = [
      'LINE',
      'CIRCLE',
      'ARC',
      'LWPOLYLINE',
      'SPLINE',
      'SOLID',
      'POLYLINE'
    ]

    var counter = 0
    var code = null
    var isEntitiesSectionActive = false
    var object = {}
    var svg = ''
    const english = /^[A-Za-z]*$/

    // Normalize platform-specific newlines.
    dxfString = dxfString.replace(/\r\n/g, '\n')
    dxfString = dxfString.replace(/\r/g, '\n')

    dxfString.split('\n').forEach(function (line) {
      line = line.trim()
      if (counter++ % 2 === 0) {
        code = parseInt(line)
      } else {
        var value = line
        var groupCode = groupCodes[code]
        if (groupCode === 'blockName' && value === 'ENTITIES') {
          isEntitiesSectionActive = true
        } else if (isEntitiesSectionActive) {
          if (english.test(value)) {
            console.log(value)
          }
          if (groupCode === 'entityType') {  // New entity starts.
            if (object.type) {
              svg += dxfObjectToSvgSnippet(object)
            }
            object = jquery.inArray(value, supportedEntities) > -1 ? {type: value} : {}
            if (value === 'ENDSEC') {
              isEntitiesSectionActive = false
            }
          } else if (object.type && typeof groupCode !== 'undefined') {  // Known entity property recognized.
            object[groupCode] = parseFloat(value)
            if (object.type === 'SPLINE' && groupCode === 'r') {
              if (!object.knots) {
                object.knots = []
              }
              object.knots.push(object.r)
            }
            if ((object.type === 'LWPOLYLINE' || object.type === 'SPLINE') && groupCode === 'y') {
              if (!object.vertices) {
                object.vertices = []
              }
              object.vertices.push({x: object.x, y: object.y})
            }
            if (object.type === 'SOLID' && groupCode === 'y3') {
                // console.log('***', groupCode, object)
                if (!object.vertices) {
                    object.vertices = []
                }
                object.vertices.push({x: object.x, y: object.y})
                object.vertices.push({x: object.x1, y: object.y1})
                object.vertices.push({x: object.x2, y: object.y2})
                object.vertices.push({x: object.x3, y: object.y3})
            }
          }
        }
      }
    })

    if (svg === '') {
      return null
    }
    return svg
      /*
      var strokeWidth = 0.2;

      var pixelToMillimeterConversionRatio = 3.543299873306695;
       svg =  '<g style="stroke:black; stroke-width:' + strokeWidth + '; ' +
                'vector-effect:non-scaling-stroke;' +
                'stroky-opacity:1.0;'+
                'stroke-linecap:round;' +
                'stroke-linejoin:round;'+
                ' fill:none">\n' +
                svg +
                '</g>';
     return svg;
     var svgId = "svg" + Math.round(Math.random() * Math.pow(10, 17));
      svg = '<svg {0} version="1.1" xmlns="http://www.w3.org/2000/svg">\n' +
            '<g transform="scale({0},-{0})" '.format(pixelToMillimeterConversionRatio) +
              ' style="stroke:black; stroke-width:' + strokeWidth + '; ' +
                      'stroke-linecap:round; stroke-linejoin:round; fill:none">\n' +
            svg +
            '</g>\n' +
            '</svg>\n';
  */
      // The SVG has to be added to the DOM to be able to retrieve its bounding box.
   /*   $(svg.format('id="'+svgId+'"')).appendTo('body');
      var boundingBox = $('svg')[0].getBBox();
      var viewBoxValue = '{0} {1} {2} {3}'.format(boundingBox.x-strokeWidth/2, boundingBox.y-strokeWidth/2,
                                                  boundingBox.width+strokeWidth, boundingBox.height+strokeWidth);
      $('#'+svgId).remove();

      return svg.format('viewBox="' + viewBoxValue + '"');
      */
  }
