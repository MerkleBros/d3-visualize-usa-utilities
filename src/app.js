import * as d3 from 'd3'
import geoJsonData from '../data/gz_2010_us_040_00_5m.json'
import energyData from '../data/eia-state-total-energy-rankings.csv'
import abbreviateState from './convertStates.js'

geoJsonData.features.forEach((feature) => {
  let data = energyData.find((obj) => {
    return obj.State == abbreviateState(feature.properties.NAME, "abbr")
  }) 
  feature.energy = data
})

// Make a chloropleth for U.S States' share of power production
let domain = geoJsonData.features.map(
  (feature) => feature.energy["Production, U.S. Share"])

let colorScale = d3.scaleQuantile()
  .domain(domain)
  .range(d3.schemeBlues[7]);

console.log("schemeBlues: ", d3.schemeBlues[7])
console.log("colorScale: ", colorScale)
console.log(colorScale.invertExtent(d3.schemeBlues[7][0]))

let path = d3.geoPath()
  .projection(d3.geoAlbersUsa())

let svg = document
  .createElementNS("http://www.w3.org/2000/svg", "svg");

document.body.appendChild(svg)

// Map with US Power Production 
d3.select("svg")
  .selectAll("path")
  .data(geoJsonData.features)
  .enter()
  .append("path")
  .attr("d", path)
  .style("fill", function(d) {
    return colorScale(d.energy["Production, U.S. Share"])
})

// Legend
d3.select("svg")
  .append("g")
  .attr("class", "legend")

//Legend background 
d3.select("g.legend")
  .append('rect')
  .style("fill", () => "#ffffff")
  .attr("width", 100)
  .attr("height", 135)
  .attr("transform", "translate(100 0)")

// Legend boxes
let legend = d3
  .select("g")
  .selectAll('g.legendEntry')
  .data(d3.schemeBlues[7])
  .enter()
  .append('g')
  .attr('class','legendEntry')
  .attr("transform", "translate(100 0)")

legend
  .append('rect')
  .attr("x", 0)
  .attr("y", function(d, i) {
     return i * 20;
  })
 .attr("width", 10)
 .attr("height", 10)
 .style("stroke", "black")
 .style("stroke-width", 1)
 .style("fill", function(d){return d;})

// Legend text
let legendText = legend
  .append("text")

let legendTextLabels = legendText
  .attr("x", 20)
  .attr("y", function(d, i) {
    return i * 20;
  })
  .text( function (d) {return d;})
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .attr("fill", "black");
