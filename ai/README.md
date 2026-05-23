# orcha-ai

Planning and machine learning service for Orcha

## Setup

Orcha AI runs on Python 3. You'll want to setup a virtual environment and
install dependencies as follow:

```sh
python3 -m venv venv
```

Then activate the environment

```sh
source ./venv/bin/activate
```

And finally install all the dependencies (stored in `requirements.txt`)

```sh
pip install -r requirements.txt
```

## Quality

### Testing

Pytest is used to run the test suite.

```sh
pytest
```

You may run a specific test as follow (`-vv` option is for very verbose output):

```sh
pytest -vv libs/schedule/schedule_test.py::test_schedule_commit
```

`pytest` is pre-configured in the `pytest.ini` file.

### Linting

flake8 is used to detect errors, complexity and other style issues. It can be
configured using the `.flake8` file. To run it, simply type:

```sh
flake8
```

### Coverage

You can generate a coverage report using the following command:

```sh
coverage run
```

`coverage` is pre-configured to in the `.coveragerc` file.

To see the report in the console use `coverage report` or for an HTML
interactive report use:

```sh
coverage html
```

you should be able to then see the coverage at
[http://127.0.0.1:5656](http://127.0.0.1:5656)` by running a light HTTP server

```sh
python -m http.server 5656 --directory htmlcov/
```

### Performance

Profiling is available through SnakeViz. The following is an example to generate
a profile file:

```sh
python3 -m cProfile -o mcts.profile -m app.libs.scheduler.mcts_profile
```

You may then visualize the profile using the snakeviz tool:

```sh
snakeviz mcts.profile
```

## Web service

In production, `gunicorn` is used to manage workers and restart on failure. When
running locally, you'll want to use the `--reload` flag and `uvicorn` to auto
reload on file change:

```sh
uvicorn app.main:app --reload
```

When in production, we spawn as many process as CPU available:

```sh
gunicorn -w 8 app.main:app
```

you can check the status of the server using:

```sh
curl localhost:8000/alive
```

which should return the `{"message":"I am alive"}` response (`HTTP/1.1 200 OK`)

## Docker

The staging environment is operated by docker which compose the different images
together.

To generate a new docker image, you'll need to push a tag to github, which will
in turn push the generated image to amazon ECR.

Tags are in the format `v1.2.3`:

```sh
git tag -a v1.2.3
git push origin v1.2.3
```
