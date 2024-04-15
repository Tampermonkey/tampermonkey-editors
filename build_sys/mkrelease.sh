#!/bin/bash

# ./mkrelease.sh -v 0

version=

USAGE="Usage: `basename $0` -v <version> -s";

# Parse command line options.
while getopts v:s OPT; do
  case "$OPT" in
    v)
      version=$OPTARG
      ;;
    \?)
      # getopts issues an error message
      echo $USAGE >&2
      exit 1
      ;;
  esac
done

if [ "${version}" == "" ]; then
  echo $USAGE >&2
  exit 1
fi

if [ ! -f "webpack.config.js" ]; then
  echo "webpack config missing" >&2
  exit 1
fi

rm -rf release 2>/dev/null
mkdir release
logfile=`pwd`/release/log.txt
touch $logfile

npm install
rc=$?
if [ $rc -ne 0 ]; then
  echo "npm install failed"
  exit 1;
fi

npm run clean
rc=$?
if [ $rc -ne 0 ]; then
  echo "Release preparation failed"
  exit 1;
fi

npm run check
rc=$?
if [ $rc -ne 0 ]; then
  echo "Release preparation failed"
  exit 1;
fi

tmpdir=`mktemp -d`
releasedir="$tmpdir/release"
mkdir -p "$releasedir"
cp -r build_sys eslint i18n images LICENSE Makefile.js package.json package-lock.json src tsconfig.json vendor webpack.config.js "$releasedir"
RANDOM_STRING=$(openssl rand -base64 32 | head -c 10)
echo "$RANDOM_STRING" >> "$releasedir/rnd.txt"

pushd "$tmpdir" > /dev/null
zip -r release.zip release > /dev/null
popd > /dev/null

##############################

# check if CHROME_BIN is set and not empty
if [[ -n "$CHROME_BIN" ]]; then
  # resolve relative paths to chrome binary to absolute path
  CHROME_BIN=$(readlink -f "$CHROME_BIN")
  # export the variable to the shell environment
  export CHROME_BIN
fi

##############################

type=chrome
mkdir -p release/${type}
cp "$tmpdir/release.zip" release/${type}/source_for_${type}_release_${version}.zip

pushd release/${type}/ > /dev/null
unzip source_for_${type}_release_${version}.zip
cd release
npm install
npm run build -- -v ${version} -t ${type} -c off
rc=$?
if [ $rc -ne 0 ]; then
  echo "Chrome build failed"
  exit 1;
fi
npm run package -- -t ${type}

cp out/sourcemaps.zip ../${type}-${version}-sourcemaps.zip
cp out/rel.zip ../${type}-${version}.zip
cp out/rel.crx ../${type}-${version}.crx
if [ $rc -ne 0 ]; then
  echo "Chrome crx build failed"
  exit 1;
fi

cd ..
rm -rf release

popd > /dev/null

##############################

type=firefox
mkdir -p release/${type}
cp "$tmpdir/release.zip" release/${type}/source_for_${type}_release_${version}.zip

pushd release/${type}/ > /dev/null
unzip source_for_${type}_release_${version}.zip
cd release
npm install
npm run build -- -v ${version} -t ${type} -c off
rc=$?
if [ $rc -ne 0 ]; then
  echo "Firefox build failed"
  exit 1;
fi

npm run package -- -t ${type}

cp out/sourcemaps.zip ../${type}-${version}-sourcemaps.zip
cp out/rel.xpi ../${type}-${version}.xpi
rc=$?
if [ $rc -ne 0 ]; then
  echo "Firefox xpi build failed"
  exit 1;
fi

cd ..
rm -rf release

popd > /dev/null

##############################

rm -rf "$tmpdir"
