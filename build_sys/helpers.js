/* global module */
export const getWebpackDefineVariables = (browser, manifest, is_background, rnd) => {
    return {
        'process.env.IS_CHROME': JSON.stringify(browser == 'chrome' || browser == 'opera'),
        'process.env.IS_FIREFOX': JSON.stringify(browser == 'firefox'),
        'process.env.IS_MV3': JSON.stringify(true),
        'process.env.IS_EVENTPAGE': JSON.stringify(manifest == 'mv3ep'),
        'process.env.IS_BACKGROUND': JSON.stringify(is_background),
        'process.env.COMM_ID': JSON.stringify(rnd.toString(36).substr(2, 5))
    };
};