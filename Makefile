DIR=$(strip $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST)))))
NPMDOCKER="registry.webdesk.ru/wd/build-frontend:latest"

BASE_HREF=/

default: help


## Загрузка и обновление зависимостей проекта.
dep:
	@#wget --quiet \
	#	--output-document="${DIR}/src/telegram-web-app.js" \
	#	"https://telegram.org/js/telegram-web-app.js"
	@npm install --force
.PHONY: dep


## Запуск приложения в режиме разработки.
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


## Сборка и запуск автосборки для библиотеки '@webnice/ngx'.
dev-lib: clean-pre-build
	@clear
	@ng cache clean
	NODE_OPTIONS="--max-http-header-size=10485760 --openssl-legacy-provider" ng build \
	@webnice/ngx \
		--watch
.PHONY: dev-lib


## Сборка библиотеки '@webnice/ngx' в директорию dist.
build-lib:  clean-pre-build
	@clear
	@ng cache clean
	@ng build @webnice/ngx
.PHONY:


## Публикация библиотеки '@webnice/ngx' в репозиторий npm.
pub-lib: clean-pre-build
	@clear
	@ng cache clean
	@npm run lib:publish
.PHONY: pub-lib


clean-pre-build:
	@rm -rf ${DIR}/dist; true
	@rm -rf ${DIR}/npm-debug.log; true
	@rm -rf ${DIR}/ng-warnings.log; true
	@rm -rf ${DIR}/ng-errors.log; true
.PHONY: clean-pre-build


## Очистка директории проекта от временных файлов.
clean: clean-pre-build
	@rm -rf ${DIR}/node_modules; true
	@rm -rf ${DIR}/nohup.out; true
.PHONY: clean


## Помощь по командам make.
help:
	@echo "Usage: make [target]"
	@echo "  target это:"
	@echo "    help                 - Помощь по командам make."
	@echo "    dep                  - Загрузка и обновление зависимостей проекта."
	@echo "    dev                  - Запуск приложения в режиме разработки."
	@echo "    dev-lib              - Сборка и запуск автосборки для библиотеки '@webnice/ngx'."
	@echo "    build-lib            - Сборка библиотеки '@webnice/ngx' в директорию dist."
	@echo "    pub-lib              - Публикация библиотеки '@webnice/ngx' в репозиторий npm."
	@echo "    clean                - Очистка директории проекта от временных файлов."
.PHONY: help
