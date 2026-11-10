# Tampermonkey Editors

## Optional local MCP connection

The popup's **Local MCP connection** supports an approved native helper that reconnects after browser restarts. It is disabled by default and requires the optional `nativeMessaging` permission plus a compatible globally installed [Tampermonkey MCP native host](https://github.com/Tampermonkey/tampermonkey-mcp#native-messaging).

Register the helper once with `tampermonkey-mcp --install-native-host firefox` (or `chrome`), then choose **Enable / apply** in the popup. Reading existing script source is the default. **Allow updates to existing scripts** separately enables source updates, which require a prior-read revision. Configure the MCP client with `--transport=native`. The existing manual WebSocket connection remains available.

Only the popup may enable or expand native access. Browser storage retains permission choices, not pairing credentials. The fixed registered host is `net.tampermonkey.editors_mcp`; its manifest allows only official Editors IDs. There is no URL handler that grants trust or discovers arbitrary servers. The native route rejects create/delete, storage and external-resource commands independently of the helper.

**Disable and forget** clears consent, closes the native port, stops retries and removes the optional permission. Browser/helper restarts restore approved access; losing the browser permission disables it. Retries use bounded backoff, and disconnects never replay an interrupted script update. This trusts the installed local helper and OS account, not arbitrary websites or remote hosts. See the MCP documentation for its local authentication, installer and platform limits.

`npm test` exercises consent, startup/reconnect, read/write boundaries, revocation races, malformed input and popup-only authorization. Tests simulate browser ports; real installation and restart acceptance tests are still needed on each supported browser/OS.

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
