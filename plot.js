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

function select_box_design() {
    document.getElementById('myDiv').on('plotly_selected', function(eventData) {
        if (eventData) {
            const selectedCountries = eventData.points.map(p => p.text);
            updateSelection(selectedCountries);
        }
    });

    document.getElementById('myDiv').on('plotly_deselect', function() {
        clearSelection();
    });
}

function updateSelection(selectedCountries) {
    for (let frame_plot of frames_plot) {
        frame_plot.data[0].selectedpoints = frame_plot.data[0].locations.map((loc, i) => 
            selectedCountries.includes(loc) ? i : -1
        ).filter(i => i !== -1);
    }
}

function clearSelection() {
    for (let frame_plot of frames_plot) {
        delete frame_plot.data[0].selectedpoints; 
    }
}


const dimensions = calculateDimensions(2);
variable_list = ['Life Ladder', 'Log GDP per capita', 'Social support', 'Freedom to make life choices', 'Perceptions of corruption', 'Positive affect', 'Negative affect'];
var zmin_list = [1.2, 5.5, 0.2, 0.2, 0, 0.15, 0];
var zmax_list = [8.1, 12, 1, 1, 1, 0.9, 0.7];
var delta_zmax_list = [2, 1.7, 0.4, 0.35, 0.3, 0.2, 0.35];
var delta_zmin_list = delta_zmax_list.map(function(item) { return -item; });
update = true;
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
frames_plot = [];
var slider_steps = [];
for (var i = 0; i <= n; i++) {
var z = filter_and_unpack(data_use, variable, year);
var locations = filter_and_unpack(data_use, 'Country name', year);
frames_plot[i] = {data: [{z: z, locations: locations, text: locations}], name: year}
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
if (variable == 'Perceptions of corruption' | variable == 'Negative affect') {
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
    locations: frames_plot[0].data[0].locations,
    z: frames_plot[0].data[0].z,
    text: frames_plot[0].data[0].locations,
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
  Plotly.addFrames('myDiv', frames_plot);
  update = true;
});
} else {
Plotly.react('myDiv', data_plot, layout).then(function() {
  Plotly.addFrames('myDiv', frames_plot);
});}
select_box_design();
}

data_presentation('Life Ladder', 'value');

function dataManipulation() {
  var selectBox1 = document.getElementById("Variable");
  var variable = selectBox1.options[selectBox1.selectedIndex].value;
  var selectBox2 = document.getElementById("Type");
  var type = selectBox2.options[selectBox2.selectedIndex].value;
  data_presentation(variable, type, update);
}


function searchLocation1(variable, locationName_string, update, compare_ornot) {
  var data_plot = [];
  var color_list = ['rgb(0, 102, 204)', 'rgb(0, 153, 153)', 'rgb(102, 204, 0)', 'rgb(102, 0, 204)', 'rgb(255, 102, 178)', 'rgb(255, 51, 255)', 'rgb(204, 0, 102)'];
  var data_use = data.filter(function (value) {
      return value[variable] != null
  });
  locationName_list = locationName_string.split(';');
  var color_num = 0;
  for (var i = 0; i < locationName_list.length; i++) {
  locationName = locationName_list[i];
  locationName = locationName.trim();
  var data_use2 = data_use.filter(d => d["Country name"].toLowerCase() === locationName.toLowerCase());
  if (data_use2.length >= 1) {
  var data0 = data_use2[0];
  var locationname = data0["Country name"];
  var plot_or_not = true
  if (data_plot.length >= 1) {
    country_plot = data_plot.map((element) => element['name']);
    if (country_plot.indexOf(locationname) != -1) {
      plot_or_not = false;
    }
  }
  if (plot_or_not == true) {
    if (compare_ornot == false) {
      var trace = {
        x: data_use2.map((element) => element['year']),
        y: data_use2.map((element) => element[variable]),
        mode: 'lines+markers',
        hovertemplate: "(%{x}, %{y:.3f})", 
        name: locationname, 
        marker: {
            color: color_list[color_num]
        },
        line: {
            color: color_list[color_num]
        }
      };
    } else {
      var y1_list = data_use2.map((element) => element[variable]);
      var y2_list = y1_list.map(x => 100 * x / y1_list[0]);
      var trace = {
        x: data_use2.map((element) => element['year']),
        y: y2_list,
        text: y1_list, 
        mode: 'lines+markers',
        hovertemplate: "(%{x}, %{text:.3f})", 
        name: locationname, 
        marker: {
            color: color_list[color_num]
        },
        line: {
            color: color_list[color_num]
        }
      };
    }
  color_num = color_num + 1;
  data_plot.push(trace);}}}
  var plot_title = variable + ' of ';
  var title_length_max = 165;
  var title_size_initial = 17;

  if (data_plot.length == 1) {
    plot_title = plot_title + data_plot[0].name;
  } else if (data_plot.length == 2) {
    plot_title = plot_title + data_plot[0].name + ' and ' + data_plot[1].name;
  }
    else if (data_plot.length >= 3) {
      for (var i0 = 0; i0 < data_plot.length; i0++) {
        if (i0 < data_plot.length - 2) {
          plot_title = plot_title + data_plot[i0].name + ', '
        } else if (i0 == data_plot.length - 2) {
          plot_title = plot_title + data_plot[i0].name + ' and '
        } else {
          plot_title = plot_title + data_plot[i0].name
        }
      }
    }
  var y_axis_title = variable;
  var y_title_size = 16;
  if (compare_ornot == true) {
    plot_title = plot_title + ' (Compared to the first year documented, %)';
    if (y_axis_title == 'Freedom to make life choices') {
      y_title_size = 14;
    } else if (y_axis_title == 'Perceptions of corruption') {
      y_title_size = 15;
    }
    y_axis_title = y_axis_title + ' (Compared to the first year documented, %)';
  }
  if (plot_title.length <= title_length_max) {
    var title_size = title_size_initial;
  } else {
    title_size = title_size_initial * title_length_max / plot_title.length;
  }
  var layout = {
    title: {text: plot_title,
            font: {size: title_size}},
    xaxis: {
      title: {
        text: 'year',
        font: {
          family: 'Arial',
          size: 16,
          color: '#7f7f7f'
        }
      }, 
      dtick: 1
    },
    yaxis: {
      title: {
        text: y_axis_title,
        font: {
          family: 'Arial',
          size: y_title_size,
          color: '#7f7f7f'
        }
      }
    }
  };
if (data_plot.length >= 1) {
if (update == false) {
Plotly.newPlot('myDiv', data_plot, layout);
update = true;
} else {
Plotly.react('myDiv', data_plot, layout);}
} else {
Plotly.purge('myDiv');
update = false;
}
}

function searchLocation1Update() {
  var selectBox1 = document.getElementById("Variable");
  var variable = selectBox1.options[selectBox1.selectedIndex].value;
  const locationInput = document.getElementById("locationInput");
  const locationName_string = locationInput.value.trim();
  const compareSelectbox = document.getElementsByName("compareValue")[0];
  const compare_ornot = compareSelectbox.checked;
  if (locationName_string.length > 0) {
    searchLocation1(variable, locationName_string, update, compare_ornot);
  } else {
    alert("Please input locations connected with semicolons!");
  }
}


function searchLocation2(variable_ornot, locationName, update) {
  var data_plot = [];
  var color_list = ['rgb(0, 102, 204)', 'rgb(0, 153, 153)', 'rgb(102, 204, 0)', 'rgb(102, 0, 204)', 'rgb(255, 102, 178)', 'rgb(255, 51, 255)', 'rgb(204, 0, 102)'];
  var data_use = data.filter(d => d["Country name"].toLowerCase() === locationName.toLowerCase());
  if (data_use.length >= 1) {
  var data0 = data_use[0];
  var locationname = data0["Country name"];
  for (var i1 = 0; i1 < variable_list.length; i1++) {
    var variable = variable_list[i1];
    var year_list = data_use.map((element) => element['year']);
    var y_list = data_use.map((element) => element[variable]);
    var data_list = [];
    for (var i2 = 0; i2 < year_list.length; i2++) {
      data_list[i2] = {year: year_list[i2]};
      data_list[i2][variable] = y_list[i2];
    }
    var data_list2 = data_list.filter(function (value) {
      return value[variable] != null
    });
    if (data_list2.length >= 1 & variable_ornot[i1] == true) {
      var y1_list = data_list2.map((element) => element[variable]);
      var y2_list = y1_list.map(x => 100 * x / y1_list[0]);
      var trace = {
        x: data_list2.map((element) => element['year']),
        y: y2_list,
        text: y1_list, 
        mode: 'lines+markers',
        hovertemplate: "(%{x}, %{text:.3f})", 
        name: variable, 
        marker: {
            color: color_list[i1]
        },
        line: {
            color: color_list[i1]
        }
      };
      data_plot.push(trace);
    }}
  }
  if (data_plot.length >= 2) {
    var plot_title = 'All the variables of ' + locationname;
  } else if (data_plot.length == 1) {
    var plot_title = data_plot[0].name + ' of ' + locationname;
  } else {
    var plot_title = locationname;
  }
  var plot_title = plot_title + " (Compared to the first year documented, %)";
  var layout = {
    title: plot_title,
    xaxis: {
      title: {
        text: 'year',
        font: {
          family: 'Arial',
          size: 16,
          color: '#7f7f7f'
        }
      }, 
      dtick: 1
    }, 
    yaxis: {
      title: {
        text: 'Compared to the first year documented (%)',
        font: {
          family: 'Arial',
          size: 16,
          color: '#7f7f7f'
        }
      }
    }
  };
if (data_plot.length >= 1) {
if (update == false) {
Plotly.newPlot('myDiv', data_plot, layout);
update = true;
} else {
Plotly.react('myDiv', data_plot, layout);}
} else {
Plotly.purge('myDiv');
update = false;
}
}

function searchLocation2Update() {
  var selectBox1 = document.getElementById("Variable");
  var variable = selectBox1.options[selectBox1.selectedIndex].value;
  const locationInput = document.getElementById("locationInput");
  const locationName = locationInput.value.trim();
  update = true;
  var variable_ornot = [];
  if (variable == 'All the variables') {
    for (var i = 0; i < variable_list.length; i++) {
      variable_ornot.push(true);
    }
  } else {
  for (var i = 0; i < variable_list.length; i++) {
    variable_ornot.push(false);
  }
  true_index = variable_list.indexOf(variable);
  variable_ornot[true_index] = true;}
  if (locationName.length > 0) {
    searchLocation2(variable_ornot, locationName, update);
  } else {
    alert("Please input a location!");
  }
}


function histogramPlot(variable, update) {
  var data_use = data.filter(function (value) {
    return value[variable] != null
  });
  var color0 = 'rgb(0, 102, 204)';
  if (variable == 'Perceptions of corruption' | variable == 'Negative affect') {
      color0 = 'rgb(204, 0, 0)';
  }
  var year_min = Math.min.apply(null, data_use.map(function(item) { return item.year; }));
  var year_max = Math.max.apply(null, data_use.map(function(item) { return item.year; }));
  var year = year_min;
  var n = year_max - year_min;
  var histograms_plot = [];
  var slider_steps = [];
  for (var i = 0; i <= n; i++) {
    var x = filter_and_unpack(data_use, variable, year);
    histograms_plot[i] = {data: [{x: x}], name: year}
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
  var data_plot = [{
    type: 'histogram',
    x: histograms_plot[0].data[0].x,
    histnorm: 'probability',
    marker: {color: color0}, 
    name: '', 
    hovertemplate: 'Interval: <b>%{x}</b><br>Frequency: <b>%{y:.3f}</b>'
  }];
  var layout = {
    title: variable + ' (distribution)',
    xaxis: {
      title: {
        text: variable,
        font: {
          family: 'Arial',
          size: 16,
          color: '#7f7f7f'
        }
      }
    }, 
    yaxis: {
      title: {
        text: 'Frequency',
        font: {
          family: 'Arial',
          size: 16,
          color: '#7f7f7f'
        }
      }
    },
    margin: { r: 50, t: 60, b: 0, l: 100 },
    autosize: true,
    updatemenus: [{
      x: 0.05,
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
      x: 0.05,
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
      Plotly.addFrames('myDiv', histograms_plot);
    });
    update = true;
    } else {
    Plotly.react('myDiv', data_plot, layout).then(function() {
      Plotly.addFrames('myDiv', histograms_plot);
    });}
}

function histogramUpdate() {
  var selectBox1 = document.getElementById("Variable");
  var variable = selectBox1.options[selectBox1.selectedIndex].value;
  histogramPlot(variable, update);
}


function densityPlot(variable1, variable2, update) {
  var data_use = data.filter(function (value) {
    return value[variable1] != null & value[variable2] != null
  });
  var year_min = Math.min.apply(null, data_use.map(function(item) { return item.year; }));
  var year_max = Math.max.apply(null, data_use.map(function(item) { return item.year; }));
  var year = year_min;
  var n = year_max - year_min;
  var density_plot = [];
  var slider_steps = [];
  for (var i = 0; i <= n; i++) {
    var x = filter_and_unpack(data_use, variable1, year);
    var y = filter_and_unpack(data_use, variable2, year);
    density_plot[i] = {data: [{x: x, y: y}], name: year}
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
  console.log(density_plot);
  var data_plot = [{
    type: 'histogram2dcontour', 
    x: density_plot[0].data[0].x,
    y: density_plot[0].data[0].y, 
    name: 'density',
    ncontours: 20,
    colorscale: 'Hot',
    reversescale: true,
    showscale: false
  }];
  var layout = {
    title: variable1 + ' and ' + variable2 + ' (density)',
    showlegend: false,
    xaxis: {
      title: {
        text: variable1,
        font: {
          family: 'Arial',
          size: 16,
          color: '#7f7f7f'
        }
      }, 
      autorange: true
    }, 
    yaxis: {
      title: {
        text: variable2,
        font: {
          family: 'Arial',
          size: 16,
          color: '#7f7f7f'
        }
      }, 
      autorange: true
    },
    hovermode: 'closest',
    bargap: 0,
    margin: { r: 50, t: 60, b: 0, l: 100 },
    autosize: true,
    updatemenus: [{
      x: 0.05,
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
      x: 0.05,
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
      Plotly.addFrames('myDiv', density_plot);
    });
    update = true;
    } else {
    Plotly.react('myDiv', data_plot, layout).then(function() {
      Plotly.addFrames('myDiv', density_plot);
    });}
}

function densityUpdate() {
  var selectBox1 = document.getElementById("Variable1");
  var variable1 = selectBox1.options[selectBox1.selectedIndex].value;
  var selectBox2 = document.getElementById("Variable2");
  var variable2 = selectBox2.options[selectBox2.selectedIndex].value;
  densityPlot(variable1, variable2, update);
}

function figselect() {
  var choice1_html1 = '\n            <h4>Variable</h4>\n            <div class=\"user-control\">\n                <select id=\"Variable\" class=\"form-control\" onchange=\"dataManipulation()\">\n                    <option value=\"Life Ladder\">Life Ladder</option>\n                    <option value=\"Log GDP per capita\">Log GDP per capita</option>\n                    <option value=\"Social support\">Social support</option>\n                    <option value=\"Freedom to make life choices\">Freedom to make life choices</option>\n                    <option value=\"Perceptions of corruption\">Perceptions of corruption</option>\n                    <option value=\"Positive affect\">Positive affect</option>\n                    <option value=\"Negative affect\">Negative affect</option>\n                </select>\n            </div>\n        ';
  var choice1_html2 = '\n            <h4 class="inline">Variable</h4>&nbsp;&nbsp;<input type="checkbox" name="compareValue" onclick="searchLocation1Update()"><text>Compared to the first year documented</text>\n            <div class=\"user-control\">\n                <select id=\"Variable\" class=\"form-control\" onchange=\"searchLocation1Update()\">\n                    <option value=\"Life Ladder\">Life Ladder</option>\n                    <option value=\"Log GDP per capita\">Log GDP per capita</option>\n                    <option value=\"Social support\">Social support</option>\n                    <option value=\"Freedom to make life choices\">Freedom to make life choices</option>\n                    <option value=\"Perceptions of corruption\">Perceptions of corruption</option>\n                    <option value=\"Positive affect\">Positive affect</option>\n                    <option value=\"Negative affect\">Negative affect</option>\n                </select>\n            </div>\n        ';
  var choice1_html3 = '\n            <h4>Variable</h4>\n            <div class=\"user-control\">\n                <select id=\"Variable\" class=\"form-control\" onchange=\"searchLocation2Update()\">\n                    <option value=\"All the variables\">All the variables</option>\n                    <option value=\"Life Ladder\">Life Ladder</option>\n                    <option value=\"Log GDP per capita\">Log GDP per capita</option>\n                    <option value=\"Social support\">Social support</option>\n                    <option value=\"Freedom to make life choices\">Freedom to make life choices</option>\n                    <option value=\"Perceptions of corruption\">Perceptions of corruption</option>\n                    <option value=\"Positive affect\">Positive affect</option>\n                    <option value=\"Negative affect\">Negative affect</option>\n                </select>\n            </div>\n        ';
  var choice1_html4 = '\n            <h4>Variable</h4>\n            <div class=\"user-control\">\n                <select id=\"Variable\" class=\"form-control\" onchange=\"histogramUpdate()\">\n                    <option value=\"Life Ladder\">Life Ladder</option>\n                    <option value=\"Log GDP per capita\">Log GDP per capita</option>\n                    <option value=\"Social support\">Social support</option>\n                    <option value=\"Freedom to make life choices\">Freedom to make life choices</option>\n                    <option value=\"Perceptions of corruption\">Perceptions of corruption</option>\n                    <option value=\"Positive affect\">Positive affect</option>\n                    <option value=\"Negative affect\">Negative affect</option>\n                </select>\n            </div>\n        ';
  var choice1_html5 = '\n            <h4>Variable1</h4>\n            <div class=\"user-control\">\n                <select id=\"Variable1\" class=\"form-control\" onchange=\"densityUpdate()\">\n                    <option value=\"Life Ladder\">Life Ladder</option>\n                    <option value=\"Log GDP per capita\">Log GDP per capita</option>\n                    <option value=\"Social support\">Social support</option>\n                    <option value=\"Freedom to make life choices\">Freedom to make life choices</option>\n                    <option value=\"Perceptions of corruption\">Perceptions of corruption</option>\n                    <option value=\"Positive affect\">Positive affect</option>\n                    <option value=\"Negative affect\">Negative affect</option>\n                </select>\n            </div>\n        ';
  var choice2_html1 = '\n                <h4>Type</h4>\n                <div class=\"user-control\">\n                    <select id=\"Type\" class=\"form-control\" onchange=\"dataManipulation()\">\n                        <option value=\"value\">Value</option>\n                        <option value=\"change\">Change</option>\n                    </select>\n                </div>\n            ';
  var choice2_html2 = '\n                <h4>Location</h4>\n                </label>\n        <input type=\"text\" id=\"locationInput\" value=\"Finland;Denmark;Iceland;Sweden;Australia\" placeholder=\"Please input locations connected with semicolons\">\n        <button id=\"searchButton\">Search</button>\n    ';
  var choice2_html3 = '\n                <h4>Location</h4>\n                </label>\n        <input type=\"text\" id=\"locationInput\" value=\"Finland\" placeholder=\"Please input a location\">\n        <button id=\"searchButton\">Search</button>\n    ';
  var choice2_html4 = '';
  var choice2_html5 = '\n            <h4>Variable2</h4>\n            <div class=\"user-control\">\n                <select id=\"Variable2\" class=\"form-control\" onchange=\"densityUpdate()\">\n                    <option value=\"Life Ladder\">Life Ladder</option>\n                    <option value=\"Log GDP per capita\" selected>Log GDP per capita</option>\n                    <option value=\"Social support\">Social support</option>\n                    <option value=\"Freedom to make life choices\">Freedom to make life choices</option>\n                    <option value=\"Perceptions of corruption\">Perceptions of corruption</option>\n                    <option value=\"Positive affect\">Positive affect</option>\n                    <option value=\"Negative affect\">Negative affect</option>\n                </select>\n            </div>\n        ';
  var selectBox = document.getElementById("Plot");
  plot_fig = selectBox.options[selectBox.selectedIndex].value;
  if (plot_fig == 'World Map') {
      document.getElementById("div_choice1").innerHTML = choice1_html1;
      document.getElementById("div_choice2").innerHTML = choice2_html1;
      var selectBox1 = document.getElementById("Variable");
      var variable = selectBox1.options[selectBox1.selectedIndex].value;
      var selectBox2 = document.getElementById("Type");
      var type = selectBox2.options[selectBox2.selectedIndex].value;
      data_presentation(variable, type, update);
  } else if (plot_fig == 'Line Chart1') {
      document.getElementById("div_choice1").innerHTML = choice1_html2;
      document.getElementById("div_choice2").innerHTML = choice2_html2;
      const searchButton = document.getElementById("searchButton");
      const locationInput = document.getElementById("locationInput");
      const locationName_string = locationInput.value.trim();
      var selectBox1 = document.getElementById("Variable");
      var variable = selectBox1.options[selectBox1.selectedIndex].value;
      const compareSelectbox = document.getElementsByName("compareValue")[0];
      const compare_ornot = compareSelectbox.checked;
      searchLocation1(variable, locationName_string, update, compare_ornot);
      searchButton.addEventListener("click", function() {
          const locationName_string = locationInput.value.trim();
          var selectBox1 = document.getElementById("Variable");
          var variable = selectBox1.options[selectBox1.selectedIndex].value;
          const compareSelectbox = document.getElementsByName("compareValue")[0];
          const compare_ornot = compareSelectbox.checked;
          if (locationName_string.length > 0) {
            searchLocation1(variable, locationName_string, update, compare_ornot);
          } else {
            alert("Please input locations connected with semicolons!");
          }
      });}
      else if (plot_fig == 'Line Chart2') {
        var variable_ornot = [];
        for (var i = 0; i < variable_list.length; i++) {
          variable_ornot.push(true);
        }
        document.getElementById("div_choice1").innerHTML = choice1_html3;
        document.getElementById("div_choice2").innerHTML = choice2_html3;
        const searchButton = document.getElementById("searchButton");
        const locationInput = document.getElementById("locationInput");
        const locationName = locationInput.value.trim();
        searchLocation2(variable_ornot, locationName, update);
        searchButton.addEventListener("click", function() {
          document.getElementById("div_choice1").innerHTML = choice1_html3;
          const locationName = locationInput.value.trim();
          if (locationName.length > 0) {
            searchLocation2(variable_ornot, locationName, update);
          } else {
            alert("Please input a location!");
          }
      });
      }
      else if (plot_fig == 'Histogram') {
        document.getElementById("div_choice1").innerHTML = choice1_html4;
        document.getElementById("div_choice2").innerHTML = choice2_html4;
        var selectBox1 = document.getElementById("Variable");
        var variable = selectBox1.options[selectBox1.selectedIndex].value;
        histogramPlot(variable, update);
      }
      else {
        document.getElementById("div_choice1").innerHTML = choice1_html5;
        document.getElementById("div_choice2").innerHTML = choice2_html5;
        var selectBox1 = document.getElementById("Variable1");
        var variable1 = selectBox1.options[selectBox1.selectedIndex].value;
        var selectBox2 = document.getElementById("Variable2");
        var variable2 = selectBox2.options[selectBox2.selectedIndex].value;
        densityPlot(variable1, variable2, update);
      }
}


window.addEventListener('resize', function() {
  const newDimensions = calculateDimensions(2);
  Plotly.relayout('myDiv', {
      width: newDimensions.width,
      height: newDimensions.height * 0.82
  });
});
