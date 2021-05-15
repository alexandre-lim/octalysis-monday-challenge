.PHONY: all

CURRENT_COMMIT=$(shell git rev-parse HEAD)

DOCKER_REPO=eu.gcr.io/octalysis-1611865087585/octalysis
DOCKER_TAG=$(CURRENT_COMMIT)
DOCKER_IMAGE=$(DOCKER_REPO):$(DOCKER_TAG)

docker-build: ## Build docker image
	docker build -t ${DOCKER_IMAGE} .

docker-push: # docker-build
	docker push ${DOCKER_IMAGE}
