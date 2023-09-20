# Data processing

This documentation explains how to create Sunlight 3D Tiles for Demo-Sunlight and how to configure Demo-Sunlight to display them.

## How to create 3D Tiles Sunlight

1. Create your working directories.

    ```bash
    mkdir pySunlight-builder && cd pySunlight-builder && mkdir inputs && cd inputs
    ```

2. Get 3D Tiles from the liris server.

    ```bash
    # -R remove all index.html generated
    # -nH and --cut-dirs remove subdirectory between domain name and datas directory. We place the tileset.json directly in inputs.
    wget -r -np -nH --cut-dirs=3 -R "index.html*" https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis/2018/Lyon-1_2018/
    ```

   You have now this folder hierarchy :

   ```bash
   pySunlight-builder
   ├── inputs
      ├── tiles
      ├── tileset.json
   ```

3. Return to your main directory.

   ```bash
   cd ..
   ```

4. Run docker desktop.

5. Get the latest version of pysunlight-docker from docker hub.

    ```bash
    docker pull vcity/pysunlight
    ```

6. Compute sunlight with your arguments, a list is available [here](https://github.com/VCityTeam/pySunlight-docker#configure).

    ```bash
    docker run -v ./inputs:/inputs -v ./outputs:/outputs -e START_DATE=403224 -e END_DATE=403248 -e LOG_LEVEL=DEBUG -e OPTIONAL_ARGS=--with-aggregate vcity/pysunlight
    ```

7. At the end of the computation, you will find the 3D Tiles Sunlight in the outputs volume defined in the previous command.

## How to display 3D Tiles Sunlight in Demo-Sunlight - :warning: WIP

1. Get 3D Tiles Sunlight from the liris server.

    ```bash
    wget -r -np -nH --cut-dirs=3 -R "index.html*" https://dataset-dl.liris.cnrs.fr/three-d-tiles-lyon-metropolis/2018/Lyon-1_2018/
    ```

2. Place 3D Tiles Sunlight in the assets directory (`packages/browser/assets/`).

3. :warning: WIP to externalize configuration from source code. Change the config variable in the function `formatConfig3DTiles` in `packages/browser/src/MyApplication.js`. For instance with Lyon-1_2018, we fill in each 3D Tiles per hour that will be seen:

   ```js
    const config = [
       {
          id: 'Lyon-1_2018',
          url: '../assets/Lyon-1_2018/2016-10-01__1000/tileset.json',
          color: '0xFFFFFF',
       },
       {
          id: 'Lyon-1_2018',
          url: '../assets/Lyon-1_2018/2016-10-01__1100/tileset.json',
          color: '0xFFFFFF',
       }
    ]
   ```

4. [Follow the procedure to launch your demo](../../Readme.md#installation).
