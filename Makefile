.PHONY: all
all: build node_modules

.PHONY: clean
clean:
	rm -rf build node_modules

build: node_modules $(shell find js/ -name "*.js")
	mkdir -p build
	./node_modules/.bin/babel js \
		--experimental \
		--out-dir build \
		--source-maps

node_modules: package.json
	npm install
