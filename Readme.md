# UD-Demo-VCity-Sunlight

<!-- TOC -->

- [UD-Demo-VCity-Sunlight](#ud-demo-vcity-sunlight)
  - [About The Project](#about-the-project)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)
  - [Main Contributors](#main-contributors)
  - [Acknowledgments](#acknowledgments)

<!-- /TOC -->

## About The Project

Vizualisation of 3DTiles produces by [pySunlight containing](https://github.com/VCityTeam/pySunlight) light pre-calculation results.

In this demo, we show two vizualisation of Sunlight :

- Sunlight and Shadow vizualisation
- Impact

It's based on [UD-Viz-Template](https://github.com/VCityTeam/UD-Viz-Template).

UD-Demo-VCity-Sunlight is one repository of the Sunlight project, including :

- [Sunlight](https://github.com/VCityTeam/Sunlight)
- [pySunlight](https://github.com/VCityTeam/pySunlight)
- [pySunlight-docker](https://github.com/VCityTeam/pySunlight-docker)
- [UD-Demo-VCity-Sunlight](https://github.com/VCityTeam/UD-Demo-VCity-Sunlight)

## Getting Started

### Prerequisites

Install npm, refer to [here](https://github.com/VCityTeam/UD-SV/blob/master/Tools/ToolNpm.md).

### Installation

1. Download the git repository :

   ```bash
   git clone https://github.com/VCityTeam/UD-Demo-VCity-Sunlight.git && cd UD-Demo-VCity-Sunlight
   ```

2. Install npm dependencies :

   ```bash
   npm i --legacy-peer-deps && npm i
   ```

3. Builds and runs the app in the development mode.

   ```bash
   npm run debug
   ```

4. Open [http://localhost:8000/](http://localhost:8000/) to view it in your browser.

When changes are made to the files, the app is automatically rebuilt (no need to execute the run debug command again).

### Usage

Use [UD-Viz developers documention](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Developers.md#npm-scripts) to see the full list of npm supported commands.

Refer to [this](docs/data-processing/README.md#data-processing) documentation to create and display 3D Tiles Sunlight.

## Contributing

Follow the guidelines of [UD-Viz developpers](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Developers.md#developers).

## License

Distributed under the LGPL-2.1 License. See `LICENSE` and `Libraries Licenses` for more information.

## Main Contributors

- Wesley Petit - [Website](https://wesleypetit.fr/) - <wesley.petit.lemoine@gmail.com>

## Acknowledgments

- [UD-Viz](https://github.com/VCityTeam/UD-Viz)
- [pySunlight](https://github.com/VCityTeam/pySunlight)
