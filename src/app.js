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

// console.log("schemeBlues: ", d3.schemeBlues[7])
// console.log("colorScale: ", colorScale)
// console.log(colorScale.invertExtent(d3.schemeBlues[7][0]))

let path = d3.geoPath()
  .projection(d3.geoAlbersUsa())

console.log(path)

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
  .style("fill", d => colorScale(d.energy["Production, U.S. Share"]))
  .attr("class", "state")
  


d3.selectAll(".state")
  .append("g")
  .attr("transform", d=>{
   let position=path.centroid(d)
   return `translate(${position[0]} ${position[1]})`
  })
  .attr("width", 50)
  .attr("height", 10)

  .append("text")
  // .attr("x", d=>)
  // .attr("y",d=> path.centroid(d)[1])
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .attr("fill", "black")
  .text(d=>d.properties.NAME)
  .on("mouseover", function(d){

  })
  .on("mouseout", function(d){

  });


// Legend
d3.select("svg")
  .append("g")
  .attr("class", "legend")
  .attr("id", "main")

//Legend background 
d3.select("g#main")
  .append('rect')
  .style("fill", () => "#ffffff")
  .attr("width", 100)
  .attr("height", 135)
  .attr("transform", "translate(100 0)")
 .style("stroke", "black")
 .style("stroke-width", 1)

// Legend boxes
let legend = d3
  .select("g#main")
  .selectAll('g.legendEntry')
  .data(d3.schemeBlues[7])
  .enter()
  .append('g')
  .attr('class','legendEntry')
  .attr("transform", "translate(102 0)")

legend
  .append('rect')
  .attr("x", 0)
  .attr("y", function(d, i) {
     return i * 20+2;
  })
 .attr("width", 10)
 .attr("height", 10)
 .style("stroke", "black")
 .style("stroke-width", 1)
 .style("fill", d=>d)

// Legend text
let legendTextLabels = 
  legend
  .append("text")
  .attr("x", 20)
  .attr("y", function(d, i) {
    return i * 20+12;
  })
  .text( function (d) {
    let range =colorScale.invertExtent(d)
    return range[0]+' - '+range[1]
  })
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .attr("fill", "black");
