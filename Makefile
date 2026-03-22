.PHONY: install start ios android web lint format typecheck prebuild prebuild-ios prebuild-android clean check help run_local pods typegen

# Default target
help:
	@echo "Available targets:"
	@echo "  install          - Install npm dependencies"
	@echo "  start            - Start Expo dev server"
	@echo "  ios              - Run on iOS simulator (iPhone 16)"
	@echo "  android          - Run on Android emulator"
	@echo "  web              - Start web version"
	@echo "  lint             - Run ESLint"
	@echo "  format           - Format code with Prettier"
	@echo "  typecheck        - Run TypeScript type checking"
	@echo "  check            - Run lint and typecheck"
	@echo "  prebuild         - Generate native projects"
	@echo "  prebuild-ios     - Generate iOS native project"
	@echo "  prebuild-android - Generate Android native project"
	@echo "  clean            - Clean build artifacts and caches"
	@echo "  pods             - Install CocoaPods dependencies"
	@echo "  typegen          - Regenerate Expo Router typed routes"
	@echo "  run_local        - Install, prebuild iOS, pods, and run on simulator"

install:
	npm install

start:
	npm start

ios:
	npx expo run:ios

android:
	npm run android

web:
	npm run web

lint:
	npm run lint

format:
	npm run format

typecheck:
	npm run typecheck

check: lint typecheck

prebuild:
	npm run prebuild

prebuild-ios:
	npx expo prebuild --platform ios --no-install

prebuild-android:
	npm run prebuild:android

clean:
	rm -rf node_modules/.cache
	rm -rf .expo
	rm -rf ios/build
	rm -rf android/build
	rm -rf android/app/build

pods:
	cd ios && pod install --repo-update

typegen:
	npx expo customize tsconfig.json

run_local: install prebuild-ios pods ios
