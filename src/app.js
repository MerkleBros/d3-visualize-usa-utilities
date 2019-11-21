import * as d3 from 'd3'
import geoJsonData from '../data/gz_2010_us_040_00_5m.json'
import energyData from '../data/eia-state-total-energy-rankings.csv'
import abbrState from './convertStates.js'

// console.log("geojson: ", geoJsonData)
// console.log("energyData:", energyData)

geoJsonData.features.map((feature) => {
  let data = energyData.find((obj) => {
    return obj.State == abbrState(feature.properties.NAME, "abbr")
  }) 
  feature.energy = data
  console.log(feature)
})

// chloropleth
// Generate color scale
let domain = geoJsonData.features.map((feature) => feature.energy["Production, U.S. Share"])

var colorScale = d3.scaleQuantile()
  .domain(domain)
  .range(d3.schemeBlues[7]);

console.log("colorScale: ", colorScale)

let path = d3.geoPath()
  .projection(d3.geoAlbersUsa())

let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
document.body.appendChild(svg)

d3.select("svg")
  .selectAll("path")
  .data(geoJsonData.features)
  .enter()
  .append("path")
  .attr("d", path)
  .style("fill", function(d) {
    return colorScale(d.energy["Production, U.S. Share"])
  })

