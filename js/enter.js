const $ = require('jquery');
const CookieManager = require('./CookieManager.js');
const Cookies = require('js-cookie');
const Structures = require('./DataStructures.js');

var cookieManager = new CookieManager(Cookies);
global.cookieManager = cookieManager;

var getDayOptions = function() {
    return cookieManager.get("dayopts") || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; 
};

var options = getDayOptions().map((opt) => '<option value="' + opt + '">' + opt + '</option>');
var addOption = function(opt) {
    options.append('<option value="' + opt + '">' + opt + '</option>');
};

/*
after entering a section on the sections website, clicking add another section generates the new section with the same default time
do validation
change colors when users hover and stuff
*/

var generateSectionInputField = function() {
    var id = Date.now();
    var output = $('<div id="' + id + '" class="section"></div>');
    var select = $('<select></select>');
    select.append(options);
    var startTimeField = $('<input type="text" class="inputBox time-entry" placeholder="Start Time" maxlength="10"></input>');
    var endTimeField = $('<input type="text" class="inputBox time-entry" placeholder="End Time" maxlength="10"></input>');;
    output.append(select);
    output.append(startTimeField);
    output.append(endTimeField);
    var deleteButton = $('<a class="dismiss center-vertical delete-section" href="#"><i class="material-icons">cancel</i></a>');
    deleteButton.click(function() {
        $('#' + id).remove();
    });
    output.append(deleteButton);
    return output;
};

var removeNonNumbers = function(string) {
    var validChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':'];
    var out = '';
    for (var c of string) {
        if (validChars.indexOf(c) > -1)
            out += c;
    }
    return out;
};

// like the old parsing function, but with more validation
var parseTime = function(timestring) {
    /**
     * 1) user enters either a single number (hour) or hour:min
     * 2) user enters either 24hr or am/pm
     */
    timestring = timestring.trim();
    // check if AM/PM is specified
    var tokens = timestring.split(/[\sap]/);
    var checkTime = function(time) { // time is an int array :)
        var hour = time[0];
        var min = time[1];
        return hour <= 24 && hour >= 0 && min >= 0 && min <= 60;
    };
    var getTime = function(time) { // time is a string array
        if (time.length != 1 && time.length != 2)
            throw new Error("Failed to parse time " + tokens[0]);
        if (time.length == 1)
            return [parseInt(time[0]), 0];
        else
            return [parseInt(time[0]), parseInt(time[1])]
    };
    getTime = (time) => checkTime(getTime(time));
    switch (tokens.length) {
        case 1: // TODO interpret either as 24hr or as most likely 12hr input
            return getTime(tokens[0].split(':'));
        case 2: // someone told AM/PM (or o'clock)
            var pm = false;
            var word = tokens[1].toUpperCase();
            if (word === 'AM');
            else if (word === 'PM')
                pm = true
            else if (word === 'O\'CLOCK');
            else
                throw new Error("Failed to parse time " + tokens)
            var [hour, min] = getTime(tokens[0].split(':'));
            return [hour + (pm ? (hour < 12 ? 12 : 0) : 0), min]
        case 0:
        default:
            throw new Error("Bad timestring, tokenized as " + tokens);
    }
}

var parseTimeOld = function(timestring) {
    // "8am" -> [8,0]
    // "8:15" -> [8:15]
    // Returns a promise

    timestring = timestring.trim();
    var pm = timestring.toLowerCase().indexOf('p') > -1;
    var [hour, min] = removeNonNumbers(timestring).split(':');
    [hour, min] = [parseInt(hour), parseInt(min)];
    return [hour + (pm ? (hour < 12 ? 12 : 0) : 0), min || 0]
};

var readSection = function(sectionDom) {
    var day = $(sectionDom.children[0]).val();
    var start = parseTime($(sectionDom.children[1]).val());
    var end = parseTime($(sectionDom.children[2]).val());
    return [day, start, end];
};

var saveCourse = function() {
    var courseName = $('#course-name').val().trim();
    var sectionDoms = $('#enter-section').children();
    var sections = [];
    for (var i = 0; i < sectionDoms.length; i++) {
        sections.push(readSection(sectionDoms[i]));
    }

    var courses = cookieManager.getJSON('courses') || {};
    courses[courseName] = sections;
    cookieManager.set('courses', courses);
    window.location.href = '/classes';
};

$(function() {
    $('#add-section-button').click(function() {
        $('#enter-section').append(generateSectionInputField());
    });
    $('#done-button').click(function() {
        saveCourse();
    });
});