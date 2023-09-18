#* Classification Stats

import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(layout="wide")

st.title("Classification Statistics")
st.write("Bar charts generated for Aman & Boro rice fields are depicted below-")
st.write("\n")
st.write("\n")
st.write("\n")


df_aman = pd.read_csv('stats/Area_by_Year_Aman.csv', engine='python')
st.subheader("Aman Rice Fields Classification Areas By Year")
fig_aman = px.bar(df_aman, x="Year", y="Area (%)", color="Class")

st.plotly_chart(fig_aman)


df_boro = pd.read_csv('stats/Area_by_Year_Boro.csv',engine='python')
st.subheader("Boro Rice Fields Classification Areas By Year")
fig_boro = px.bar(df_boro, x="Year", y="Area (%)", color="Class")

st.plotly_chart(fig_boro)