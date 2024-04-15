# Tampermonkey Editors

## Building

```bash
./build_sys/mkrelease.sh -v 999
```

The extension packages then can be found at the `./release/` folder.

## Testing with Tampermonkey

```bash
mkdir -p other/tampermonkey
cd other/tampermonkey
wget https://www.tampermonkey.net/crx/tampermonkey_stable.crx
unzip tampermonkey_stable.crx
sed -i 's/"hohmicmmlneppdcbkhepamlgfdokipcd"/"kjmbknaomholdmpocgplbkgmjdnidinh"/' background.js
```

Start Chrome, go to `chrome://extensions/`, enable Developer mode, and click on `Load unpacked` and select the `other/tampermonkey` folder.
Search for "Tampermonkey" in the extensions list and copy the ID (e.g. `iomhjoeebbnlcpalefgjmleebfffgbmm`).
Now search for `Tampermonkey Editors` and click at `Inspect views: service worker` to open the console and paste the following code after you've changed the ID (`iomh...`) to the one you've copied before:

```javascript
chrome.storage.local.set({ 'config': { externalExtensionIds: [ 'iomhjoeebbnlcpalefgjmleebfffgbmm' ] } })
.then(() => {
    chrome.runtime.reload()
});
```

Now install a userscript in Tampermonkey and click at the `Tampermonkey Editors` icon in the toolbar to see the editor.