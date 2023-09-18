# Visualization of GeoTIFF Files Using Folium

The folders geodata and geodata_roi stores GeoTIFF transformed into numpy arrays. 

The goal is use streamlit to visualize results analyzed in earthengine.google.com. 
The region of study is Natore ditrict. The tif files are huge that streamlit cannot load them.

Therefore, we selected a small representative region, that can give an appreciation of the methods we used. 
ROI_classificatin.ipynb has also classification method based on the standardized Clre index computed using
earthengine and collected in roi_anomaly_files. 
 