const API_URL = 'http://live.krlx.org/data.php';
const moment = require('../../assets/moment.min.js');


// The RegEx to resolve student images from the directory
const DIR_REG = new RegExp('(<div class="email"><span class="icon">' +
  '\\n{0,1}<\\/span>(\\w+)&nbsp;)|<span class="icon"><\\/span><a href="mailto:(\\w+)@carleton.edu">');
const HOST_REG = new RegExp('(\\S+) ([^\\s\\d]+ )+(\'(\\d\\d)?|)|(\\S+) (\\S+)');

/**
 * Take a host string in the form of Will Beddow '22 and return a widget with a picture of, and information
 * about, the host
 * @param host_str
 */
function get_host_widget(host_str) {
  let parsed_host_str = HOST_REG.exec(host_str);
  let first_name = null;
  let last_name = null;
  let class_year = null;
  try {
    first_name = parsed_host_str[1];
    last_name = parsed_host_str[2];
    class_year = "20" + parsed_host_str[3];
  }
  catch (error) {
    first_name = parsed_host_str[5];
    last_name = parsed_host_str[6];
  }
  let username = null;
  let data = $.get({
    url: 'https://apps.carleton.edu/campus/directory/?first_name=' + first_name + '&last_name=' + last_name + '' +
      '&search_for=student',
    success: function (data) {
      let parsed_page = DIR_REG.exec(data);
      username = parsed_page[1];
      if (!username) {
        username = parsed_page[3];
      }
    },
    async: false
  });
  let img_url = 'https://apps.carleton.edu/stock/ldapimage.php?id=' + username + '&source=campus_directory';
  // Construct a widget
  return "<li class=''>" +
    "<img class=' rounded-circle' width=50 size=50 src='" + img_url + "' alt='" + host_str + "'>" +
    "<b>" + "  " + host_str + "</b>" +
    "</li>"
}


function get_show_widget(show, hosts) {
  let start_d = new Date();
  let end_d = new Date();
  if (!show.start) {
    show.start = "17:00"
  }
  if (!show.end) {
    show.end = "19:00"
  }
  if (!show.day) {
    show.day = start_d.getDay();
  }
  if (!show.description) {
    show.description = "No description found";
  }
  //[year, month, day, hour, minute, second, millisecond]
  let start_split = show.start.split(":");
  start_d.setHours(start_split[0], start_split[1]);
  let end_split = show.end.split(":");
  end_d.setHours(end_split[0], end_split[1]);
  let start = moment(start_d);
  let end = moment(end_d);
  let remaining = end.fromNow();
  if (remaining.includes("ago")) {
    remaining = end.toNow();
  }
  let card = "<div >\n" +
    "  <div >\n" +
    "    <h4 class=\"card-title\">" + show.title + "</h4>\n" +
    "    <h6 class=\"card-subtitle mb-2 text-muted\">" + start.format("h:mm A") + "-" + end.format("h:mm A") + "</h6>\n" +
    "    <p class=\"card-text\">" + show.description +
    "</p>\n" +
    " <ul class='list-group'>";
  for (host of hosts) {
    card += host;
  }
  card +=
    " </ul><br><p>Ends " + remaining + "</p></div>\n" +
    "</div>";
  return card
}

function get_show_widget_mini(show, hosts) {
  let start_d = new Date();
  let end_d = new Date();
  if (!show.start) {
    show.start = "17:00"
  }
  if (!show.end) {
    show.end = "19:00"
  }
  if (!show.day) {
    show.day = start_d.getDay();
  }
  if (!show.description) {
    show.description = "No description found";
  }
  //[year, month, day, hour, minute, second, millisecond]
  let start_split = show.start.split(":");
  start_d.setHours(start_split[0], start_split[1]);
  let end_split = show.end.split(":");
  end_d.setHours(end_split[0], end_split[1]);
  let start = moment(start_d);
  let end = moment(end_d);
  let remaining = end.fromNow();
  if (remaining.includes("ago")) {
    remaining = end.toNow();
  }
  let card =
    "    <h5 class=\"card-title\" style=\"Color:#FFF ;    overflow: scroll; width:300px ;   white-space: nowrap;\" >" + show.title + "</h5>\n" +
    "    <h6 class=\" mb-2 \">" + start.format("h:mm A") + "-" + end.format("h:mm A") + "</h6>\n"

  return card
}

function handle_data(data) {
  console.log(data);
  if (data.status === "on_air") {
    $("#currstatus2")[0].innerHTML = "<span class=\"badge badge-pill badge-success\">On Air</span>";

    let dj_widgets = [];
    for (dj of data.now.djs) {
      let widget = get_host_widget(dj);
      dj_widgets.push(widget);
    }
    let show_widget = get_show_widget(data.now, dj_widgets);
    let show_widget_mini = get_show_widget_mini(data.now, dj_widgets);

    $("#currshow")[0].innerHTML = show_widget;
    $("#currshow1")[0].innerHTML = show_widget_mini;

    // curr_songs = data.songs;
    // set_songs(1);
    let next_widget = "<div>";
    // for (show of data.next) {
    //   show_widget = get_upcoming_widget(show);
    //   next_widget += show_widget;
    // }
    // next_widget += '</div>';
    // $("#upcoming")[0].innerHTML = next_widget;
  }
  else {
    $("#currstatus")[0].innerHTML = "<span class='badge badge-pill badge-danger'>" + data.status + "</span>";
  }
}

/**
 * Query the stream information from API_URL
 */
function query_stream() {
  $.getJSON({
    url: API_URL,
    success: function (data) {
      console.log("Got KRLX data");
      handle_data(data)
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Query errror " + jqXHR + " " + textStatus + " " + errorThrown + " trying to fix...");
      $.get({
        url: API_URL,
        success: function (data) {
          let parsed_data = JSON.parse(data);
          console.log("Fixed stream data");
          handle_data(parsed_data);
        }
      })
    }
  });
}

$(document).ready(function () {

  query_stream();
  // The handler for checking the KRLX API every 30 seconds
  setInterval(query_stream, 30000);
  query_stream();
  // check_updates();
});

