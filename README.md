# GraphTides

[![DOI](https://img.shields.io/badge/doi-10.1145/3210259.3210262-blue.svg)](https://doi.org/10.1145/3210259.3210262) [![GitHub license](https://img.shields.io/github/license/graphtides/graphtides.svg)](https://github.com/graphtides/graphtides/blob/master/LICENSE)

Benjamin Erb, Dominik Meißner, Benjamin A. Steer, Domagoj Margan, Frank Kargl, Felix Cuadrado, and Peter Pietzuch. 2018. GraphTides: A Framework for Evaluating Stream-based Graph Processing Platforms. In GRADES-NDA’18 : 1st Joint International Workshop on Graph Data Management Experiences & Systems (GRADES) and Network Data Analytics (NDA), June 10–15, 2018, Houston, TX, USA. ACM, New York, NY, USA, 10 pages. https://doi.org/10.1145/3210259.3210262

This repository contains source code artifacts and experiments.

## Getting Started
The experiments in this repository follow the Popper convention.
The only dependencies that are necessary to replicate results or re-generate the graphics in the paper are the [Popper CLI tool](http://popper.readthedocs.io/en/latest/protocol/getting_started.html#quickstart-guide), [Docker](https://www.docker.com/community-edition), and a [Docker Swarm](https://docs.docker.com/engine/swarm/) setup.
Assuming both Docker and the Popper CLI tool are installed, it is sufficient to execute the following command in the respective `pipelines/` sub-directory on a swarm manager node:
```bash
popper run
```
In case the Popper CLI tool is not available, the individual experiment stages can be executed manually:
```bash
./setup.sh
./run.sh
./post-run.sh
./validate.sh
./teardown.sh
```

Quick description of the individual stages:

 * `setup.sh`. Generates the workloads for the 2nd stage.
 * `run.sh`. Executes the experiment and prepares data for the analysis step.
 * `post-run.sh`. Executes the analysis and generates the graphics.
 * `validate.sh`. Validates that the results were successfully created.
 * `teardown.sh`. Removes workloads and intermediate data.
