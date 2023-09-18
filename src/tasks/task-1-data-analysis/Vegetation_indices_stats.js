// earth engine code link
//https://code.earthengine.google.com/?scriptPath=users%2Fhalajadallah%2FOmdena_Bangladesh%3Avegetation_indices_stats
var boro_rice = ee.Image("users/halajadallah/bgd_2017_boro");

// here we use same code but for mcari (modified chlorophyll absoption reflection index)
// the goal is to compute statistics for select points to compare
// ndvi, clre, mcari values to choose one to reflect nitogen related plant traint
var Bangladesh = ee.FeatureCollection("FAO/GAUL/2015/level2").filter("ADM0_NAME == 'Bangladesh'");
var Natore = Bangladesh.filter("ADM2_NAME == 'Natore'");
var Geometry = Natore.geometry();

// center map over Natore
Map.setCenter(88.9765, 24.4114,10);

function maskS2clouds(image) {
  var qa = image.select('QA60');
 
  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

var addIndices = function(image) {
  var clre = image.select('B8').divide(image.select('B5')).subtract(-1).rename(['clre']);
  var mcari = image.expression(
      '((re - red)-0.2*(re-green))*(re/red)', {
        'nir' : image.select('B8'), // nir 835 nm
        're' : image.select('B5'), //re: red edge 704 nm
        'red' : image.select('B4'), // red 665 nm
        'green': image.select('B3'), // green 560 nm
      }).rename('mcari');
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename(['ndvi']);
  var ndre1 = image.normalizedDifference(['B8','B5']).rename(['ndre1']);
  var lnc = (ndre1.multiply(4.060)).add(0.43).rename(['lnc']); //leaf nitrogen concentration 
  return image.addBands(clre).addBands(mcari).addBands(ndvi).addBands(ndre1).addBands(lnc);
}; 

var dataset_2018 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                  .filterDate('2018-02-01', '2018-05-01')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .filter(ee.Filter.bounds(Geometry))
                  .map(maskS2clouds);
var dataset_2018 = addIndices(dataset_2018.median());

var dataset_2019 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                  .filterDate('2019-02-01', '2019-05-01')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .filter(ee.Filter.bounds(Geometry))
                  .map(maskS2clouds);
var dataset_2019 = addIndices(dataset_2019.median());

var dataset_2020 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                  .filterDate('2020-02-01', '2020-05-01')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .filter(ee.Filter.bounds(Geometry))
                  .map(maskS2clouds);
var dataset_2020 = addIndices(dataset_2020.median());   
//print(dataset_2020);

var dataset_2021 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                  .filterDate('2021-02-01', '2021-05-01')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .filter(ee.Filter.bounds(Geometry))
                  .map(maskS2clouds);
var dataset_2021 = addIndices(dataset_2021.median());

var dataset_2022 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                  .filterDate('2022-02-01', '2022-05-01')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .filter(ee.Filter.bounds(Geometry))
                  .map(maskS2clouds);
var dataset_2022 = addIndices(dataset_2022.median());


//https://developers.google.com/earth-engine/datasets/catalog/ESA_WorldCover_v100#description
boro_rice = boro_rice.clip(Geometry);


var clre_2018 = dataset_2018.select('clre').clip(Geometry).mask(boro_rice);                
var clre_2019 = dataset_2019.select('clre').clip(Geometry).mask(boro_rice);    
var clre_2020 = dataset_2020.select('clre').clip(Geometry).mask(boro_rice);        
var clre_2021 = dataset_2021.select('clre').clip(Geometry).mask(boro_rice);       
var clre_2022 = dataset_2021.select('clre').clip(Geometry).mask(boro_rice);    

var mcari_2018 = dataset_2018.select('mcari').clip(Geometry).mask(boro_rice);                
var mcari_2019 = dataset_2019.select('mcari').clip(Geometry).mask(boro_rice);    
var mcari_2020 = dataset_2020.select('mcari').clip(Geometry).mask(boro_rice);        
var mcari_2021 = dataset_2021.select('mcari').clip(Geometry).mask(boro_rice);       
var mcari_2022 = dataset_2021.select('mcari').clip(Geometry).mask(boro_rice);    

var ndvi_2018 = dataset_2018.select('ndvi').clip(Geometry).mask(boro_rice);                
var ndvi_2019 = dataset_2019.select('ndvi').clip(Geometry).mask(boro_rice);    
var ndvi_2020 = dataset_2020.select('ndvi').clip(Geometry).mask(boro_rice);        
var ndvi_2021 = dataset_2021.select('ndvi').clip(Geometry).mask(boro_rice);       
var ndvi_2022 = dataset_2021.select('ndvi').clip(Geometry).mask(boro_rice);    


var data18 = dataset_2018.clip(Geometry).mask(boro_rice).select(['clre', 'mcari', 'ndvi'])//,'ndre1','lnc']);
var data19 = dataset_2019.clip(Geometry).mask(boro_rice).select(['clre', 'mcari', 'ndvi'])//,'ndre1','lnc']);
var data20 = dataset_2020.clip(Geometry).mask(boro_rice).select(['clre', 'mcari', 'ndvi'])//,'ndre1','lnc']);
var data21 = dataset_2021.clip(Geometry).mask(boro_rice).select(['clre', 'mcari', 'ndvi'])//,'ndre1','lnc']);
var data22 = dataset_2022.clip(Geometry).mask(boro_rice).select(['clre', 'mcari', 'ndvi'])//,'ndre1','lnc']);

var maxDictionary = data20.reduceRegion({
  reducer: ee.Reducer.max(),
  geometry: Geometry,
  scale: 30,
  maxPixels: 1e9
});

var minDictionary = data20.reduceRegion({
  reducer: ee.Reducer.min(),
  geometry: Geometry,
  scale: 30,
  maxPixels: 1e9
});
//print(data20)
print(maxDictionary.get('clre'))
print(minDictionary.get('clre'))



Map.addLayer(data21,{bands: 'clre', min: +1.7059, max: +5.20, palette: ['red', 'yellow', 'green']}, 'clre 2021')
Map.addLayer(data21,{bands: 'mcari', min: -0.011, max: +.1295, palette: ['red', 'yellow', 'green']}, 'mcari 2021')
Map.addLayer(data21,{bands: 'ndvi', min: -0.213, max: +0.720, palette: ['red', 'yellow', 'green']}, 'ndvi 2021')
//Map.addLayer(data21,{bands: 'ndre1' ,min: -0.173, max: +0.616, palette: ['red', 'yellow', 'green']}, 'ndre 2021')
//Map.addLayer(data21,{bands: 'lnc' ,min: -0.270, max: +3.0, palette: ['red', 'yellow', 'green']}, 'lnc 2021')

/*
//Not included in the script is a list of sample points
// see link of gee code 
var veg_ind_min = data20.reduceRegions({
  collection : rice_field_samples,
  reducer: ee.Reducer.min(),
  scale : 10,
}).map(function(feature){
  return feature.set('imageId', data20.id())
});
//print(veg_ind_min)
*/

var chart_19 =
    ui.Chart.image.histogram({image: data19, region: Geometry, scale: 10, maxPixels : 1e9})
        .setSeriesNames(['clre', 'mcari', 'ndvi']) //'ndre1', nlc'])
        .setOptions({
          title: 'Vegetation Indices 2019 Histogram',
          hAxis: {
            title: 'Index Values',
            titleTextStyle: {italic: false, bold: true},
          },
          vAxis:
              {title: 'Count', titleTextStyle: {italic: false, bold: true}},
          colors: ['cf513e', '1d6b99', 'f0af07']//,'00cc99','ccccff']
        });
print(chart_19);


var chart_20 =
    ui.Chart.image.histogram({image: data20, region: Geometry, scale: 10, maxPixels : 1e9})
        .setSeriesNames(['clre', 'mcari', 'ndvi'])
        .setOptions({
          title: 'Vegetation Indices 2020 Histogram',
          hAxis: {
            title: 'Index Values',
            titleTextStyle: {italic: false, bold: true},
          },
          vAxis:
              {title: 'Count', titleTextStyle: {italic: false, bold: true}},
          colors: ['cf513e', '1d6b99', 'f0af07']//,'00cc99', 'ccccff']
        });
print(chart_20);

var chart_21 =
    ui.Chart.image.histogram({image: data21, region: Geometry, scale: 10, maxPixels : 1e9})
        .setSeriesNames(['clre', 'mcari', 'ndvi'])//, 'ndre1', 'lnc'])
        .setOptions({
          title: 'Vegetation Indices 2021 Histogram',
          hAxis: {
            title: 'Index Values',
            titleTextStyle: {italic: false, bold: true},
          },
          vAxis:
              {title: 'Count', titleTextStyle: {italic: false, bold: true}},
          colors: ['cf513e', '1d6b99', 'f0af07']//,'00cc99', 'ccccff']
        });
print(chart_21);