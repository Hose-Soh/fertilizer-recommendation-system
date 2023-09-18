// The file computes CLre index for four years 2018-2021 standardized temporally
// code link:  https://code.earthengine.google.com/?scriptPath=users%2Fhalajadallah%2FOmdena_Bangladesh%3Aaman_Clre_maps
var aman_rice = ee.Image("users/halajadallah/bgd_2017_aman");
// select subregion in Natore district
var roi = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[88.92915037418312, 24.40751495464837],
          [88.92915037418312, 24.324325399528167],
          [89.0819289996714, 24.324325399528167],
          [89.0819289996714, 24.40751495464837]]], null, false);
          
var Bangladesh = ee.FeatureCollection("FAO/GAUL/2015/level2").filter("ADM0_NAME == 'Bangladesh'");
var Natore = Bangladesh.filter("ADM2_NAME == 'Natore'");
//var Geometry = Natore.geometry();

var Geometry = roi;
print('area of ROI in kilometers squared', roi.area(0.1).divide(1e6))
print('Area of Natore district in kilometers squared ', Natore.geometry().area().divide(1e6))

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
  var clre = (image.select('B8').divide(image.select('B5'))).subtract(-1).rename(['clre']);
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
                  .filterDate('2018-09-01', '2018-11-01')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .filter(ee.Filter.bounds(Geometry))
                  .map(maskS2clouds);
var dataset_2018 = addIndices(dataset_2018.median());

var dataset_2019 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                  .filterDate('2019-09-01', '2019-11-01')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .filter(ee.Filter.bounds(Geometry))
                  .map(maskS2clouds);
var dataset_2019 = addIndices(dataset_2019.median());

var dataset_2020 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                  .filterDate('2020-09-01', '2020-11-01')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .filter(ee.Filter.bounds(Geometry))
                  .map(maskS2clouds);
var dataset_2020 = addIndices(dataset_2020.median());   

var dataset_2021 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                  .filterDate('2021-09-01', '2021-11-01')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .filter(ee.Filter.bounds(Geometry))
                  .map(maskS2clouds);
var dataset_2021 = addIndices(dataset_2021.median());

var dataset_2022 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                  .filterDate('2022-09-01', '2022-10-01')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .filter(ee.Filter.bounds(Geometry))
                  .map(maskS2clouds);
var dataset_2022 = addIndices(dataset_2022.median());

aman_rice = aman_rice.clip(Geometry);

// Select Clre index  band and mask rice field
var clre_2018 = dataset_2018.select('clre').clip(Geometry).mask(aman_rice);                
var clre_2019 = dataset_2019.select('clre').clip(Geometry).mask(aman_rice);    
var clre_2020 = dataset_2020.select('clre').clip(Geometry).mask(aman_rice);        
var clre_2021 = dataset_2021.select('clre').clip(Geometry).mask(aman_rice);       
  

var visualization = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};
//Map.addLayer(dataset_2019, visualization, 'RGB');
var palette = ['brown','red', 'yellow','green','blue'] 

var overallmean = ((clre_2018).add(clre_2019).add(clre_2020).add(clre_2021)).divide(4)

// sum of squares
var ss0 = (clre_2018).subtract(overallmean).pow(2)
var ss1 = (clre_2019).subtract(overallmean).pow(2)
var ss2 = (clre_2020).subtract(overallmean).pow(2)
var ss3 = (clre_2021).subtract(overallmean).pow(2)

// standard deviation is square root of variance
var intra_std = (((ss0).add(ss1).add(ss2).add(ss3)).divide(3)).sqrt()


Map.setCenter(88.9765, 24.4114,10);
var anomaly_2018 = ((clre_2018.subtract(overallmean)).divide(intra_std))
Map.addLayer(anomaly_2018,{min: -3.0, max: +3.0, palette: ['red', 'yellow', 'green']}, '2018')
var anomaly_2019 = ((clre_2019.subtract(overallmean)).divide(intra_std))
Map.addLayer(anomaly_2019,{min: -3.0, max: +3.0, palette: ['red', 'yellow', 'green']}, '2019')
var anomaly_2020 = (clre_2020 .subtract(overallmean)).divide(intra_std)
Map.addLayer(anomaly_2020,{min: -3.0, max: +3.0, palette: ['red', 'yellow', 'green']}, '2020')
var anomaly_2021 = (clre_2021.subtract(overallmean)).divide(intra_std)
Map.addLayer(anomaly_2021,{min: -3.0, max: +3.0, palette: ['red', 'yellow', 'green']}, '2021')

Export.image.toDrive({
  image: anomaly_2021,
  description: 'Clre_aman_Natore_2021',
  region: Geometry,
  fileNamePrefix : '2021_aman_Clre_Natore',
  folder : 'Omdena_Bangladesh',
  fileFormat: 'GeoTIFF',
  scale : 20,
  maxPixels : 1e9,
});


Export.image.toDrive({
  image: anomaly_2020,
  description: 'Clre_aman_Natore_2020',
  region: Geometry,
  fileNamePrefix : '2020_aman_Clre_Natore',
  folder : 'Omdena_Bangladesh',
  fileFormat: 'GeoTIFF',
  scale : 20,
  maxPixels : 1e9,
});

Export.image.toDrive({
  image: anomaly_2019,
  description: 'Clre_aman_Natore_2019',
  region: Geometry,
  fileNamePrefix : '2019_aman_Clre_Natore',
  folder : 'Omdena_Bangladesh',
  fileFormat: 'GeoTIFF',
  scale : 20,
  maxPixels : 1e9,
});

Export.image.toDrive({
  image: anomaly_2018,
  description: 'Clre_aman_Natore_2018',
  region: Geometry,
  fileNamePrefix : '2018_aman_Clre_Natore',
  folder : 'Omdena_Bangladesh',
  fileFormat: 'GeoTIFF',
  scale : 20,
  maxPixels : 1e9,
});

