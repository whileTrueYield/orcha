# Docker commands
demo: .env
	docker compose up -d

dev:
	docker compose -f docker-compose.yaml -f docker-compose.dev.yaml --env-file .env.dev up -d
	docker compose -f docker-compose.yaml -f docker-compose.dev.yaml --env-file .env.dev watch

.env:
	cp .env.example .env

# Production deployment — uses Traefik with automatic TLS.
# Requires .env.prod (copy from .env.prod.example and fill in all values).
prod: .env.prod
	docker compose -f docker-compose.prod.yaml --env-file .env.prod up -d --build

prod-down:
	docker compose -f docker-compose.prod.yaml --env-file .env.prod down

prod-logs:
	docker compose -f docker-compose.prod.yaml --env-file .env.prod logs -f

.env.prod:
	@echo "ERROR: .env.prod not found. Copy .env.prod.example to .env.prod and fill in all values."
	@exit 1

watch:
	docker compose watch

restart:
	docker compose restart

stop:
	docker compose stop

down:
	docker compose down

rebuild-all:
	docker compose up --build -d

rebuild-frontend:
	docker compose up --build frontend -d

rebuild-ai:
	docker compose up --build ai -d

rebuild-support:
	docker compose up --build support -d

rebuild-backend:
	docker compose up --build backend -d

rebuild-cron:
	docker compose up --build cron -d

# Database commands
db-init:
	docker exec -it -w /orcha orcha-backend yarn prisma migrate deploy

db-push:
	docker exec -it -w /orcha orcha-backend yarn prisma db push --skip-generate

db-reset:
	docker exec -it -w /orcha orcha-backend yarn prisma migrate reset --skip-generate && \
	docker restart orcha-backend && \
	docker restart orcha-cron

db-reset-test:
	DATABASE_URL=postgresql://webapp:postgres@localhost:5432/tests?connection_limit=5 \
	yarn --cwd backend prisma migrate reset --force --skip-generate
	DATABASE_URL=postgresql://webapp:postgres@localhost:5432/tests?connection_limit=5 \
	yarn --cwd backend prisma db push --skip-generate

db-load:
	docker compose stop backend
	docker compose stop cron
	docker cp production_db_backup.sql postgres:production_db_backup.sql
	docker exec -it postgres dropdb -h localhost -U webapp "webapp" 
	docker exec -it postgres createdb -h localhost -U webapp "webapp" 
	docker exec -it postgres psql -h localhost -d "webapp" -U webapp -f production_db_backup.sql 

# SSH commands
ssh-backend:
	docker exec -it orcha-backend /bin/sh

ssh-cron:	
	docker exec -it orcha-cron /bin/sh

ssh-studio:	
	docker exec -it orcha-studio /bin/sh

ssh-ai:	
	docker exec -it orcha-ai /bin/sh

ssh-support:	
	docker exec -it orcha-support /bin/sh

ssh-frontend:	
	docker exec -it orcha-frontend /bin/sh

# Dev commands
types:
	yarn --cwd backend types

# Type-check the backend with the `bundler` config — the resolution mode that
# matches our runtime (CommonJS emit + Node 22 require(esm) for ESM-only deps),
# so packages that ship types via `exports` (node-diff3, remark/unified) resolve.
# This is the real type gate; the prod build (tsconfig.build.json) is emit-only.
typecheck:
	yarn --cwd backend typecheck

migrate:
	yarn --cwd backend dev:db:migrate

generate:
	yarn --cwd backend dev:generate

build-support-js:
	docker exec -t orcha-support yarn webpack

test-frontend:install-dependency-frontend types
ifdef TEST
	yarn --cwd frontend test -t "${TEST}"
else
	yarn --cwd frontend test
endif

test-backend:install-dependency-backend generate-types-if-necessary
ifdef TEST
	yarn --cwd backend test -g "${TEST}"
else
	yarn --cwd backend test
endif

test-ai:ai-venv
ifdef TEST
	. ./ai/venv/bin/activate; PYTHONPATH=./ai pytest -k ${TEST}
else
	. ./ai/venv/bin/activate; PYTHONPATH=./ai pytest
endif
	

ai-venv: ai/venv/touchfile

ai/venv/touchfile: ./ai/requirements.txt
	test -d ./ai/venv || python3.12 -m venv ./ai/venv
	. ./ai/venv/bin/activate; pip install -Ur ./ai/requirements.txt
	touch ai/venv/touchfile

clean-ai-venv:
	deactivate
	rm -rf ./ai/venv
	find -iname "*.pyc" -delete


# Other stuffs like hidden dependency tasks
install-dependency-frontend:
	yarn --cwd frontend install

install-dependency-backend:
	yarn --cwd backend install

generate-types-if-necessary:
	if [ ! -s "backend/node_modules/@generated/type-graphql/index.d.ts" ]; then \
		yarn --cwd backend prisma generate; \
	fi


# The commands definitions
help:
	@echo "List of Orcha dev environment commands"
	@echo "\n\033[1mDocker commands\033[0m"
	@echo "make demo \tStart the demo instance (seeded data, no auth)"
	@echo "make dev \tStart dev instance (real auth, Mailpit on :8025)"
	@echo "make rebuild \tRebuild the docker images (recommended after a code pull)"
	@echo "make watch \twatch for code changes and update dockers images on changes"
	@echo "make stop \tstops the docker image but maintain state"
	@echo "make down \tstops docker images and delete state"
	@echo "\n\033[1mProduction commands\033[0m"
	@echo "make prod \t\tBuild and start production stack with Traefik TLS"
	@echo "make prod-down \t\tStop the production stack"
	@echo "make prod-logs \t\tTail production logs"
	@echo "\n\033[1mDatabase commands\033[0m"
	@echo "make db-init \t\tInitialize the database using the migration SQL files"
	@echo "make db-push \t\tInitialize the database using the Prisma schema"
	@echo "make db-reset \t\tReset the database using the migration SQL files"
	@echo "make db-reset-test \tReset/initialize the test database using the migration SQL files"
	@echo "\n\033[1mSSH access\033[0m"
	@echo "make ssh-backend \tSSH in the backend docker instance"
	@echo "make ssh-cron \t\tSSH in the cron docker instance"
	@echo "make ssh-ai \t\tSSH in the AI python docker instance"
	@echo "make ssh-studio \tSSH in the studio docker instance"
	@echo "make ssh-support \tSSH in the support docker instance"
	@echo "make ssh-frontend \tSSH in the frontend docker instance"
	@echo "\n\033[1mDev commands\033[0m"
	@echo "make types \t\t\tGenerate and install the backend object types to the frontend"
	@echo "make migrate \t\t\tCreate a SQL migration file for prisma deployement"
	@echo "make generate \t\t\tGenerate the types locally for dev"
	@echo "make build-support-js \t\tCompile the support TS file into an importable JS"
	@echo "make test-frontend \t\tRun the front-end tests"
	@echo "make test-backend \t\tRun the backend-end tests"
	@echo "make test-ai \t\t\tRun the AI tests"
	@echo "make test-... TEST="comments" \tRun the tests matching the provided TEST pattern"
