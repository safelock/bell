const m = require('mithril')
const sourceManager = require('../SourceManager').default

var displayTimeArray = function (time) {
  var [hour, min] = time
  var part = (hour >= 12) ? 'pm' : 'am'

  hour = (hour > 12) ? hour - 12 : hour
  min = min ? ':' + padNumber(min, 2) : ''

  return hour + min + part
}

var padNumber = function (number, padding) {
  var string = number.toString()
  while (string.length < padding) { string = '0' + string }
  return string
}

var deleteClass = function (id, cookieManager) {
  var courses = cookieManager.get('courses', {})
  delete courses[id]

  // Bug fixed in >= 3.2.11, we were accidentially setting 'classes' cookie
  cookieManager.remove('classes')

  cookieManager.set('courses', courses)
}

var importAllClass = function (cookieManager) {
  var entry = prompt("Please paste your exported schedule. Only schedules exported via this tool will be accepted.")
  if (entry == null || entry == "") {
    alert("Invalid Entry. Doing Nothing.")
  }
  
  // Insert some validation action shit here.
  // This block is here as a TODO because idk what exportAllClass will give atm.
  // Probably will be updated during October.
  // End Validation Action Shit.
  
  // Purge Old Class Layout, Since we are importing a fresh schedule.
  cookieManager.remove('courses')
  
  cookieManager.set('courses', courses)
}

var exportAllClass = function (cookieManager) {
  var aa = cookieManager.get('courses', {});
  var trash = prompt("Please share the text below to share this schedule!", aa);
}
  
const Classes = {
  oninit: function (vnode) {
    sourceManager.source = 'custom'
  },
  view: function (vnode) {
    return [
      m('.header', m('h1', 'Enter Classes')),
      m('.add-link', m('a.add[href=/enter]', {
        oncreate: m.route.link
      }, '+ Add Class')),
      m('.add-link', m('a.add[href=javascript:void(0);]', {
        onclick: () => importAllClass(vnode.attrs.cookieManager)
      }, '+ Import Classes From Old Client')),
      m('.add-link', m('a.add[href=javascript:void(0);]', {
        onclick: () => exportAllClass(vnode.attrs.cookieManager)
      }, '- Export Classes')),
      m('ul.class-list#class-list', Object.keys(
        vnode.attrs.cookieManager.get('courses', {})).map(id => m('li', [
        m('a.course-link', {
          href: `/enter?course=${id}`,
          oncreate: m.route.link
        }, vnode.attrs.cookieManager.get('courses', {})[id].name),
        m('table.sections', m('tbody', [
          ...vnode.attrs.cookieManager.get('courses', {})[id].sections.map(section => m('tr', [
            m('td.day', section[0]),
            m('td', `${displayTimeArray(section[1])} - ${displayTimeArray(section[2])}`)
          ])),
          m('tr', [
            m('td', [m('a.delete-link[href=javascript:void(0);]', {
              onclick: () => deleteClass(id, vnode.attrs.cookieManager)
            }, 'Delete')]),
            m('td', [m('a.delete-link', {
              href: `/enter?course=${id}`,
              oncreate: m.route.link
            }, 'Edit')])
          ])
        ]))
      ]))),
      m('.footer-right[style=position: fixed;]', m('a[href=/settings]', {
        oncreate: m.route.link
      }, m('i.done-icon.icon.material-icons', 'done')))
    ]
  }
}

module.exports = Classes
