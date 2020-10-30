/*
  Basic elements (HTML5 Elements):
  - PARENT -> egglement, [containegg]
 */
// const basicElements = [
//     // DIV
//     {
//         'name': 'div',
//         'type': 'div',
//         'egglement': true,
//         'containegg': true,
//         'width': 300,
//         'height': 300,
//         'attrs': {
//             'hidden': false
//         },
//         'classes': {},
//         'styles': {
//             'overflow': 'hidden',
//             'border-color': 'rgba(0, 0, 0, 0.15)',
//             'border-style': 'solid',
//             'border-width': '1px'
//         },
//         'children': []
//     },

//     // TABLE
//     {
//         'name': 'table',
//         'type': 'table',
//         'egglement': true,
//         'wrappegg': true,
//         'width': 550,
//         'minWidth': 250,
//         'height': 300,
//         'minHeight': 85,
//         'attrs': {},
//         'styles': {
//             'background-color': '#ffffff',
//             'border-collapse': 'collapse',
//             'border': '1px solid #dddddd',
//             'text-align': 'left'
//         },
//         'classes': {},
//         'children': [{
//             'type': 'tr',
//             'attrs': {},
//             'styles': {},
//             'classes': {},
//             'children': [{
//                 'type': 'th',
//                 'text': 'head 1',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }, {
//                 'type': 'th',
//                 'text': 'head 2',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }, {
//                 'type': 'th',
//                 'text': 'head 3',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }]
//         }, {
//             'type': 'tr',
//             'attrs': {},
//             'styles': {
//                 'background-color': 'rgba(0, 0, 0, 0.12)'
//             },
//             'classes': {},
//             'children': [{
//                 'type': 'td',
//                 'text': 'data 1.1',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }, {
//                 'type': 'td',
//                 'text': 'data 2.1',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }, {
//                 'type': 'td',
//                 'text': 'data 3.1',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }]
//         }, {
//             'type': 'tr',
//             'attrs': {},
//             'styles': {},
//             'classes': {},
//             'children': [{
//                 'type': 'td',
//                 'text': 'data 1.2',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }, {
//                 'type': 'td',
//                 'text': 'data 2.2',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }, {
//                 'type': 'td',
//                 'text': 'data 3.2',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }]
//         }, {
//             'type': 'tr',
//             'attrs': {},
//             'styles': {
//                 'background-color': 'rgba(0, 0, 0, 0.12)'
//             },
//             'classes': {},
//             'children': [{
//                 'type': 'td',
//                 'text': 'data 3.1',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }, {
//                 'type': 'td',
//                 'text': 'data 3.2',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }, {
//                 'type': 'td',
//                 'text': 'data 3.3',
//                 'attrs': {},
//                 'styles': {
//                     'padding': '0 8px'
//                 },
//                 'classes': {},
//                 'children': {

//                 }
//             }]
//         }]
//     },

//     // DATE
//     {
//         'name': 'date',
//         'type': 'input',
//         'egglement': true,
//         'width': 200,
//         'height': 40,
//         'attrs': {
//             'value': '',
//             'type': 'date',
//             'placeholder': 'MM/DD/YYYY',
//             'overflow': 'hidden',
//             'text-overflow': 'ellipsis'
//         },
//         'styles': {},
//         'classes': {}
//     },

//     // INPUT
//     {
//         'name': 'input',
//         'type': 'input',
//         'egglement': true,
//         'width': 300,
//         'height': 40,
//         'attrs': {
//             'value': '',
//             'placeholder': 'placeholder',
//             'overflow': 'hidden',
//             'text-overflow': 'ellipsis'
//         },
//         'styles': {},
//         'classes': {}
//     },

//     // BUTTON
//     {
//         'name': 'button',
//         'type': 'button',
//         'text': 'Button',
//         'egglement': true,
//         'width': 200,
//         'height': 40,
//         'attrs': {},
//         'styles': {
//             'overflow': 'hidden',
//             'text-overflow': 'ellipsis'
//         },
//         'classes': {}
//     },

//     // CHECKBOX
//     {
//         'name': 'checkbox',
//         'type': 'input',
//         'egglement': true,
//         'width': 40,
//         'height': 40,
//         'attrs': {
//             'type': 'checkbox'
//         },
//         'styles': {},
//         'classes': {}
//     },

//     // RADIO
//     {
//         'name': 'radio',
//         'type': 'input',
//         'egglement': true,
//         'width': 40,
//         'height': 40,
//         'attrs': {
//             'type': 'radio',
//             'name': 'default-group'
//         },
//         'styles': {},
//         'classes': {}
//     },

//     // SELECT
//     {
//         'name': 'select',
//         'type': 'select',
//         'egglement': true,
//         'wrappegg': true,
//         'width': 200,
//         'height': 40,
//         'attrs': {},
//         'styles': {},
//         'classes': {},
//         'children': [{
//             'type': 'option',
//             'text': 'Option 1',
//             'attrs': {},
//             'styles': {},
//             'classes': {}
//         }, {
//             'type': 'option',
//             'text': 'Option 2',
//             'attrs': {},
//             'styles': {},
//             'classes': {}
//         }, {
//             'type': 'option',
//             'text': 'Option 3',
//             'attrs': {},
//             'styles': {},
//             'classes': {}
//         }]
//     },

//     // ICON
//     {
//         'displayName': 'Icon',
//         'iconName': 'icon',
//         'name': 'icon',
//         'type': 'i',
//         'egglement': true,
//         'text': 'insert_emoticon',
//         'width': 32,
//         'height': 32,
//         'attrs': {},
//         'styles': {
//             'font-family': '"Material Icons"',
//             'font-size': 32,
//             'text-align': 'center'
//         },
//         'classes': {
//             'material-icons': true
//         }
//     },

//     // LINK
//     {
//         'name': 'link',
//         'type': 'a',
//         'text': 'Link',
//         'egglement': true,
//         'width': 200,
//         'height': 40,
//         'attrs': {
//             'href': '#'
//         },
//         'styles': {
//             'text-align': 'center',
//             'overflow': 'hidden',
//             'text-overflow': 'ellipsis'
//         },
//         'classes': {}
//     },

//     // TEXT
//     {
//         'name': 'text',
//         'type': 'span',
//         'text': 'Text',
//         'egglement': true,
//         'width': 150,
//         'height': 25,
//         'attrs': {},
//         'styles': {
//             'overflow': 'hidden',
//             'text-overflow': 'ellipsis'
//         },
//         'classes': {}
//     },

//     // IMAGE
//     {
//         'name': 'image',
//         'type': 'img',
//         'egglement': true,
//         'width': 50,
//         'height': 44.44,
//         'attrs': {
//             'src': '/static/vuegg-fam.svg'
//         },
//         'styles': {},
//         'classes': {}
//     }
// ]

const basicElements = [
    {
        'name': 'base',
        'type': 'svg',
        'egglement': true,
        'wrappegg': true,
        'width': 20,
        'height': 20,
        'attrs': {},
        'styles': {
        },
        'classes': {},
        'children': [
            {
                'name': 'path',
                'type': 'path',
                'attrs': {
                    'd': 'M0 1 L0 19 L1 20 L19 20 L20 19 L20 1 L19 0 L1 0 Z'
                }
            }
        ]
    },
    {
        'name': 'customer1',
        'type': 'svg',
        'egglement': true,
        'wrappegg': true,
        'width': 42,
        'height': 63,
        'attrs': {},
        'styles': {
        },
        'classes': {},
        'children': [
            {
                'name': 'path',
                'type': 'path',
                'attrs': {
                    'd': 'M0 1 L0 59.1 L1 60.1 L39.05 60.10 L40.05 59.10 L40.05 41.10 L39.05 40.10 L20.00 40.10 L20.00 20.00 L39.05 20.00 L40.05 19.00 L40.05 1.00 L39.05 0 L1.00 0 Z'
                }
            }
        ]
    },
    {
        'name': 'customer2',
        'type': 'svg',
        'egglement': true,
        'wrappegg': true,
        'width': 63,
        'height': 42,
        'attrs': {},
        'styles': {
        },
        'classes': {},
        'children': [
            {
                'name': 'path',
                'type': 'path',
                'attrs': {
                    'd': 'M0 1.00 L0 39.05 L1.00 40.05 L19.00 40.05 L20.00 39.05 L20.00 20.00 L40.05 20.00 L40.05 39.05 L41.05 40.05 L59.05 40.05 L60.05 39.05 L60.05 1.00 L59.05 0 L1.00 0 Z'
                }
            }
        ]
    },
    {
        'name': 'customer3',
        'type': 'svg',
        'egglement': true,
        'wrappegg': true,
        'width': 63,
        'height': 105,
        'attrs': {},
        'styles': {
        },
        'classes': {},
        'children': [
            {
                'name': 'path',
                'type': 'path',
                'attrs': {
                    'd': 'M0 1.00 L0 99.20 L1.00 100.20 L59.10 100.20 L60.10 99.20 L60.10 1.00 L59.10 0 L1.00 0 Z'
                }
            }
        ]
    }
    // {
    //     'name': 'customer4',
    //     'type': 'svg',
    //     'egglement': true,
    //     'wrappegg': true,
    //     'width': 126,
    //     'height': 126,
    //     'attrs': {},
    //     'styles': {
    //     },
    //     'classes': {},
    //     'children': [
    //         {
    //             'name': 'path',
    //             'type': 'path',
    //             'attrs': {
    //                 'd': 'M42 20 L42 1 L43 0 L61 0 L62 1 L62 20 L63 21 L83 21 L84 20 L84 1 L85 0 L103 0 L104 1 L104 20 L104 21 L104 41 L104 42 L104 62 L104 63 L104 82 L103 83 L84 83 L83 84 L83 104 L83 105 L83 124 L82 125 L64 125 L63 124 L63 105 L63 104 L63 84 L62 83 L42 83 L41 84 L41 103 L40 104 L22 104 L21 103 L21 84 L20 83 L1 83 L0 82 L0 64 L1 63 L20 63 L21 63 L41 63 L42 63 L62 63 L63 63 L83 63 L84 62 L84 42 L83 41 L63 41 L62 41 L43 41 L42 40 L42 21 Z'
    //             }
    //         }
    //     ]
    // }
]

export default basicElements
