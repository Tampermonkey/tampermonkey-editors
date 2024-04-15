/* globals require, module  */

const { READ, ReferenceTracker } = require('eslint-utils');


/*
// execute this at a browser env
const getProtoFns = (...as) => {
    const r = {};

    for (const a of as) {
        for (const e of Object.keys(Object.getOwnPropertyDescriptors(a))) {
            if ([ 'undefined', '0'].includes(e)) continue;
            r[e] = { '[READ]': true }
        }
    }

    return r;
};

console.log(JSON.stringify(getProtoFns(window), null, 4).replaceAll('"[READ]"', '[READ]'));

*/


const oFns = {
    "Object": {
        [READ]: true
    },
    "Function": {
        [READ]: true
    },
    "Array": {
        [READ]: true
    },
    "Number": {
        [READ]: true
    },
    "parseFloat": {
        [READ]: true
    },
    "parseInt": {
        [READ]: true
    },
    "Infinity": {
        [READ]: true
    },
    "NaN": {
        [READ]: true
    },
    "Boolean": {
        [READ]: true
    },
    "String": {
        [READ]: true
    },
    "Symbol": {
        [READ]: true
    },
    "Date": {
        [READ]: true
    },
    "Promise": {
        [READ]: true
    },
    "RegExp": {
        [READ]: true
    },
    "Error": {
        [READ]: true
    },
    "AggregateError": {
        [READ]: true
    },
    "EvalError": {
        [READ]: true
    },
    "RangeError": {
        [READ]: true
    },
    "ReferenceError": {
        [READ]: true
    },
    "SyntaxError": {
        [READ]: true
    },
    "TypeError": {
        [READ]: true
    },
    "URIError": {
        [READ]: true
    },
    "globalThis": {
        [READ]: true
    },
    "JSON": {
        [READ]: true
    },
    "Math": {
        [READ]: true
    },
    "console": {
        [READ]: true
    },
    "Intl": {
        [READ]: true
    },
    "ArrayBuffer": {
        [READ]: true
    },
    "Uint8Array": {
        [READ]: true
    },
    "Int8Array": {
        [READ]: true
    },
    "Uint16Array": {
        [READ]: true
    },
    "Int16Array": {
        [READ]: true
    },
    "Uint32Array": {
        [READ]: true
    },
    "Int32Array": {
        [READ]: true
    },
    "Float32Array": {
        [READ]: true
    },
    "Float64Array": {
        [READ]: true
    },
    "Uint8ClampedArray": {
        [READ]: true
    },
    "BigUint64Array": {
        [READ]: true
    },
    "BigInt64Array": {
        [READ]: true
    },
    "DataView": {
        [READ]: true
    },
    "Map": {
        [READ]: true
    },
    "BigInt": {
        [READ]: true
    },
    "Set": {
        [READ]: true
    },
    "WeakMap": {
        [READ]: true
    },
    "WeakSet": {
        [READ]: true
    },
    "Proxy": {
        [READ]: true
    },
    "Reflect": {
        [READ]: true
    },
    "FinalizationRegistry": {
        [READ]: true
    },
    "WeakRef": {
        [READ]: true
    },
    "decodeURI": {
        [READ]: true
    },
    "decodeURIComponent": {
        [READ]: true
    },
    "encodeURI": {
        [READ]: true
    },
    "encodeURIComponent": {
        [READ]: true
    },
    "escape": {
        [READ]: true
    },
    "unescape": {
        [READ]: true
    },
    "eval": {
        [READ]: true
    },
    "isFinite": {
        [READ]: true
    },
    "isNaN": {
        [READ]: true
    },
    "Option": {
        [READ]: true
    },
    "Image": {
        [READ]: true
    },
    "Audio": {
        [READ]: true
    },
    "webkitURL": {
        [READ]: true
    },
    "webkitRTCPeerConnection": {
        [READ]: true
    },
    "webkitMediaStream": {
        [READ]: true
    },
    "WebKitMutationObserver": {
        [READ]: true
    },
    "WebKitCSSMatrix": {
        [READ]: true
    },
    "XPathResult": {
        [READ]: true
    },
    "XPathExpression": {
        [READ]: true
    },
    "XPathEvaluator": {
        [READ]: true
    },
    "XMLSerializer": {
        [READ]: true
    },
    "XMLHttpRequestUpload": {
        [READ]: true
    },
    "XMLHttpRequestEventTarget": {
        [READ]: true
    },
    "XMLHttpRequest": {
        [READ]: true
    },
    "XMLDocument": {
        [READ]: true
    },
    "WritableStreamDefaultWriter": {
        [READ]: true
    },
    "WritableStreamDefaultController": {
        [READ]: true
    },
    "WritableStream": {
        [READ]: true
    },
    "Worker": {
        [READ]: true
    },
    "Window": {
        [READ]: true
    },
    "WheelEvent": {
        [READ]: true
    },
    "WebSocket": {
        [READ]: true
    },
    "WebGLVertexArrayObject": {
        [READ]: true
    },
    "WebGLUniformLocation": {
        [READ]: true
    },
    "WebGLTransformFeedback": {
        [READ]: true
    },
    "WebGLTexture": {
        [READ]: true
    },
    "WebGLSync": {
        [READ]: true
    },
    "WebGLShaderPrecisionFormat": {
        [READ]: true
    },
    "WebGLShader": {
        [READ]: true
    },
    "WebGLSampler": {
        [READ]: true
    },
    "WebGLRenderingContext": {
        [READ]: true
    },
    "WebGLRenderbuffer": {
        [READ]: true
    },
    "WebGLQuery": {
        [READ]: true
    },
    "WebGLProgram": {
        [READ]: true
    },
    "WebGLFramebuffer": {
        [READ]: true
    },
    "WebGLContextEvent": {
        [READ]: true
    },
    "WebGLBuffer": {
        [READ]: true
    },
    "WebGLActiveInfo": {
        [READ]: true
    },
    "WebGL2RenderingContext": {
        [READ]: true
    },
    "WaveShaperNode": {
        [READ]: true
    },
    "VisualViewport": {
        [READ]: true
    },
    "ValidityState": {
        [READ]: true
    },
    "VTTCue": {
        [READ]: true
    },
    "UserActivation": {
        [READ]: true
    },
    "URLSearchParams": {
        [READ]: true
    },
    "URL": {
        [READ]: true
    },
    "UIEvent": {
        [READ]: true
    },
    "TreeWalker": {
        [READ]: true
    },
    "TransitionEvent": {
        [READ]: true
    },
    "TransformStream": {
        [READ]: true
    },
    "TrackEvent": {
        [READ]: true
    },
    "TouchList": {
        [READ]: true
    },
    "TouchEvent": {
        [READ]: true
    },
    "Touch": {
        [READ]: true
    },
    "TimeRanges": {
        [READ]: true
    },
    "TextTrackList": {
        [READ]: true
    },
    "TextTrackCueList": {
        [READ]: true
    },
    "TextTrackCue": {
        [READ]: true
    },
    "TextTrack": {
        [READ]: true
    },
    "TextMetrics": {
        [READ]: true
    },
    "TextEvent": {
        [READ]: true
    },
    "TextEncoderStream": {
        [READ]: true
    },
    "TextEncoder": {
        [READ]: true
    },
    "TextDecoderStream": {
        [READ]: true
    },
    "TextDecoder": {
        [READ]: true
    },
    "Text": {
        [READ]: true
    },
    "TaskAttributionTiming": {
        [READ]: true
    },
    "SyncManager": {
        [READ]: true
    },
    "SubmitEvent": {
        [READ]: true
    },
    "StyleSheetList": {
        [READ]: true
    },
    "StyleSheet": {
        [READ]: true
    },
    "StylePropertyMapReadOnly": {
        [READ]: true
    },
    "StylePropertyMap": {
        [READ]: true
    },
    "StorageEvent": {
        [READ]: true
    },
    "Storage": {
        [READ]: true
    },
    "StereoPannerNode": {
        [READ]: true
    },
    "StaticRange": {
        [READ]: true
    },
    "ShadowRoot": {
        [READ]: true
    },
    "Selection": {
        [READ]: true
    },
    "SecurityPolicyViolationEvent": {
        [READ]: true
    },
    "ScriptProcessorNode": {
        [READ]: true
    },
    "ScreenOrientation": {
        [READ]: true
    },
    "Screen": {
        [READ]: true
    },
    "SVGViewElement": {
        [READ]: true
    },
    "SVGUseElement": {
        [READ]: true
    },
    "SVGUnitTypes": {
        [READ]: true
    },
    "SVGTransformList": {
        [READ]: true
    },
    "SVGTransform": {
        [READ]: true
    },
    "SVGTitleElement": {
        [READ]: true
    },
    "SVGTextPositioningElement": {
        [READ]: true
    },
    "SVGTextPathElement": {
        [READ]: true
    },
    "SVGTextElement": {
        [READ]: true
    },
    "SVGTextContentElement": {
        [READ]: true
    },
    "SVGTSpanElement": {
        [READ]: true
    },
    "SVGSymbolElement": {
        [READ]: true
    },
    "SVGSwitchElement": {
        [READ]: true
    },
    "SVGStyleElement": {
        [READ]: true
    },
    "SVGStringList": {
        [READ]: true
    },
    "SVGStopElement": {
        [READ]: true
    },
    "SVGSetElement": {
        [READ]: true
    },
    "SVGScriptElement": {
        [READ]: true
    },
    "SVGSVGElement": {
        [READ]: true
    },
    "SVGRectElement": {
        [READ]: true
    },
    "SVGRect": {
        [READ]: true
    },
    "SVGRadialGradientElement": {
        [READ]: true
    },
    "SVGPreserveAspectRatio": {
        [READ]: true
    },
    "SVGPolylineElement": {
        [READ]: true
    },
    "SVGPolygonElement": {
        [READ]: true
    },
    "SVGPointList": {
        [READ]: true
    },
    "SVGPoint": {
        [READ]: true
    },
    "SVGPatternElement": {
        [READ]: true
    },
    "SVGPathElement": {
        [READ]: true
    },
    "SVGNumberList": {
        [READ]: true
    },
    "SVGNumber": {
        [READ]: true
    },
    "SVGMetadataElement": {
        [READ]: true
    },
    "SVGMatrix": {
        [READ]: true
    },
    "SVGMaskElement": {
        [READ]: true
    },
    "SVGMarkerElement": {
        [READ]: true
    },
    "SVGMPathElement": {
        [READ]: true
    },
    "SVGLinearGradientElement": {
        [READ]: true
    },
    "SVGLineElement": {
        [READ]: true
    },
    "SVGLengthList": {
        [READ]: true
    },
    "SVGLength": {
        [READ]: true
    },
    "SVGImageElement": {
        [READ]: true
    },
    "SVGGraphicsElement": {
        [READ]: true
    },
    "SVGGradientElement": {
        [READ]: true
    },
    "SVGGeometryElement": {
        [READ]: true
    },
    "SVGGElement": {
        [READ]: true
    },
    "SVGForeignObjectElement": {
        [READ]: true
    },
    "SVGFilterElement": {
        [READ]: true
    },
    "SVGFETurbulenceElement": {
        [READ]: true
    },
    "SVGFETileElement": {
        [READ]: true
    },
    "SVGFESpotLightElement": {
        [READ]: true
    },
    "SVGFESpecularLightingElement": {
        [READ]: true
    },
    "SVGFEPointLightElement": {
        [READ]: true
    },
    "SVGFEOffsetElement": {
        [READ]: true
    },
    "SVGFEMorphologyElement": {
        [READ]: true
    },
    "SVGFEMergeNodeElement": {
        [READ]: true
    },
    "SVGFEMergeElement": {
        [READ]: true
    },
    "SVGFEImageElement": {
        [READ]: true
    },
    "SVGFEGaussianBlurElement": {
        [READ]: true
    },
    "SVGFEFuncRElement": {
        [READ]: true
    },
    "SVGFEFuncGElement": {
        [READ]: true
    },
    "SVGFEFuncBElement": {
        [READ]: true
    },
    "SVGFEFuncAElement": {
        [READ]: true
    },
    "SVGFEFloodElement": {
        [READ]: true
    },
    "SVGFEDropShadowElement": {
        [READ]: true
    },
    "SVGFEDistantLightElement": {
        [READ]: true
    },
    "SVGFEDisplacementMapElement": {
        [READ]: true
    },
    "SVGFEDiffuseLightingElement": {
        [READ]: true
    },
    "SVGFEConvolveMatrixElement": {
        [READ]: true
    },
    "SVGFECompositeElement": {
        [READ]: true
    },
    "SVGFEComponentTransferElement": {
        [READ]: true
    },
    "SVGFEColorMatrixElement": {
        [READ]: true
    },
    "SVGFEBlendElement": {
        [READ]: true
    },
    "SVGEllipseElement": {
        [READ]: true
    },
    "SVGElement": {
        [READ]: true
    },
    "SVGDescElement": {
        [READ]: true
    },
    "SVGDefsElement": {
        [READ]: true
    },
    "SVGComponentTransferFunctionElement": {
        [READ]: true
    },
    "SVGClipPathElement": {
        [READ]: true
    },
    "SVGCircleElement": {
        [READ]: true
    },
    "SVGAnimationElement": {
        [READ]: true
    },
    "SVGAnimatedTransformList": {
        [READ]: true
    },
    "SVGAnimatedString": {
        [READ]: true
    },
    "SVGAnimatedRect": {
        [READ]: true
    },
    "SVGAnimatedPreserveAspectRatio": {
        [READ]: true
    },
    "SVGAnimatedNumberList": {
        [READ]: true
    },
    "SVGAnimatedNumber": {
        [READ]: true
    },
    "SVGAnimatedLengthList": {
        [READ]: true
    },
    "SVGAnimatedLength": {
        [READ]: true
    },
    "SVGAnimatedInteger": {
        [READ]: true
    },
    "SVGAnimatedEnumeration": {
        [READ]: true
    },
    "SVGAnimatedBoolean": {
        [READ]: true
    },
    "SVGAnimatedAngle": {
        [READ]: true
    },
    "SVGAnimateTransformElement": {
        [READ]: true
    },
    "SVGAnimateMotionElement": {
        [READ]: true
    },
    "SVGAnimateElement": {
        [READ]: true
    },
    "SVGAngle": {
        [READ]: true
    },
    "SVGAElement": {
        [READ]: true
    },
    "Response": {
        [READ]: true
    },
    "ResizeObserverSize": {
        [READ]: true
    },
    "ResizeObserverEntry": {
        [READ]: true
    },
    "ResizeObserver": {
        [READ]: true
    },
    "Request": {
        [READ]: true
    },
    "ReportingObserver": {
        [READ]: true
    },
    "ReadableStreamDefaultReader": {
        [READ]: true
    },
    "ReadableStreamDefaultController": {
        [READ]: true
    },
    "ReadableStreamBYOBRequest": {
        [READ]: true
    },
    "ReadableStreamBYOBReader": {
        [READ]: true
    },
    "ReadableStream": {
        [READ]: true
    },
    "ReadableByteStreamController": {
        [READ]: true
    },
    "Range": {
        [READ]: true
    },
    "RadioNodeList": {
        [READ]: true
    },
    "RTCTrackEvent": {
        [READ]: true
    },
    "RTCStatsReport": {
        [READ]: true
    },
    "RTCSessionDescription": {
        [READ]: true
    },
    "RTCSctpTransport": {
        [READ]: true
    },
    "RTCRtpTransceiver": {
        [READ]: true
    },
    "RTCRtpSender": {
        [READ]: true
    },
    "RTCRtpReceiver": {
        [READ]: true
    },
    "RTCPeerConnectionIceEvent": {
        [READ]: true
    },
    "RTCPeerConnectionIceErrorEvent": {
        [READ]: true
    },
    "RTCPeerConnection": {
        [READ]: true
    },
    "RTCIceCandidate": {
        [READ]: true
    },
    "RTCErrorEvent": {
        [READ]: true
    },
    "RTCError": {
        [READ]: true
    },
    "RTCEncodedVideoFrame": {
        [READ]: true
    },
    "RTCEncodedAudioFrame": {
        [READ]: true
    },
    "RTCDtlsTransport": {
        [READ]: true
    },
    "RTCDataChannelEvent": {
        [READ]: true
    },
    "RTCDataChannel": {
        [READ]: true
    },
    "RTCDTMFToneChangeEvent": {
        [READ]: true
    },
    "RTCDTMFSender": {
        [READ]: true
    },
    "RTCCertificate": {
        [READ]: true
    },
    "PromiseRejectionEvent": {
        [READ]: true
    },
    "ProgressEvent": {
        [READ]: true
    },
    "ProcessingInstruction": {
        [READ]: true
    },
    "PopStateEvent": {
        [READ]: true
    },
    "PointerEvent": {
        [READ]: true
    },
    "PluginArray": {
        [READ]: true
    },
    "Plugin": {
        [READ]: true
    },
    "PeriodicWave": {
        [READ]: true
    },
    "PerformanceTiming": {
        [READ]: true
    },
    "PerformanceServerTiming": {
        [READ]: true
    },
    "PerformanceResourceTiming": {
        [READ]: true
    },
    "PerformancePaintTiming": {
        [READ]: true
    },
    "PerformanceObserverEntryList": {
        [READ]: true
    },
    "PerformanceObserver": {
        [READ]: true
    },
    "PerformanceNavigationTiming": {
        [READ]: true
    },
    "PerformanceNavigation": {
        [READ]: true
    },
    "PerformanceMeasure": {
        [READ]: true
    },
    "PerformanceMark": {
        [READ]: true
    },
    "PerformanceLongTaskTiming": {
        [READ]: true
    },
    "PerformanceEventTiming": {
        [READ]: true
    },
    "PerformanceEntry": {
        [READ]: true
    },
    "PerformanceElementTiming": {
        [READ]: true
    },
    "Performance": {
        [READ]: true
    },
    "Path2D": {
        [READ]: true
    },
    "PannerNode": {
        [READ]: true
    },
    "PageTransitionEvent": {
        [READ]: true
    },
    "OverconstrainedError": {
        [READ]: true
    },
    "OscillatorNode": {
        [READ]: true
    },
    "OffscreenCanvasRenderingContext2D": {
        [READ]: true
    },
    "OffscreenCanvas": {
        [READ]: true
    },
    "OfflineAudioContext": {
        [READ]: true
    },
    "OfflineAudioCompletionEvent": {
        [READ]: true
    },
    "NodeList": {
        [READ]: true
    },
    "NodeIterator": {
        [READ]: true
    },
    "NodeFilter": {
        [READ]: true
    },
    "Node": {
        [READ]: true
    },
    "NetworkInformation": {
        [READ]: true
    },
    "Navigator": {
        [READ]: true
    },
    "NamedNodeMap": {
        [READ]: true
    },
    "MutationRecord": {
        [READ]: true
    },
    "MutationObserver": {
        [READ]: true
    },
    "MutationEvent": {
        [READ]: true
    },
    "MouseEvent": {
        [READ]: true
    },
    "MimeTypeArray": {
        [READ]: true
    },
    "MimeType": {
        [READ]: true
    },
    "MessagePort": {
        [READ]: true
    },
    "MessageEvent": {
        [READ]: true
    },
    "MessageChannel": {
        [READ]: true
    },
    "MediaStreamTrackEvent": {
        [READ]: true
    },
    "MediaStreamTrack": {
        [READ]: true
    },
    "MediaStreamEvent": {
        [READ]: true
    },
    "MediaStreamAudioSourceNode": {
        [READ]: true
    },
    "MediaStreamAudioDestinationNode": {
        [READ]: true
    },
    "MediaStream": {
        [READ]: true
    },
    "MediaRecorder": {
        [READ]: true
    },
    "MediaQueryListEvent": {
        [READ]: true
    },
    "MediaQueryList": {
        [READ]: true
    },
    "MediaList": {
        [READ]: true
    },
    "MediaError": {
        [READ]: true
    },
    "MediaEncryptedEvent": {
        [READ]: true
    },
    "MediaElementAudioSourceNode": {
        [READ]: true
    },
    "MediaCapabilities": {
        [READ]: true
    },
    "Location": {
        [READ]: true
    },
    "LayoutShiftAttribution": {
        [READ]: true
    },
    "LayoutShift": {
        [READ]: true
    },
    "LargestContentfulPaint": {
        [READ]: true
    },
    "KeyframeEffect": {
        [READ]: true
    },
    "KeyboardEvent": {
        [READ]: true
    },
    "IntersectionObserverEntry": {
        [READ]: true
    },
    "IntersectionObserver": {
        [READ]: true
    },
    "InputEvent": {
        [READ]: true
    },
    "InputDeviceInfo": {
        [READ]: true
    },
    "InputDeviceCapabilities": {
        [READ]: true
    },
    "ImageData": {
        [READ]: true
    },
    "ImageCapture": {
        [READ]: true
    },
    "ImageBitmapRenderingContext": {
        [READ]: true
    },
    "ImageBitmap": {
        [READ]: true
    },
    "IdleDeadline": {
        [READ]: true
    },
    "IIRFilterNode": {
        [READ]: true
    },
    "IDBVersionChangeEvent": {
        [READ]: true
    },
    "IDBTransaction": {
        [READ]: true
    },
    "IDBRequest": {
        [READ]: true
    },
    "IDBOpenDBRequest": {
        [READ]: true
    },
    "IDBObjectStore": {
        [READ]: true
    },
    "IDBKeyRange": {
        [READ]: true
    },
    "IDBIndex": {
        [READ]: true
    },
    "IDBFactory": {
        [READ]: true
    },
    "IDBDatabase": {
        [READ]: true
    },
    "IDBCursorWithValue": {
        [READ]: true
    },
    "IDBCursor": {
        [READ]: true
    },
    "History": {
        [READ]: true
    },
    "Headers": {
        [READ]: true
    },
    "HashChangeEvent": {
        [READ]: true
    },
    "HTMLVideoElement": {
        [READ]: true
    },
    "HTMLUnknownElement": {
        [READ]: true
    },
    "HTMLUListElement": {
        [READ]: true
    },
    "HTMLTrackElement": {
        [READ]: true
    },
    "HTMLTitleElement": {
        [READ]: true
    },
    "HTMLTimeElement": {
        [READ]: true
    },
    "HTMLTextAreaElement": {
        [READ]: true
    },
    "HTMLTemplateElement": {
        [READ]: true
    },
    "HTMLTableSectionElement": {
        [READ]: true
    },
    "HTMLTableRowElement": {
        [READ]: true
    },
    "HTMLTableElement": {
        [READ]: true
    },
    "HTMLTableColElement": {
        [READ]: true
    },
    "HTMLTableCellElement": {
        [READ]: true
    },
    "HTMLTableCaptionElement": {
        [READ]: true
    },
    "HTMLStyleElement": {
        [READ]: true
    },
    "HTMLSpanElement": {
        [READ]: true
    },
    "HTMLSourceElement": {
        [READ]: true
    },
    "HTMLSlotElement": {
        [READ]: true
    },
    "HTMLSelectElement": {
        [READ]: true
    },
    "HTMLScriptElement": {
        [READ]: true
    },
    "HTMLQuoteElement": {
        [READ]: true
    },
    "HTMLProgressElement": {
        [READ]: true
    },
    "HTMLPreElement": {
        [READ]: true
    },
    "HTMLPictureElement": {
        [READ]: true
    },
    "HTMLParamElement": {
        [READ]: true
    },
    "HTMLParagraphElement": {
        [READ]: true
    },
    "HTMLOutputElement": {
        [READ]: true
    },
    "HTMLOptionsCollection": {
        [READ]: true
    },
    "HTMLOptionElement": {
        [READ]: true
    },
    "HTMLOptGroupElement": {
        [READ]: true
    },
    "HTMLObjectElement": {
        [READ]: true
    },
    "HTMLOListElement": {
        [READ]: true
    },
    "HTMLModElement": {
        [READ]: true
    },
    "HTMLMeterElement": {
        [READ]: true
    },
    "HTMLMetaElement": {
        [READ]: true
    },
    "HTMLMenuElement": {
        [READ]: true
    },
    "HTMLMediaElement": {
        [READ]: true
    },
    "HTMLMarqueeElement": {
        [READ]: true
    },
    "HTMLMapElement": {
        [READ]: true
    },
    "HTMLLinkElement": {
        [READ]: true
    },
    "HTMLLegendElement": {
        [READ]: true
    },
    "HTMLLabelElement": {
        [READ]: true
    },
    "HTMLLIElement": {
        [READ]: true
    },
    "HTMLInputElement": {
        [READ]: true
    },
    "HTMLImageElement": {
        [READ]: true
    },
    "HTMLIFrameElement": {
        [READ]: true
    },
    "HTMLHtmlElement": {
        [READ]: true
    },
    "HTMLHeadingElement": {
        [READ]: true
    },
    "HTMLHeadElement": {
        [READ]: true
    },
    "HTMLHRElement": {
        [READ]: true
    },
    "HTMLFrameSetElement": {
        [READ]: true
    },
    "HTMLFrameElement": {
        [READ]: true
    },
    "HTMLFormElement": {
        [READ]: true
    },
    "HTMLFormControlsCollection": {
        [READ]: true
    },
    "HTMLFontElement": {
        [READ]: true
    },
    "HTMLFieldSetElement": {
        [READ]: true
    },
    "HTMLEmbedElement": {
        [READ]: true
    },
    "HTMLElement": {
        [READ]: true
    },
    "HTMLDocument": {
        [READ]: true
    },
    "HTMLDivElement": {
        [READ]: true
    },
    "HTMLDirectoryElement": {
        [READ]: true
    },
    "HTMLDialogElement": {
        [READ]: true
    },
    "HTMLDetailsElement": {
        [READ]: true
    },
    "HTMLDataListElement": {
        [READ]: true
    },
    "HTMLDataElement": {
        [READ]: true
    },
    "HTMLDListElement": {
        [READ]: true
    },
    "HTMLCollection": {
        [READ]: true
    },
    "HTMLCanvasElement": {
        [READ]: true
    },
    "HTMLButtonElement": {
        [READ]: true
    },
    "HTMLBodyElement": {
        [READ]: true
    },
    "HTMLBaseElement": {
        [READ]: true
    },
    "HTMLBRElement": {
        [READ]: true
    },
    "HTMLAudioElement": {
        [READ]: true
    },
    "HTMLAreaElement": {
        [READ]: true
    },
    "HTMLAnchorElement": {
        [READ]: true
    },
    "HTMLAllCollection": {
        [READ]: true
    },
    "GeolocationPositionError": {
        [READ]: true
    },
    "GeolocationPosition": {
        [READ]: true
    },
    "GeolocationCoordinates": {
        [READ]: true
    },
    "Geolocation": {
        [READ]: true
    },
    "GamepadHapticActuator": {
        [READ]: true
    },
    "GamepadEvent": {
        [READ]: true
    },
    "GamepadButton": {
        [READ]: true
    },
    "Gamepad": {
        [READ]: true
    },
    "GainNode": {
        [READ]: true
    },
    "FormDataEvent": {
        [READ]: true
    },
    "FormData": {
        [READ]: true
    },
    "FontFaceSetLoadEvent": {
        [READ]: true
    },
    "FontFace": {
        [READ]: true
    },
    "FocusEvent": {
        [READ]: true
    },
    "FileReader": {
        [READ]: true
    },
    "FileList": {
        [READ]: true
    },
    "File": {
        [READ]: true
    },
    "FeaturePolicy": {
        [READ]: true
    },
    "External": {
        [READ]: true
    },
    "EventTarget": {
        [READ]: true
    },
    "EventSource": {
        [READ]: true
    },
    "EventCounts": {
        [READ]: true
    },
    "Event": {
        [READ]: true
    },
    "ErrorEvent": {
        [READ]: true
    },
    "ElementInternals": {
        [READ]: true
    },
    "Element": {
        [READ]: true
    },
    "DynamicsCompressorNode": {
        [READ]: true
    },
    "DragEvent": {
        [READ]: true
    },
    "DocumentType": {
        [READ]: true
    },
    "DocumentFragment": {
        [READ]: true
    },
    "Document": {
        [READ]: true
    },
    "DelayNode": {
        [READ]: true
    },
    "DecompressionStream": {
        [READ]: true
    },
    "DataTransferItemList": {
        [READ]: true
    },
    "DataTransferItem": {
        [READ]: true
    },
    "DataTransfer": {
        [READ]: true
    },
    "DOMTokenList": {
        [READ]: true
    },
    "DOMStringMap": {
        [READ]: true
    },
    "DOMStringList": {
        [READ]: true
    },
    "DOMRectReadOnly": {
        [READ]: true
    },
    "DOMRectList": {
        [READ]: true
    },
    "DOMRect": {
        [READ]: true
    },
    "DOMQuad": {
        [READ]: true
    },
    "DOMPointReadOnly": {
        [READ]: true
    },
    "DOMPoint": {
        [READ]: true
    },
    "DOMParser": {
        [READ]: true
    },
    "DOMMatrixReadOnly": {
        [READ]: true
    },
    "DOMMatrix": {
        [READ]: true
    },
    "DOMImplementation": {
        [READ]: true
    },
    "DOMException": {
        [READ]: true
    },
    "DOMError": {
        [READ]: true
    },
    "CustomEvent": {
        [READ]: true
    },
    "CustomElementRegistry": {
        [READ]: true
    },
    "Crypto": {
        [READ]: true
    },
    "CountQueuingStrategy": {
        [READ]: true
    },
    "ConvolverNode": {
        [READ]: true
    },
    "ConstantSourceNode": {
        [READ]: true
    },
    "CompressionStream": {
        [READ]: true
    },
    "CompositionEvent": {
        [READ]: true
    },
    "Comment": {
        [READ]: true
    },
    "CloseEvent": {
        [READ]: true
    },
    "ClipboardEvent": {
        [READ]: true
    },
    "CharacterData": {
        [READ]: true
    },
    "ChannelSplitterNode": {
        [READ]: true
    },
    "ChannelMergerNode": {
        [READ]: true
    },
    "CanvasRenderingContext2D": {
        [READ]: true
    },
    "CanvasPattern": {
        [READ]: true
    },
    "CanvasGradient": {
        [READ]: true
    },
    "CanvasCaptureMediaStreamTrack": {
        [READ]: true
    },
    "CSSVariableReferenceValue": {
        [READ]: true
    },
    "CSSUnparsedValue": {
        [READ]: true
    },
    "CSSUnitValue": {
        [READ]: true
    },
    "CSSTranslate": {
        [READ]: true
    },
    "CSSTransformValue": {
        [READ]: true
    },
    "CSSTransformComponent": {
        [READ]: true
    },
    "CSSSupportsRule": {
        [READ]: true
    },
    "CSSStyleValue": {
        [READ]: true
    },
    "CSSStyleSheet": {
        [READ]: true
    },
    "CSSStyleRule": {
        [READ]: true
    },
    "CSSStyleDeclaration": {
        [READ]: true
    },
    "CSSSkewY": {
        [READ]: true
    },
    "CSSSkewX": {
        [READ]: true
    },
    "CSSSkew": {
        [READ]: true
    },
    "CSSScale": {
        [READ]: true
    },
    "CSSRuleList": {
        [READ]: true
    },
    "CSSRule": {
        [READ]: true
    },
    "CSSRotate": {
        [READ]: true
    },
    "CSSPropertyRule": {
        [READ]: true
    },
    "CSSPositionValue": {
        [READ]: true
    },
    "CSSPerspective": {
        [READ]: true
    },
    "CSSPageRule": {
        [READ]: true
    },
    "CSSNumericValue": {
        [READ]: true
    },
    "CSSNumericArray": {
        [READ]: true
    },
    "CSSNamespaceRule": {
        [READ]: true
    },
    "CSSMediaRule": {
        [READ]: true
    },
    "CSSMatrixComponent": {
        [READ]: true
    },
    "CSSMathValue": {
        [READ]: true
    },
    "CSSMathSum": {
        [READ]: true
    },
    "CSSMathProduct": {
        [READ]: true
    },
    "CSSMathNegate": {
        [READ]: true
    },
    "CSSMathMin": {
        [READ]: true
    },
    "CSSMathMax": {
        [READ]: true
    },
    "CSSMathInvert": {
        [READ]: true
    },
    "CSSKeywordValue": {
        [READ]: true
    },
    "CSSKeyframesRule": {
        [READ]: true
    },
    "CSSKeyframeRule": {
        [READ]: true
    },
    "CSSImportRule": {
        [READ]: true
    },
    "CSSImageValue": {
        [READ]: true
    },
    "CSSGroupingRule": {
        [READ]: true
    },
    "CSSFontFaceRule": {
        [READ]: true
    },
    "CSSCounterStyleRule": {
        [READ]: true
    },
    "CSSConditionRule": {
        [READ]: true
    },
    "CSS": {
        [READ]: true
    },
    "CDATASection": {
        [READ]: true
    },
    "ByteLengthQueuingStrategy": {
        [READ]: true
    },
    "BroadcastChannel": {
        [READ]: true
    },
    "BlobEvent": {
        [READ]: true
    },
    "Blob": {
        [READ]: true
    },
    "BiquadFilterNode": {
        [READ]: true
    },
    "BeforeUnloadEvent": {
        [READ]: true
    },
    "BeforeInstallPromptEvent": {
        [READ]: true
    },
    "BatteryManager": {
        [READ]: true
    },
    "BaseAudioContext": {
        [READ]: true
    },
    "BarProp": {
        [READ]: true
    },
    "AudioWorkletNode": {
        [READ]: true
    },
    "AudioScheduledSourceNode": {
        [READ]: true
    },
    "AudioProcessingEvent": {
        [READ]: true
    },
    "AudioParamMap": {
        [READ]: true
    },
    "AudioParam": {
        [READ]: true
    },
    "AudioNode": {
        [READ]: true
    },
    "AudioListener": {
        [READ]: true
    },
    "AudioDestinationNode": {
        [READ]: true
    },
    "AudioContext": {
        [READ]: true
    },
    "AudioBufferSourceNode": {
        [READ]: true
    },
    "AudioBuffer": {
        [READ]: true
    },
    "Attr": {
        [READ]: true
    },
    "AnimationEvent": {
        [READ]: true
    },
    "AnimationEffect": {
        [READ]: true
    },
    "Animation": {
        [READ]: true
    },
    "AnalyserNode": {
        [READ]: true
    },
    "AbstractRange": {
        [READ]: true
    },
    "AbortSignal": {
        [READ]: true
    },
    "AbortController": {
        [READ]: true
    },
    "window": {
        [READ]: true
    },
    "self": {
        [READ]: true
    },
    "document": {
        [READ]: true
    },
    "name": {
        [READ]: true
    },
    "location": {
        [READ]: true
    },
    "customElements": {
        [READ]: true
    },
    "history": {
        [READ]: true
    },
    "locationbar": {
        [READ]: true
    },
    "menubar": {
        [READ]: true
    },
    "personalbar": {
        [READ]: true
    },
    "scrollbars": {
        [READ]: true
    },
    "statusbar": {
        [READ]: true
    },
    "toolbar": {
        [READ]: true
    },
    "status": {
        [READ]: true
    },
    "closed": {
        [READ]: true
    },
    "frames": {
        [READ]: true
    },
    "length": {
        [READ]: true
    },
    "top": {
        [READ]: true
    },
    "opener": {
        [READ]: true
    },
    "parent": {
        [READ]: true
    },
    "frameElement": {
        [READ]: true
    },
    "navigator": {
        [READ]: true
    },
    "origin": {
        [READ]: true
    },
    "external": {
        [READ]: true
    },
    "screen": {
        [READ]: true
    },
    "innerWidth": {
        [READ]: true
    },
    "innerHeight": {
        [READ]: true
    },
    "scrollX": {
        [READ]: true
    },
    "pageXOffset": {
        [READ]: true
    },
    "scrollY": {
        [READ]: true
    },
    "pageYOffset": {
        [READ]: true
    },
    "visualViewport": {
        [READ]: true
    },
    "screenX": {
        [READ]: true
    },
    "screenY": {
        [READ]: true
    },
    "outerWidth": {
        [READ]: true
    },
    "outerHeight": {
        [READ]: true
    },
    "devicePixelRatio": {
        [READ]: true
    },
    "event": {
        [READ]: true
    },
    "clientInformation": {
        [READ]: true
    },
    "offscreenBuffering": {
        [READ]: true
    },
    "screenLeft": {
        [READ]: true
    },
    "screenTop": {
        [READ]: true
    },
    "defaultStatus": {
        [READ]: true
    },
    "defaultstatus": {
        [READ]: true
    },
    "styleMedia": {
        [READ]: true
    },
    "onsearch": {
        [READ]: true
    },
    "isSecureContext": {
        [READ]: true
    },
    "performance": {
        [READ]: true
    },
    "onappinstalled": {
        [READ]: true
    },
    "onbeforeinstallprompt": {
        [READ]: true
    },
    "crypto": {
        [READ]: true
    },
    "indexedDB": {
        [READ]: true
    },
    "webkitStorageInfo": {
        [READ]: true
    },
    "sessionStorage": {
        [READ]: true
    },
    "localStorage": {
        [READ]: true
    },
    "onbeforexrselect": {
        [READ]: true
    },
    "onabort": {
        [READ]: true
    },
    "onblur": {
        [READ]: true
    },
    "oncancel": {
        [READ]: true
    },
    "oncanplay": {
        [READ]: true
    },
    "oncanplaythrough": {
        [READ]: true
    },
    "onchange": {
        [READ]: true
    },
    "onclick": {
        [READ]: true
    },
    "onclose": {
        [READ]: true
    },
    "oncontextmenu": {
        [READ]: true
    },
    "oncuechange": {
        [READ]: true
    },
    "ondblclick": {
        [READ]: true
    },
    "ondrag": {
        [READ]: true
    },
    "ondragend": {
        [READ]: true
    },
    "ondragenter": {
        [READ]: true
    },
    "ondragleave": {
        [READ]: true
    },
    "ondragover": {
        [READ]: true
    },
    "ondragstart": {
        [READ]: true
    },
    "ondrop": {
        [READ]: true
    },
    "ondurationchange": {
        [READ]: true
    },
    "onemptied": {
        [READ]: true
    },
    "onended": {
        [READ]: true
    },
    "onerror": {
        [READ]: true
    },
    "onfocus": {
        [READ]: true
    },
    "onformdata": {
        [READ]: true
    },
    "oninput": {
        [READ]: true
    },
    "oninvalid": {
        [READ]: true
    },
    "onkeydown": {
        [READ]: true
    },
    "onkeypress": {
        [READ]: true
    },
    "onkeyup": {
        [READ]: true
    },
    "onload": {
        [READ]: true
    },
    "onloadeddata": {
        [READ]: true
    },
    "onloadedmetadata": {
        [READ]: true
    },
    "onloadstart": {
        [READ]: true
    },
    "onmousedown": {
        [READ]: true
    },
    "onmouseenter": {
        [READ]: true
    },
    "onmouseleave": {
        [READ]: true
    },
    "onmousemove": {
        [READ]: true
    },
    "onmouseout": {
        [READ]: true
    },
    "onmouseover": {
        [READ]: true
    },
    "onmouseup": {
        [READ]: true
    },
    "onmousewheel": {
        [READ]: true
    },
    "onpause": {
        [READ]: true
    },
    "onplay": {
        [READ]: true
    },
    "onplaying": {
        [READ]: true
    },
    "onprogress": {
        [READ]: true
    },
    "onratechange": {
        [READ]: true
    },
    "onreset": {
        [READ]: true
    },
    "onresize": {
        [READ]: true
    },
    "onscroll": {
        [READ]: true
    },
    "onsecuritypolicyviolation": {
        [READ]: true
    },
    "onseeked": {
        [READ]: true
    },
    "onseeking": {
        [READ]: true
    },
    "onselect": {
        [READ]: true
    },
    "onslotchange": {
        [READ]: true
    },
    "onstalled": {
        [READ]: true
    },
    "onsubmit": {
        [READ]: true
    },
    "onsuspend": {
        [READ]: true
    },
    "ontimeupdate": {
        [READ]: true
    },
    "ontoggle": {
        [READ]: true
    },
    "onvolumechange": {
        [READ]: true
    },
    "onwaiting": {
        [READ]: true
    },
    "onwebkitanimationend": {
        [READ]: true
    },
    "onwebkitanimationiteration": {
        [READ]: true
    },
    "onwebkitanimationstart": {
        [READ]: true
    },
    "onwebkittransitionend": {
        [READ]: true
    },
    "onwheel": {
        [READ]: true
    },
    "onauxclick": {
        [READ]: true
    },
    "ongotpointercapture": {
        [READ]: true
    },
    "onlostpointercapture": {
        [READ]: true
    },
    "onpointerdown": {
        [READ]: true
    },
    "onpointermove": {
        [READ]: true
    },
    "onpointerup": {
        [READ]: true
    },
    "onpointercancel": {
        [READ]: true
    },
    "onpointerover": {
        [READ]: true
    },
    "onpointerout": {
        [READ]: true
    },
    "onpointerenter": {
        [READ]: true
    },
    "onpointerleave": {
        [READ]: true
    },
    "onselectstart": {
        [READ]: true
    },
    "onselectionchange": {
        [READ]: true
    },
    "onanimationend": {
        [READ]: true
    },
    "onanimationiteration": {
        [READ]: true
    },
    "onanimationstart": {
        [READ]: true
    },
    "ontransitionrun": {
        [READ]: true
    },
    "ontransitionstart": {
        [READ]: true
    },
    "ontransitionend": {
        [READ]: true
    },
    "ontransitioncancel": {
        [READ]: true
    },
    "onafterprint": {
        [READ]: true
    },
    "onbeforeprint": {
        [READ]: true
    },
    "onbeforeunload": {
        [READ]: true
    },
    "onhashchange": {
        [READ]: true
    },
    "onlanguagechange": {
        [READ]: true
    },
    "onmessage": {
        [READ]: true
    },
    "onmessageerror": {
        [READ]: true
    },
    "onoffline": {
        [READ]: true
    },
    "ononline": {
        [READ]: true
    },
    "onpagehide": {
        [READ]: true
    },
    "onpageshow": {
        [READ]: true
    },
    "onpopstate": {
        [READ]: true
    },
    "onrejectionhandled": {
        [READ]: true
    },
    "onstorage": {
        [READ]: true
    },
    "onunhandledrejection": {
        [READ]: true
    },
    "onunload": {
        [READ]: true
    },
    "alert": {
        [READ]: true
    },
    "atob": {
        [READ]: true
    },
    "blur": {
        [READ]: true
    },
    "btoa": {
        [READ]: true
    },
    "cancelAnimationFrame": {
        [READ]: true
    },
    "cancelIdleCallback": {
        [READ]: true
    },
    "captureEvents": {
        [READ]: true
    },
    "clearInterval": {
        [READ]: true
    },
    "clearTimeout": {
        [READ]: true
    },
    "close": {
        [READ]: true
    },
    "confirm": {
        [READ]: true
    },
    "createImageBitmap": {
        [READ]: true
    },
    "fetch": {
        [READ]: true
    },
    "find": {
        [READ]: true
    },
    "focus": {
        [READ]: true
    },
    "getComputedStyle": {
        [READ]: true
    },
    "getSelection": {
        [READ]: true
    },
    "matchMedia": {
        [READ]: true
    },
    "moveBy": {
        [READ]: true
    },
    "moveTo": {
        [READ]: true
    },
    "open": {
        [READ]: true
    },
    "postMessage": {
        [READ]: true
    },
    "print": {
        [READ]: true
    },
    "prompt": {
        [READ]: true
    },
    "queueMicrotask": {
        [READ]: true
    },
    "releaseEvents": {
        [READ]: true
    },
    "reportError": {
        [READ]: true
    },
    "requestAnimationFrame": {
        [READ]: true
    },
    "requestIdleCallback": {
        [READ]: true
    },
    "resizeBy": {
        [READ]: true
    },
    "resizeTo": {
        [READ]: true
    },
    "scroll": {
        [READ]: true
    },
    "scrollBy": {
        [READ]: true
    },
    "scrollTo": {
        [READ]: true
    },
    "setInterval": {
        [READ]: true
    },
    "setTimeout": {
        [READ]: true
    },
    "stop": {
        [READ]: true
    },
    "structuredClone": {
        [READ]: true
    },
    "webkitCancelAnimationFrame": {
        [READ]: true
    },
    "webkitRequestAnimationFrame": {
        [READ]: true
    },
    "Atomics": {
        [READ]: true
    },
    "chrome": {
        [READ]: true
    },
    "WebAssembly": {
        [READ]: true
    },
    "caches": {
        [READ]: true
    },
    "cookieStore": {
        [READ]: true
    },
    "ondevicemotion": {
        [READ]: true
    },
    "ondeviceorientation": {
        [READ]: true
    },
    "ondeviceorientationabsolute": {
        [READ]: true
    },
    "AbsoluteOrientationSensor": {
        [READ]: true
    },
    "Accelerometer": {
        [READ]: true
    },
    "AudioWorklet": {
        [READ]: true
    },
    "Cache": {
        [READ]: true
    },
    "CacheStorage": {
        [READ]: true
    },
    "Clipboard": {
        [READ]: true
    },
    "ClipboardItem": {
        [READ]: true
    },
    "CookieChangeEvent": {
        [READ]: true
    },
    "CookieStore": {
        [READ]: true
    },
    "CookieStoreManager": {
        [READ]: true
    },
    "Credential": {
        [READ]: true
    },
    "CredentialsContainer": {
        [READ]: true
    },
    "CryptoKey": {
        [READ]: true
    },
    "DeviceMotionEvent": {
        [READ]: true
    },
    "DeviceMotionEventAcceleration": {
        [READ]: true
    },
    "DeviceMotionEventRotationRate": {
        [READ]: true
    },
    "DeviceOrientationEvent": {
        [READ]: true
    },
    "FederatedCredential": {
        [READ]: true
    },
    "Gyroscope": {
        [READ]: true
    },
    "Keyboard": {
        [READ]: true
    },
    "KeyboardLayoutMap": {
        [READ]: true
    },
    "LinearAccelerationSensor": {
        [READ]: true
    },
    "Lock": {
        [READ]: true
    },
    "LockManager": {
        [READ]: true
    },
    "MIDIAccess": {
        [READ]: true
    },
    "MIDIConnectionEvent": {
        [READ]: true
    },
    "MIDIInput": {
        [READ]: true
    },
    "MIDIInputMap": {
        [READ]: true
    },
    "MIDIMessageEvent": {
        [READ]: true
    },
    "MIDIOutput": {
        [READ]: true
    },
    "MIDIOutputMap": {
        [READ]: true
    },
    "MIDIPort": {
        [READ]: true
    },
    "MediaDeviceInfo": {
        [READ]: true
    },
    "MediaDevices": {
        [READ]: true
    },
    "MediaKeyMessageEvent": {
        [READ]: true
    },
    "MediaKeySession": {
        [READ]: true
    },
    "MediaKeyStatusMap": {
        [READ]: true
    },
    "MediaKeySystemAccess": {
        [READ]: true
    },
    "MediaKeys": {
        [READ]: true
    },
    "NavigationPreloadManager": {
        [READ]: true
    },
    "NavigatorManagedData": {
        [READ]: true
    },
    "OrientationSensor": {
        [READ]: true
    },
    "PasswordCredential": {
        [READ]: true
    },
    "RTCIceTransport": {
        [READ]: true
    },
    "RelativeOrientationSensor": {
        [READ]: true
    },
    "Sensor": {
        [READ]: true
    },
    "SensorErrorEvent": {
        [READ]: true
    },
    "ServiceWorker": {
        [READ]: true
    },
    "ServiceWorkerContainer": {
        [READ]: true
    },
    "ServiceWorkerRegistration": {
        [READ]: true
    },
    "StorageManager": {
        [READ]: true
    },
    "SubtleCrypto": {
        [READ]: true
    },
    "Worklet": {
        [READ]: true
    },
    "XRDOMOverlayState": {
        [READ]: true
    },
    "XRLayer": {
        [READ]: true
    },
    "XRWebGLBinding": {
        [READ]: true
    },
    "AudioData": {
        [READ]: true
    },
    "EncodedAudioChunk": {
        [READ]: true
    },
    "EncodedVideoChunk": {
        [READ]: true
    },
    "ImageTrack": {
        [READ]: true
    },
    "ImageTrackList": {
        [READ]: true
    },
    "VideoColorSpace": {
        [READ]: true
    },
    "VideoFrame": {
        [READ]: true
    },
    "AudioDecoder": {
        [READ]: true
    },
    "AudioEncoder": {
        [READ]: true
    },
    "ImageDecoder": {
        [READ]: true
    },
    "VideoDecoder": {
        [READ]: true
    },
    "VideoEncoder": {
        [READ]: true
    },
    "AuthenticatorAssertionResponse": {
        [READ]: true
    },
    "AuthenticatorAttestationResponse": {
        [READ]: true
    },
    "AuthenticatorResponse": {
        [READ]: true
    },
    "PublicKeyCredential": {
        [READ]: true
    },
    "EyeDropper": {
        [READ]: true
    },
    "FileSystemDirectoryHandle": {
        [READ]: true
    },
    "FileSystemFileHandle": {
        [READ]: true
    },
    "FileSystemHandle": {
        [READ]: true
    },
    "FileSystemWritableFileStream": {
        [READ]: true
    },
    "FragmentDirective": {
        [READ]: true
    },
    "GravitySensor": {
        [READ]: true
    },
    "HID": {
        [READ]: true
    },
    "HIDConnectionEvent": {
        [READ]: true
    },
    "HIDDevice": {
        [READ]: true
    },
    "HIDInputReportEvent": {
        [READ]: true
    },
    "IdleDetector": {
        [READ]: true
    },
    "MediaStreamTrackGenerator": {
        [READ]: true
    },
    "MediaStreamTrackProcessor": {
        [READ]: true
    },
    "Mojo": {
        [READ]: true
    },
    "MojoHandle": {
        [READ]: true
    },
    "MojoWatcher": {
        [READ]: true
    },
    "OTPCredential": {
        [READ]: true
    },
    "PaymentAddress": {
        [READ]: true
    },
    "PaymentRequest": {
        [READ]: true
    },
    "PaymentResponse": {
        [READ]: true
    },
    "PaymentMethodChangeEvent": {
        [READ]: true
    },
    "Presentation": {
        [READ]: true
    },
    "PresentationAvailability": {
        [READ]: true
    },
    "PresentationConnection": {
        [READ]: true
    },
    "PresentationConnectionAvailableEvent": {
        [READ]: true
    },
    "PresentationConnectionCloseEvent": {
        [READ]: true
    },
    "PresentationConnectionList": {
        [READ]: true
    },
    "PresentationReceiver": {
        [READ]: true
    },
    "PresentationRequest": {
        [READ]: true
    },
    "Profiler": {
        [READ]: true
    },
    "Scheduling": {
        [READ]: true
    },
    "Serial": {
        [READ]: true
    },
    "SerialPort": {
        [READ]: true
    },
    "USB": {
        [READ]: true
    },
    "USBAlternateInterface": {
        [READ]: true
    },
    "USBConfiguration": {
        [READ]: true
    },
    "USBConnectionEvent": {
        [READ]: true
    },
    "USBDevice": {
        [READ]: true
    },
    "USBEndpoint": {
        [READ]: true
    },
    "USBInTransferResult": {
        [READ]: true
    },
    "USBInterface": {
        [READ]: true
    },
    "USBIsochronousInTransferPacket": {
        [READ]: true
    },
    "USBIsochronousInTransferResult": {
        [READ]: true
    },
    "USBIsochronousOutTransferPacket": {
        [READ]: true
    },
    "USBIsochronousOutTransferResult": {
        [READ]: true
    },
    "USBOutTransferResult": {
        [READ]: true
    },
    "VirtualKeyboard": {
        [READ]: true
    },
    "WakeLock": {
        [READ]: true
    },
    "WakeLockSentinel": {
        [READ]: true
    },
    "WebTransport": {
        [READ]: true
    },
    "WebTransportBidirectionalStream": {
        [READ]: true
    },
    "WebTransportDatagramDuplexStream": {
        [READ]: true
    },
    "WebTransportError": {
        [READ]: true
    },
    "XRAnchor": {
        [READ]: true
    },
    "XRAnchorSet": {
        [READ]: true
    },
    "XRBoundedReferenceSpace": {
        [READ]: true
    },
    "XRFrame": {
        [READ]: true
    },
    "XRInputSource": {
        [READ]: true
    },
    "XRInputSourceArray": {
        [READ]: true
    },
    "XRInputSourceEvent": {
        [READ]: true
    },
    "XRInputSourcesChangeEvent": {
        [READ]: true
    },
    "XRPose": {
        [READ]: true
    },
    "XRReferenceSpace": {
        [READ]: true
    },
    "XRReferenceSpaceEvent": {
        [READ]: true
    },
    "XRRenderState": {
        [READ]: true
    },
    "XRRigidTransform": {
        [READ]: true
    },
    "XRSession": {
        [READ]: true
    },
    "XRSessionEvent": {
        [READ]: true
    },
    "XRSpace": {
        [READ]: true
    },
    "XRSystem": {
        [READ]: true
    },
    "XRView": {
        [READ]: true
    },
    "XRViewerPose": {
        [READ]: true
    },
    "XRViewport": {
        [READ]: true
    },
    "XRWebGLLayer": {
        [READ]: true
    },
    "XRCPUDepthInformation": {
        [READ]: true
    },
    "XRDepthInformation": {
        [READ]: true
    },
    "XRWebGLDepthInformation": {
        [READ]: true
    },
    "XRHitTestResult": {
        [READ]: true
    },
    "XRHitTestSource": {
        [READ]: true
    },
    "XRRay": {
        [READ]: true
    },
    "XRTransientInputHitTestResult": {
        [READ]: true
    },
    "XRTransientInputHitTestSource": {
        [READ]: true
    },
    "XRLightEstimate": {
        [READ]: true
    },
    "XRLightProbe": {
        [READ]: true
    },
    "showDirectoryPicker": {
        [READ]: true
    },
    "showOpenFilePicker": {
        [READ]: true
    },
    "showSaveFilePicker": {
        [READ]: true
    },
    "originAgentCluster": {
        [READ]: true
    },
    "trustedTypes": {
        [READ]: true
    },
    "speechSynthesis": {
        [READ]: true
    },
    "onpointerrawupdate": {
        [READ]: true
    },
    "crossOriginIsolated": {
        [READ]: true
    },
    "scheduler": {
        [READ]: true
    },
    "AnimationPlaybackEvent": {
        [READ]: true
    },
    "AnimationTimeline": {
        [READ]: true
    },
    "CSSAnimation": {
        [READ]: true
    },
    "CSSTransition": {
        [READ]: true
    },
    "DocumentTimeline": {
        [READ]: true
    },
    "BackgroundFetchManager": {
        [READ]: true
    },
    "BackgroundFetchRecord": {
        [READ]: true
    },
    "BackgroundFetchRegistration": {
        [READ]: true
    },
    "CustomStateSet": {
        [READ]: true
    },
    "DelegatedInkTrailPresenter": {
        [READ]: true
    },
    "Ink": {
        [READ]: true
    },
    "MediaMetadata": {
        [READ]: true
    },
    "MediaSession": {
        [READ]: true
    },
    "MediaSource": {
        [READ]: true
    },
    "SourceBuffer": {
        [READ]: true
    },
    "SourceBufferList": {
        [READ]: true
    },
    "NavigatorUAData": {
        [READ]: true
    },
    "Notification": {
        [READ]: true
    },
    "PaymentInstruments": {
        [READ]: true
    },
    "PaymentManager": {
        [READ]: true
    },
    "PaymentRequestUpdateEvent": {
        [READ]: true
    },
    "PeriodicSyncManager": {
        [READ]: true
    },
    "PermissionStatus": {
        [READ]: true
    },
    "Permissions": {
        [READ]: true
    },
    "PictureInPictureEvent": {
        [READ]: true
    },
    "PictureInPictureWindow": {
        [READ]: true
    },
    "PushManager": {
        [READ]: true
    },
    "PushSubscription": {
        [READ]: true
    },
    "PushSubscriptionOptions": {
        [READ]: true
    },
    "RemotePlayback": {
        [READ]: true
    },
    "Scheduler": {
        [READ]: true
    },
    "TaskController": {
        [READ]: true
    },
    "TaskPriorityChangeEvent": {
        [READ]: true
    },
    "TaskSignal": {
        [READ]: true
    },
    "SharedWorker": {
        [READ]: true
    },
    "SpeechSynthesisErrorEvent": {
        [READ]: true
    },
    "SpeechSynthesisEvent": {
        [READ]: true
    },
    "SpeechSynthesisUtterance": {
        [READ]: true
    },
    "TrustedHTML": {
        [READ]: true
    },
    "TrustedScript": {
        [READ]: true
    },
    "TrustedScriptURL": {
        [READ]: true
    },
    "TrustedTypePolicy": {
        [READ]: true
    },
    "TrustedTypePolicyFactory": {
        [READ]: true
    },
    "URLPattern": {
        [READ]: true
    },
    "VideoPlaybackQuality": {
        [READ]: true
    },
    "VirtualKeyboardGeometryChangeEvent": {
        [READ]: true
    },
    "XSLTProcessor": {
        [READ]: true
    },
    "webkitSpeechGrammar": {
        [READ]: true
    },
    "webkitSpeechGrammarList": {
        [READ]: true
    },
    "webkitSpeechRecognition": {
        [READ]: true
    },
    "webkitSpeechRecognitionError": {
        [READ]: true
    },
    "webkitSpeechRecognitionEvent": {
        [READ]: true
    },
    "openDatabase": {
        [READ]: true
    },
    "webkitRequestFileSystem": {
        [READ]: true
    },
    "webkitResolveLocalFileSystemURL": {
        [READ]: true
    },
    "mojo": {
        [READ]: true
    },
    "JSCompiler_renameProperty": {
        [READ]: true
    },
    "ShadyCSS": {
        [READ]: true
    },
    "loadTimeData": {
        [READ]: true
    },
    "cr": {
        [READ]: true
    },
    "url": {
        [READ]: true
    },
    "chromeCart": {
        [READ]: true
    },
    "drive": {
        [READ]: true
    },
    "photos": {
        [READ]: true
    },
    "taskModule": {
        [READ]: true
    },
    "mojoBase": {
        [READ]: true
    },
    "skia": {
        [READ]: true
    },
    "mostVisited": {
        [READ]: true
    },
    "realbox": {
        [READ]: true
    },
    "newTabPage": {
        [READ]: true
    },
    "dir": {
        [READ]: true
    },
    "dirxml": {
        [READ]: true
    },
    "profile": {
        [READ]: true
    },
    "profileEnd": {
        [READ]: true
    },
    "table": {
        [READ]: true
    },
    "keys": {
        [READ]: true
    },
    "values": {
        [READ]: true
    },
    "debug": {
        [READ]: true
    },
    "undebug": {
        [READ]: true
    },
    "monitor": {
        [READ]: true
    },
    "unmonitor": {
        [READ]: true
    },
    "inspect": {
        [READ]: true
    },
    "copy": {
        [READ]: true
    },
    "queryObjects": {
        [READ]: true
    },
    "$_": {
        [READ]: true
    },
    "$0": {
        [READ]: true
    },
    "$1": {
        [READ]: true
    },
    "$2": {
        [READ]: true
    },
    "$3": {
        [READ]: true
    },
    "$4": {
        [READ]: true
    },
    "getEventListeners": {
        [READ]: true
    },
    "getAccessibleName": {
        [READ]: true
    },
    "getAccessibleRole": {
        [READ]: true
    },
    "monitorEvents": {
        [READ]: true
    },
    "unmonitorEvents": {
        [READ]: true
    },
    "$": {
        [READ]: true
    },
    "$$": {
        [READ]: true
    },
    "$x": {
        [READ]: true
    }
};

module.exports = {
    meta: {
        docs: {
            description: 'No unsafe global object access',
        },
        schema: [
            {
                type: "object",
                properties: {
                    aggressive: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            forbidden: "Unsafe global object access '{{ name }}' is forbidden",
        }
    },
    create(context) {
        return {
            'Program:exit'() {
                const tracker = new ReferenceTracker(context.getScope());
                for (const { node, path } of tracker.iterateGlobalReferences(oFns)) {
                    if (node && node.parent && node.parent.type == 'TSTypeReference') continue;
                    context.report({
                        node,
                        messageId: 'forbidden',
                        data: { name: path.join('.') },
                    });
                }
            }
        };
    }
};
