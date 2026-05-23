errorlog = "error.log"
accesslog = "access.log"
bind = "127.0.0.1:8000"
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"
proc_name = "orcha-ai"
timeout = 120

# For debug purpose
capture_output = True
loglevel = "debug"
