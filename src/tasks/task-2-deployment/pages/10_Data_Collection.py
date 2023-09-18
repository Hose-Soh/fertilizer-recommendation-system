import streamlit as st

#* Includes source, dates, bands

st.title("Data Collection")

st.markdown("The first thing that was done for this project was data collection. These steps were taken for the data collection process:")

st.markdown("1. Data was collected from Sentinel 2 SR Harmonized product available at Google Earth Engine.")

st.markdown("2. The Sentinel 2 bands have spetial resolution of 10 m and 20 m. The best freely available resolution. The bands include red, green, blue, red edge, and near infrared. Red edge resolution is 20 m, while the others 10 m.")

st.markdown("3. The Sentinel 2 SR harmonized is already preprocessed for surface reflectance. This means all atmospheric corrections are done.")

st.markdown("4. If excessive clouds are present (> 20%), there will be a lot of missing data. This is the case of Aus season (June to September).")

st.image('figs/data_collection_table.PNG')