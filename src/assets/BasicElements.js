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
        'name': 'base-x',
        'type': 'svg',
        'egglement': true,
        'wrappegg': true,
        'width': 22,
        'height': 22,
        'attrs': {},
        'styles': {
        },
        'matrix': [
            [1]
        ],
        'classes': {},
        'children': [
            {
                'name': 'path',
                'type': 'path',
                'attrs': {
                    'd': 'M 1 2 L 2 1 L 3 0 L 5 2 L 7 0 L 9 2 L 11 0 L 13 2 L 15 0 L 17 2 L 19 0 L 20 1 L 21 2 L 22 3 L 20 5 L 22 7 L 20 9 L 22 11 L 20 13 L 22 15 L 20 17 L 22 19 L 21 20 L 20 21 L 19 20 L 17 22 L 15 20 L 13 22 L 11 20 L 9 22 L 7 20 L 5 22 L 3 20 L 2 21 L 1 20 L 2 19 L 0 17 L 2 15 L 0 13 L 2 11 L 0 9 L 2 7 L 0 5 L 2 3 Z'
                    // 'd': 'M0 1 L1 0 L19 0 L20 1 L20 19 L19 20 L1 20 L0 19 Z'
                }
            }
        ]
    },
    {
        'name': 'base-s',
        'type': 'svg',
        'egglement': true,
        'wrappegg': true,
        'width': 20,
        'height': 20,
        'attrs': {},
        'styles': {
        },
        'matrix': [
            [1]
        ],
        'classes': {},
        'children': [
            {
                'name': 'path',
                'type': 'path',
                'attrs': {
                    'd': 'M 0 1 L 1 0 L 19 0 L 20 1 L 20 19 L 19 20 L 1 20 L 0 19 Z'
                }
            }
        ]
    },
    {
        'name': 'base-ct',
        'type': 'svg',
        'egglement': true,
        'wrappegg': true,
        'width': 20,
        'height': 20,
        'attrs': {},
        'styles': {
        },
        'matrix': [
            [1]
        ],
        'classes': {},
        'children': [
            {
                'name': 'path',
                'type': 'path',
                'attrs': {
                    'd': 'M 0 7 L 1.33 5 L 5 8.66 L 10 10 L 15 8.66 L 18.66 5 L 20 7 L 20 19 L 19 20 L 1 20 L 0 19 Z'
                }
            }
        ]
    },
    {
        'name': 'base-cd',
        'type': 'svg',
        'egglement': true,
        'wrappegg': true,
        'width': 20,
        'height': 20,
        'attrs': {},
        'styles': {
        },
        'matrix': [
            [1]
        ],
        'classes': {},
        'children': [
            {
                'name': 'path',
                'type': 'path',
                'attrs': {
                    'd': 'M 0 1 L 1 0 L 19 0 L 20 1 L 20 13 L 18.66 15 L 15 11.33 L 10 10 L 5 11.33 L 1.33 15 L 0 13 Z'
                }
            }
        ]
    },
    {
        'name': 'base-cl',
        'type': 'svg',
        'egglement': true,
        'wrappegg': true,
        'width': 20,
        'height': 20,
        'attrs': {},
        'styles': {
        },
        'matrix': [
            [1]
        ],
        'classes': {},
        'children': [
            {
                'name': 'path',
                'type': 'path',
                'attrs': {
                    'd': 'M 0 1 L 1 0 L 13 0 L 15 1.33 L 11.33 5 L 10 10 L 11.33 15 L 15 18.66 L 13 20 L 1 20 L 0 19 Z'
                }
            }
        ]
    },
    {
        'name': 'base-cr',
        'type': 'svg',
        'egglement': true,
        'wrappegg': true,
        'width': 20,
        'height': 20,
        'attrs': {},
        'styles': {
        },
        'matrix': [
            [1]
        ],
        'classes': {},
        'children': [
            {
                'name': 'path',
                'type': 'path',
                'attrs': {
                    'd': 'M 7 0 L 19 0 L 20 1 L 20 19 L 19 20 L 7 20 L 5 18.66 L 8.66 15 L 10 10 L 8.66 5 L 5 1.33 Z'
                    // M0 1 L 1 0 L 19 0 L 20 1 L 20 19 L 19 20 L 1 20 L 0 19 Z'
                }
            }
        ]
    },
    {
        'name': 'circle',
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
                    'd': 'M 20 10 L 18.66 15 L 15 18.66 L 10 20 L 5 18.66 L 1.33 15 L 0 10 L 1.33 5 L 4.99 1.33 L 9.99 0 L 15.00 1.33 L 18.66 4.99 Z'
                }
            }
        ]
    },
    // {
    //     'name': 'base2',
    //     'type': 'svg',
    //     'egglement': true,
    //     'wrappegg': true,
    //     'width': 22,
    //     'height': 22,
    //     'attrs': {},
    //     'styles': {
    //     },
    //     'matrix': [
    //         [1]
    //     ],
    //     'classes': {},
    //     'children': [
    //         {
    //             'name': 'path',
    //             'type': 'path',
    //             'attrs': {
    //                 'd': 'M1 2 L2 1 L3 0 L5 2 L7 0 L9 2 L11 0 L13 2 L15 0 L17 2 L 19 0 L20 1 L21 2 L22 3 L20 5 L22 7 L20 9 L22 11 L20 13 L22 15 L20 17 L22 19 L21 20 L20 21 L19 20 L17 22 L15 20 L13 22 L11 20 L9 22 L7 20 L5 22 L3 20 L2 21 L1 20 L2 19 L0 17 L2 15 L0 13 L2 11 L0 9 L2 7 L0 5 L2 3 Z'
    //             }
    //         }
    //     ]
    // },
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
