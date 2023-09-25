mkdir pySunlight-builder && cd pySunlight-builder && mkdir inputs && cd inputs
wget -r -np -nH --cut-dirs=3 -R "index.html*" https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis/2018/Lyon-1_2018/
cd ..
docker pull vcity/pysunlight
docker run -v ./inputs:/inputs -v ./outputs:/outputs -e START_DATE=409790 -e END_DATE=411263 -e LOG_LEVEL=DEBUG -e OPTIONAL_ARGS=--with-aggregate vcity/pysunlight
