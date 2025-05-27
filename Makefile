DIR=$(strip $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST)))))
NPMDOCKER="registry.webdesk.ru/wd/build-frontend:latest"

BASE_HREF=/

default: dep

dep:
		@#wget --quiet \
		#	--output-document="${DIR}/src/telegram-web-app.js" \
		#	"https://telegram.org/js/telegram-web-app.js"
		@npm install --force
.PHONY: dep

watch-lib: clean-pre-build
	@clear
	@ng cache clean
	NODE_OPTIONS="--max-http-header-size=10485760 --openssl-legacy-provider" ng build \
    @webnice/ngx \
    --watch
.PHONY: dev-lib

#build: clean-pre-build
#	@ng version
#	@npm -v
#	@npm run postinstall
#	@npx tsx package.sprite.js
#	ng build \
#		--base-href="${BASE_HREF}" \
#		--aot \
#		--extract-licenses=true \
#		--service-worker \
#		--source-map \
#		--progress; true
#.PHONY: build

#watch: clean-pre-build
#	@npm run postinstall
#	@npx tsx package.sprite.js
#	ng build \
#		--base-href="${BASE_HREF}" \
#		--aot \
#		--extract-licenses=true \
#		--service-worker \
#		--source-map \
#		--watch
#.PHONY: watch

dev: clean-pre-build
	@clear
	@# npm run postinstall
	@ng cache clean
	@# npx tsx package.sprite.js
	NODE_OPTIONS="--max-http-header-size=10485760 --openssl-legacy-provider" ng serve \
		--hmr \
		--serve-path="${BASE_HREF}" \
		--host backend \
		--port 8190 \
		--disable-host-check \
		--proxy-config proxy.conf.json \
		--allowed-hosts="all" \
		--live-reload
.PHONY: dev

update:
	sudo npm uninstall -g @angular/cli
	sudo npm cache clean --force
	sudo npm install -g @angular/cli@latest
	sudo npm-check -u -g
.PHONY: update

test:
	ng test
.PHONY: test

lint:
	@ng lint
.PHONY: lint

clean-pre-build:
	@rm -rf ${DIR}/dist; true
	@rm -rf ${DIR}/npm-debug.log; true
	@rm -rf ${DIR}/ng-warnings.log; true
	@rm -rf ${DIR}/ng-errors.log; true
.PHONY: clean-pre-build

clean: clean-pre-build
	@rm -rf ${DIR}/node_modules; true
	@rm -rf ${DIR}/nohup.out; true
.PHONY: clean
