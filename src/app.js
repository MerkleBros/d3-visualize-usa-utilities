import * as d3 from 'd3'
import geoJsonData from '../data/gz_2010_us_040_00_5m.json'
import energyData from '../data/eia-state-total-energy-rankings.csv'
import abbreviateState from './convertStates.js'

geoJsonData.features.forEach((feature) => {
  let data = energyData.find((obj) => {
    return obj.State == abbreviateState(feature.properties.NAME, "abbr")
  }) 
  feature.energy = data
  feature.area=getStateArea(feature.geometry.coordinates)
})

function getStateArea(arr){
  if (arr.length>1){
    return arr.map(subArr=> getStateArea(subArr))
              .reduce((acc,area)=>acc+area,0)
  }
  return arr.map(path=>d3.polygonArea(path))
            .reduce((acc,area)=>acc+area,0)
}


console.log(geoJsonData.features)

// Make a choropleth for U.S States' share of power production
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

let svg = document
  .createElementNS("http://www.w3.org/2000/svg", "svg");

document.body.appendChild(svg)

// Map with US Power Production 
d3.select("svg")
  .selectAll("g.state")
  .data(geoJsonData.features)
  .enter()
  .append("g")
  .attr("class", "state")
  .append("path")
  .attr("d", path)
  .style("fill", d => colorScale(d.energy["Production, U.S. Share"]))
  .on('mouseover', function(d, i) {
    d3.select(this).style('fill', "rgb(225, 202, 131)");
  })
  .on('mouseout', function(d, i) {
    d3.select(this).style("fill", d => colorScale(d.energy["Production, U.S. Share"]))
  });


d3.selectAll("g.state")
  .append("text")
  .attr("class", 'stateName')
  .attr("x", d=>path.centroid(d)[0])
  .attr("y",d=> path.centroid(d)[1])
  .attr("text-anchor", "middle" )
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .attr("fill", "black")
  .attr("pointer-events", "none")
  .text(d=>d.area>7? d.properties.NAME : d.energy.State)


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
    let range = colorScale.invertExtent(d)
    return range[0]+' - '+range[1]
  })
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .attr("fill", "black");
