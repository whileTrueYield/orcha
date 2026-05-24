FROM python:3.12 AS base

WORKDIR /orcha-ai

COPY ./requirements.txt /orcha-ai/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /orcha-ai/requirements.txt

EXPOSE 8000

COPY ./app /orcha-ai/app
COPY ./gunicorn.conf.py /orcha-ai/gunicorn.conf.py

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM base AS test

COPY --from=base /orcha-ai /orcha-ai
COPY ./pytest.ini /orcha-ai/pytest.ini
