
// earth engine link
// https://code.earthengine.google.com/?scriptPath=users%2Fhalajadallah%2FOmdena_Bangladesh%3Aboro_Clre_maps

// import from assests
var boro_rice = ee.Image("users/halajadallah/bgd_2017_boro");

// code adapted from saivilliers: Bangladesh computing ndvi anomalies
// here we use same code but for mcari (modified chlorophyll absoption reflection index)
// the goal is to compute the intra standard deviation
var Bangladesh = ee.FeatureCollection("FAO/GAUL/2015/level2").filter("ADM0_NAME == 'Bangladesh'");
var Natore = Bangladesh.filter("ADM2_NAME == 'Natore'");
var Geometry = Natore.geometry();

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
  return image.addBands(clre).addBands(mcari);
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

//var land_cover = ee.ImageCollection("ESA/WorldCover/v100").first().clip(Geometry);
//var cropland = land_cover.eq(40);


boro_rice = boro_rice.clip(Geometry);

var clre_2018 = dataset_2018.select('clre').clip(Geometry).mask(boro_rice);                
var clre_2019 = dataset_2019.select('clre').clip(Geometry).mask(boro_rice);    
var clre_2020 = dataset_2020.select('clre').clip(Geometry).mask(boro_rice);        
var clre_2021 = dataset_2021.select('clre').clip(Geometry).mask(boro_rice);       
var clre_2022 = dataset_2022.select('clre').clip(Geometry).mask(boro_rice);    

var visualization = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};
//Map.addLayer(dataset_2019, visualization, 'RGB');
var palette = ['brown','red', 'yellow','green','blue'] 

var overallmean = ((clre_2018).add(clre_2019).add(clre_2020).add(clre_2021).add(clre_2022)).divide(5)
//print('allmean',overallmean)

var ss0 = (clre_2018).subtract(overallmean).pow(2)
var ss1 = (clre_2019).subtract(overallmean).pow(2)
var ss2 = (clre_2020).subtract(overallmean).pow(2)
var ss3 = (clre_2021).subtract(overallmean).pow(2)
var ss4 = (clre_2022).subtract(overallmean).pow(2)
var intra_std = (((ss0).add(ss1).add(ss2).add(ss3).add(ss4)).divide(4)).sqrt()
//print('intrastd',intra_std)

Map.setCenter(88.9765, 24.4114,10);
var anomaly_2018 = ((clre_2018.subtract(overallmean)).divide(intra_std))
//Map.addLayer(anomaly_2018,{min: -3.0, max: +3.0, palette: ['red', 'yellow', 'green']}, '2018')
var anomaly_2019 = ((clre_2019.subtract(overallmean)).divide(intra_std))
//Map.addLayer(anomaly_2019,{min: -3.0, max: +3.0, palette: ['red', 'yellow', 'green']}, '2019')
var anomaly_2020 = (clre_2020 .subtract(overallmean)).divide(intra_std)
//Map.addLayer(anomaly_2020,{min: -3.0, max: +3.0, palette: ['red', 'yellow', 'green']}, '2020')
var anomaly_2021 = (clre_2021.subtract(overallmean)).divide(intra_std)
//Map.addLayer(anomaly_2021,{min: -3.0, max: +3.0, palette: ['red', 'yellow', 'green']}, '2021')
var anomaly_2022 = (clre_2022.subtract(overallmean)).divide(intra_std)
//Map.addLayer(anomaly_2022,{min: -3.0, max: +3.0, palette: ['red', 'yellow', 'green']}, '2022')

var classes_2018 = anomaly_2018.gt(-3.0).add(anomaly_2018.gt(-2.0))
                  .add(anomaly_2018.gt(-1.0)).add(anomaly_2018.gt(0))
                  .add(anomaly_2018.gt(1.0)).add(anomaly_2018.gt(2.0))
                  .add(anomaly_2018.gt(3.0));
                  
var classes_2019 = anomaly_2019.gt(-3.0).add(anomaly_2019.gt(-2.0))
                  .add(anomaly_2019.gt(-1.0)).add(anomaly_2019.gt(0))
                  .add(anomaly_2019.gt(1.0)).add(anomaly_2019.gt(2.0))
                  .add(anomaly_2019.gt(3.0));
                  
var classes_2020 = anomaly_2020.gt(-3.0).add(anomaly_2020.gt(-2.0))
                  .add(anomaly_2020.gt(-1.0)).add(anomaly_2020.gt(0))
                  .add(anomaly_2020.gt(1.0)).add(anomaly_2020.gt(2.0))
                  .add(anomaly_2020.gt(3.0));
                  
var classes_2021 = anomaly_2021.gt(-3.0).add(anomaly_2021.gt(-2.0))
                  .add(anomaly_2021.gt(-1.0)).add(anomaly_2021.gt(0))
                  .add(anomaly_2021.gt(1.0)).add(anomaly_2021.gt(2.0))
                  .add(anomaly_2021.gt(3.0));
                  
var classes_2022 = anomaly_2022.gt(-3.0).add(anomaly_2022.gt(-2.0))
                  .add(anomaly_2022.gt(-1.0)).add(anomaly_2022.gt(0))
                  .add(anomaly_2022.gt(1.0)).add(anomaly_2022.gt(2.0))
                  .add(anomaly_2022.gt(3.0));
                  


// Ujaval Gandhi's Spetialthoughts.com website is very usefull
// code from https://spatialthoughts.com/2020/06/19/calculating-area-gee/

var calculateClassAreasPerImage = function(image, year){
  var areaImage = ee.Image.pixelArea().addBands(image); // has two bands: area and clre

  var areas = areaImage.reduceRegion({
        reducer: ee.Reducer.sum().group({
        groupField: 1,
        groupName: 'clre',
      }),
      geometry: Geometry,
      scale: 10,
      //tileScale: 4,
      maxPixels: 1e10
      }); 
  var classAreas = ee.List(areas.get('groups'))
  var classAreaLists = classAreas.map(function(item) {
    var areaDict = ee.Dictionary(item)
    var classNumber = ee.Number(areaDict.get('clre')).format();
    var area = ee.Number(areaDict.get('sum')).divide(1e6);
    return ee.List([classNumber, area])
  });
  var result = ee.Dictionary(classAreaLists.flatten())
  return result.set('year', ee.Number(year).format('%d'))
}
//print('result',result)
var stats_2018 = calculateClassAreasPerImage(classes_2018, 2018);
var stats_2019 = calculateClassAreasPerImage(classes_2019, 2019);
var stats_2020 = calculateClassAreasPerImage(classes_2020, 2020);
var stats_2021 = calculateClassAreasPerImage(classes_2021, 2021);
var stats_2022 = calculateClassAreasPerImage(classes_2022, 2022);
print('2018',stats_2018)
print('2019',stats_2019)
print('2020',stats_2020)
print('2021',stats_2021)
print('2022',stats_2022)


var palette = [//'000000', '0000FF', //blue : 1
              'FF0000', // red : 2
              'ff9933', // orange : 3
              'ffff00', // yellow : 4
              '99cc00', // green : 5
              'ccccff', //purple : 6 
              //'cc00ff', // magneta : 7
              ];
//Map.addLayer(classes_2018, {min: 2, max: 6, palette: palette}, 'Clre Classes 2018');
//Map.addLayer(classes_2019, {min: 2, max: 6, palette: palette}, 'Clre Classes 2019');
//Map.addLayer(classes_2020, {min: 2, max: 6, palette: palette}, 'Clre Classes 2020');
//Map.addLayer(classes_2021, {min: 2, max: 6, palette: palette}, 'Clre Classes 2021');
//Map.addLayer(classes_2022, {min: 2, max: 6, palette: palette}, 'Clre Classes 2022');

// code adapted from https://courses.spatialthoughts.com/end-to-end-gee.html#calculating-area-by-class
var areaImage = ee.Image.pixelArea().divide(1e6).addBands(classes_2020)
var areaChart = ui.Chart.image.byClass({
  image: areaImage,
  classBand: 'clre', 
  region: Geometry,
  scale: 30,
  reducer: ee.Reducer.sum(),
  classLabels: ['0', 'very poor','poor', 'insufficient', 'good', 'excellent'],
}).setOptions({
  hAxis: {title: 'Classes'},
  vAxis: {title: 'Area Km^2'},
  title: 'Area by class for the year 2020',
  series: {
    0: { color: 'gray' },
    1: { color: 'brown' },
    2: { color: 'blue' },
    3: { color: 'green' }
  }
});
print(areaChart); 

var areaImage = ee.Image.pixelArea().divide(1e6).addBands(classes_2021)
var areaChart = ui.Chart.image.byClass({
  image: areaImage,
  classBand: 'clre', 
  region: Geometry,
  scale: 30,
  reducer: ee.Reducer.sum(),
  classLabels: ['0', 'very poor','poor', 'insufficient', 'good', 'excellent'],
}).setOptions({
  hAxis: {title: 'Classes'},
  vAxis: {title: 'Area Km^2', maxValue : 300},
  title: 'Area by class for the year 2021',
  series: {
    0: { color: 'gray' },
    1: { color: 'brown' },
    2: { color: 'blue' },
    3: { color: 'green' }
  }
});
print(areaChart); 

// code adapted from the open course end-to-end-gee
// https://courses.spatialthoughts.com/end-to-end-gee.html#calculating-area-by-class
var areaImage = ee.Image.pixelArea().divide(1e6).addBands(classes_2022)
var areaChart = ui.Chart.image.byClass({
  image: areaImage,
  classBand: 'clre', 
  region: Geometry,
  scale: 30,
  reducer: ee.Reducer.sum(),
  classLabels: ['0', 'very poor','poor', 'insufficient', 'good', 'excellent'],
}).setOptions({
  hAxis: {title: 'Classes'},
  vAxis: {title: 'Area Km^2'},
  title: 'Area by class for the year 2022',
  series: {
    0: { color: 'gray' },
    1: { color: 'brown' },
    2: { color: 'blue' },
    3: { color: 'green' }
  }
});
print(areaChart); 





/*
Export.image.toDrive({
  image: anomaly_2022,
  description: 'Clre_Natore_2022',
  region: Geometry,
  fileNamePrefix : '2022_Clre_Natore',
  folder : 'Omdena_Bangladesh',
  fileFormat: 'GeoTIFF',
  scale : 10,
  maxPixels : 1e9,
});
 
Export.image.toDrive({
  image: anomaly_2021,
  description: 'Clre_Natore_2021',
  region: Geometry,
  fileNamePrefix : '2021_Clre_Natore',
  folder : 'Omdena_Bangladesh',
  fileFormat: 'GeoTIFF',
  scale : 10,
  maxPixels : 1e9,
});


Export.image.toDrive({
  image: anomaly_2020,
  description: 'Clre_Natore_2020',
  region: Geometry,
  fileNamePrefix : '2020_Clre_Natore',
  folder : 'Omdena_Bangladesh',
  fileFormat: 'GeoTIFF',
  scale : 10,
  maxPixels : 1e9,
});

Export.image.toDrive({
  image: anomaly_2019,
  description: 'Clre_Natore_2019',
  region: Geometry,
  fileNamePrefix : '2019_Clre_Natore',
  folder : 'Omdena_Bangladesh',
  fileFormat: 'GeoTIFF',
  scale : 10,
  maxPixels : 1e9,
});

Export.image.toDrive({
  image: anomaly_2018,
  description: 'Clre_Natore_2018',
  region: Geometry,
  fileNamePrefix : '2018_Clre_Natore',
  folder : 'Omdena_Bangladesh',
  fileFormat: 'GeoTIFF',
  scale : 10,
  maxPixels : 1e9,
});
*/

