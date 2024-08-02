function calculateDimensions(aspectRatio) {
  const width = window.innerWidth;
  const height = width / aspectRatio;
  return {
      width: width,
      height: height > window.innerHeight ? window.innerHeight : height
  };
}
function filter_and_unpack(data_use, key, year) {
return data_use.filter(row => row['year'] == year).map(row => row[key])
}

const dimensions = calculateDimensions(2);
var variable_list = ['Life Ladder', 'Log GDP per capita', 'Social support', 'Freedom to make life choices', 'Perceptions of corruption'];
var zmin_list = [1.2, 5.5, 0.2, 0.2, 0];
var zmax_list = [8.1, 12, 1, 1, 1];
var delta_zmin_list = [-2, -1.7, -0.4, -0.35, -0.3];
var delta_zmax_list = [2, 1.7, 0.4, 0.35, 0.3];
var update = true;
function data_presentation(variable, type, update) {
var data_use = data.filter(function (value) {
  return value[variable] != null
});
if (type == 'change') {
  var data_use2 = [];
  for (var i = 0; i < data_use.length; i ++) {
      data1 = data_use[i];
      data2 = data_use.filter(function (value) {
          return value['Country name'] == data1['Country name'] & value['year'] == data1['year'] + 1
      });
      if (data2.length == 1) {
          data2 = data2[0];
          data_add = {'Country name': data2['Country name'], 'year': data2['year']};
          data_add[variable] = data2[variable] - data1[variable];
          data_use2.push(data_add);
      }
  }
  data_use = data_use2;
}
var year_min = Math.min.apply(null, data_use.map(function(item) { return item.year; }));
var year_max = Math.max.apply(null, data_use.map(function(item) { return item.year; }));
var year = year_min;
var n = year_max - year_min;
var frames = [];
var slider_steps = [];
for (var i = 0; i <= n; i++) {
var z = filter_and_unpack(data_use, variable, year);
var locations = filter_and_unpack(data_use, 'Country name', year);
frames[i] = {data: [{z: z, locations: locations, text: locations}], name: year}
slider_steps.push ({
    label: year.toString(),
    method: "animate",
    args: [[year], {
        mode: "immediate",
        transition: {duration: 300},
        frame: {duration: 300}
      }
    ]
  })
  year = year + 1;
  }

var color_list = ['rgb(255, 0, 0)', 'rgb(255, 128, 0)', 'rgb(255, 255, 0)', 'rgb(0, 153, 153)', 'rgb(51, 51, 255)'];
var color_scale_list = [];
var color_value = 0;
var color_delta = 1 / (color_list.length - 1);
for (var i = 0; i < color_list.length; i++) {
  color_scale_list[i] = [color_value,color_list[i]];
  color_value = color_value + color_delta;
  }
var reverse = false;
if (variable == 'Perceptions of corruption') {
  reverse = true;
}
var index = variable_list.indexOf(variable);
var zmin = zmin_list[index];
var zmax = zmax_list[index];
if (type == 'change') {
  var zmin = delta_zmin_list[index];
  var zmax = delta_zmax_list[index];
}

var data_plot = [{
    type: 'choropleth',
    locationmode: 'country names',
    locations: frames[0].data[0].locations,
    z: frames[0].data[0].z,
    text: frames[0].data[0].locations,
    hovertemplate: "<b>%{text}: %{z:.3f}</b>",
    name: "",
    colorscale: color_scale_list,
    autocolorscale: false,
    reversescale: reverse,
    zauto: false,
    zmin: zmin,
    zmax: zmax, 
    colorbar: {
         autotic: false,
         title: variable
     }
}];

var layout = {
  title: variable + ' by Country or Region',
  geo:{
     scope: 'world',
     countrycolor: 'rgb(255, 255, 255)',
     showland: true,
     landcolor: 'rgb(217, 217, 217)',
     showlakes: true,
     lakecolor: 'rgb(255, 255, 255)',
     subunitcolor: 'rgb(255, 255, 255)',
     lonaxis: {},
     lataxis: {}
  },
  margin: { r: 0, t: 60, b: 0, l: 0 },
  autosize: true,
  updatemenus: [{
    x: 0.1,
    y: 0,
    yanchor: "top",
    xanchor: "right",
    showactive: false,
    direction: "left",
    type: "buttons",
    pad: {"t": 87, "r": 10},
    buttons: [{
      method: "animate",
      args: [null, {
        fromcurrent: true,
        transition: {
          duration: 200,
        },
        frame: {
          duration: 500
        }
      }],
      label: "Play"
    }, {
      method: "animate",
      args: [
        [null],
        {
          mode: "immediate",
          transition: {
            duration: 0
          },
          frame: {
            duration: 0
          }
        }
      ],
      label: "Pause"
    }]
  }],
  sliders: [{
    active: 0,
    steps: slider_steps,
    x: 0.1,
    len: 0.9,
    xanchor: "left",
    y: 0,
    yanchor: "top",
    pad: {t: 50, b: 10},
    currentvalue: {
      visible: true,
      prefix: "Year: ",
      xanchor: "right",
      font: {
        size: 20,
        color: "#666"
      }
    },
    transition: {
      duration: 300,
      easing: "cubic-in-out"
    }
  }]
};
if (update == false) {
Plotly.newPlot('myDiv', data_plot, layout).then(function() {
  Plotly.addFrames('myDiv', frames);
});
} else {
Plotly.react('myDiv', data_plot, layout).then(function() {
  Plotly.addFrames('myDiv', frames);
});}
}

data_presentation('Life Ladder', 'value');
update = true;

function dataManipulation() {
  var selectBox1 = document.getElementById("Variable");
  var variable = selectBox1.options[selectBox1.selectedIndex].value;
  var selectBox2 = document.getElementById("Type");
  var type = selectBox2.options[selectBox2.selectedIndex].value;
  data_presentation(variable, type, update);
}


function searchLocation(variable, locationName, update) {
  var color0 = 'rgb(0, 102, 204)';
  if (variable == 'Perceptions of corruption') {
      color0 = 'rgb(204, 0, 0)';
  }
  var data_use = data.filter(function (value) {
      return value[variable] != null
  });
  var data_use = data_use.filter(d => d["Country name"].toLowerCase() === locationName.toLowerCase());
  if (data_use.length >= 1) {
  var data0 = data_use[0];
  var locationname = data0["Country name"];
  var trace = {
    x: data_use.map((element) => element['year']),
    y: data_use.map((element) => element[variable]),
    mode: 'lines+markers',
    hovertemplate: "(%{x}, %{y:.3f})", 
    name: '', 
    marker: {
        color: color0
    },
    line: {
        color: color0
    }
  };
  var data_plot = [trace];
  var layout = {
    title: variable + ' of ' + locationname,
    xaxis: {
      title: {
        text: 'year',
        font: {
          family: 'Arial',
          size: 16,
          color: '#7f7f7f'
        }
      }
    }
  };
if (update == false) {
Plotly.newPlot('myDiv', data_plot, layout);
} else {
Plotly.react('myDiv', data_plot, layout);}
} else {
Plotly.purge('myDiv');
}
}

function searchLocationUpdate() {
  var selectBox1 = document.getElementById("Variable");
  var variable = selectBox1.options[selectBox1.selectedIndex].value;
  const searchButton = document.getElementById("searchButton");
  const locationInput = document.getElementById("locationInput");
  const locationName = locationInput.value.trim();
  var update = true;
  if (locationName.length > 0) {
      searchLocation(variable, locationName, update);
  } else {
      alert("Please input the name of a location!");
  }
}


function figselect() {
  var choice1_html1 = '\n                <h4>Variable</h4>\n                <div class=\"user-control\">\n                    <select id=\"Variable\" class=\"form-control\" onchange=\"dataManipulation()\">\n                        <option value=\"Life Ladder\">Life Ladder</option>\n                        <option value=\"Log GDP per capita\">Log GDP per Capita</option>\n                        <option value=\"Social support\">Social Support</option>\n                        <option value=\"Freedom to make life choices\">Freedom to Make Life Choices</option>\n                        <option value=\"Perceptions of corruption\">Perceptions of Corruption</option>\n                    </select>\n                </div>\n            ';
  var choice1_html2 = '\n                <h4>Variable</h4>\n                <div class=\"user-control\">\n                    <select id=\"Variable\" class=\"form-control\" onchange=\"searchLocationUpdate()\">\n                        <option value=\"Life Ladder\">Life Ladder</option>\n                        <option value=\"Log GDP per capita\">Log GDP per Capita</option>\n                        <option value=\"Social support\">Social Support</option>\n                        <option value=\"Freedom to make life choices\">Freedom to Make Life Choices</option>\n                        <option value=\"Perceptions of corruption\">Perceptions of Corruption</option>\n                    </select>\n                </div>\n            ';
  var choice2_html1 = '\n                <h4>Type</h4>\n                <div class=\"user-control\">\n                    <select id=\"Type\" class=\"form-control\" onchange=\"dataManipulation()\">\n                        <option value=\"value\">Value</option>\n                        <option value=\"change\">Change</option>\n                    </select>\n                </div>\n            ';
  var choice2_html2 = '\n                <h4>Location</h4>\n                </label>\n        <input type=\"text\" id=\"locationInput\" value=\"Afghanistan\" placeholder=\"Please input the name of a location\">\n        <button id=\"searchButton\">Search</button>\n    ';
  var selectBox = document.getElementById("Plot");
  var plot = selectBox.options[selectBox.selectedIndex].value;
  if (plot == 'World Map') {
      var update = false;
      document.getElementById("div_choice1").innerHTML = choice1_html1;
      document.getElementById("div_choice2").innerHTML = choice2_html1;
      var selectBox1 = document.getElementById("Variable");
      var variable = selectBox1.options[selectBox1.selectedIndex].value;
      var selectBox2 = document.getElementById("Type");
      var type = selectBox2.options[selectBox2.selectedIndex].value;
      data_presentation(variable, type, update);
  } else {
      Plotly.purge('myDiv');
      var update = false;
      document.getElementById("div_choice1").innerHTML = choice1_html2;
      document.getElementById("div_choice2").innerHTML = choice2_html2;
      const searchButton = document.getElementById("searchButton");
      const locationInput = document.getElementById("locationInput");
      searchButton.addEventListener("click", function() {
          const locationName = locationInput.value.trim();
          var selectBox1 = document.getElementById("Variable");
          var variable = selectBox1.options[selectBox1.selectedIndex].value;
          if (locationName.length > 0) {
              searchLocation(variable, locationName, update);
          } else {
              alert("Please input the name of a location!");
          }
      });
  }
}

window.addEventListener('resize', function() {
  const newDimensions = calculateDimensions(2);
  Plotly.relayout('myDiv', {
      width: newDimensions.width,
      height: newDimensions.height * 0.82
  });
});
