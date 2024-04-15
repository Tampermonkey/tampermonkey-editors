interface I$<T extends Element = Element> extends Omit<Array<T>, 'find'> {
    queryHelper: true,
    append: (...args: (I$ | string | Node | Node[])[]) => I$<T>,
    appendTo: (arg: I$ | string | Node | Node[]) => I$<T>,
    insertBefore: (arg: I$ | string | Node | Node[]) => I$<T>,
    remove: () => I$<T>,
    replaceWith: (arg: I$ | string | Node | Node[]) => I$<T>,
    prevAll: <N extends Element = T>(arg?: string) => I$<N>,
    nextAll: <N extends Element = T>(arg?: string) => I$<N>,
    addClass: (c: string) => I$<T>,
    removeClass: (c: string) => I$<T>,
    toggleClass: (c: string, b?: boolean) => I$<T>,
    hasClass: (c: string) => boolean,
    is: (prop: string) => boolean | undefined,
    attr: <V extends string | number | boolean | null | undefined = undefined>(name: string | { [key: string]: string | number | null }, value?: V) => V extends undefined ? (string | undefined) : I$<T>,
    prop: (name: string | { [key: string]: string | boolean | number | null }, value?: string | number | boolean | null) => string | undefined | I$<T>,
    text: <V extends string | number | null | undefined = undefined>(value?: V) => V extends undefined ? (string | undefined) : I$<T>, /* = undefined necessary du to https://github.com/Microsoft/TypeScript/issues/13995#issuecomment-363265172 */
    html: <V extends string | number | null>(value?: V) => V extends undefined ? string : I$<T>,
    closest: <N extends Element = T>(selector: string) => I$<N>,
    parent: <N extends Element = T>() => I$<N>,
    children: <N extends Element = T>(arg?: string) => I$<N>,
    find: <N extends Element = T>(selector: string) => I$<N>,
    /**
    * @deprecated The method should not be used, use standard forEach instead
    */
    each: (cb: (k: number, v: T) => void) => I$<T>,
    not: (selector: I$ | A$ | string) => I$<T>,
    first: () => I$<T>,
    toArray: () => any[],
    bind: (events: string, cb: (event: Event) => any) => I$<T>,
    unbind: (events: string) => I$<T>,
    value: <V extends string | number | boolean | null | undefined = undefined>(value?: V) => V extends undefined ? (number | string | undefined) : I$<T>,
    data: <V extends string | number | boolean | null | undefined = undefined>(attr: string, value?: V) => V extends undefined ? (string | undefined) : I$<T>,
    offset: () => Omit<DOMRect, 'toJSON'>,
    height: () => number,
    scrollTop: () => number,
    get: (index: number) => T | undefined,
    on: <E extends Event>(events: string, cb: (this: T, e: E) => void) => I$<T>,
    off: <E extends Event>(events: string, cb: (this: T, e: E) => void) => I$<T>,
    trigger: (event: string, parameters?: Record<string, any>) => I$<T>,
    toggle: (visible?: boolean) => I$<T>,
    hide: () => I$<T>,
    fadeOut: (delay?: number) => Promise<I$<T>>,
    show: () => I$<T>,
    fadeIn: (delay?: number) => Promise<I$<T>>,
    animate: (options: { height?: number, scrollTop?: number }, t?: number) =>  Promise<I$<T>>,
    serialize: () => T extends HTMLFormElement ? string : undefined
}

const collectionHas = (a: NodeListOf<Element>, b: Node) => { //helper function (see below)
    for (let i = 0, len = a.length; i < len; i ++) {
        if(a[i] == b) return true;
    }
    return false;
};

const findParentBySelector = (elm: Node, selector: string) => {
    const all = document.querySelectorAll(selector);
    let cur = elm.parentNode;
    while (cur && !collectionHas(all, cur)) { //keep going up until you find a match
        cur = cur.parentNode; //go up
    }
    return cur; //will return null if not found
};

const isNodeElement = (e: any): e is Node => e && e.nodeType !== undefined;
const isHtmlElement = (e: any): e is HTMLElement => e && e.tagName !== undefined;
const isWindow = (e: any): e is Window => e && e.document !== undefined;

const isHtmlInputElement = (e: any): e is HTMLInputElement => e && e.type !== undefined;
const isHtmlFormElement = (e: any): e is HTMLFormElement => e && e.tagName == 'FORM';
const isQueryHelper = (e: any): e is I$ => e && e.queryHelper;

type ExcludeUndefined<T> = T extends undefined ? never : T;
type ReturnValue<T> = T extends undefined ? string | undefined : string;

function stringify<T>(v: T, convertUndefined: true): ReturnValue<T>;
function stringify<T>(v: T, convertUndefined?: false): ExcludeUndefined<ReturnValue<T>>;
function stringify<T>(v: T, convertUndefined?: boolean): ReturnValue<T> | ExcludeUndefined<ReturnValue<T>> {
    return (v === null || (v === undefined && convertUndefined)
        ? ''
        : v === undefined
            ? undefined
            : `${v}`) as ReturnValue<T> | ExcludeUndefined<ReturnValue<T>>;
}

type A$ = Element | Node | Window;

const $ = <T extends Element>(...args: [ undefined | null | string | A$ | A$[] | I$ | I$[] | ((i: any) => any) ] | (string |A$ | I$)[]): I$<T> => {
    const arg = args.length > 1 ? args: args[0];

    if ((<I$>arg)?.queryHelper) return arg as I$<T>;

    if (typeof arg == 'function') {
        if (window.document.readyState != 'loading') {
            (<(i: any) => any>arg)(null);
        } else {
            window.addEventListener('DOMContentLoaded', arg as (i: any) => any);
        }
        return $([]);
    } else if (typeof arg == 'string') {
        const ri = document.querySelectorAll(arg as string);
        const r = [].slice.call(ri);
        return $<T>(r);
    } else if (Array.isArray(arg)) {
        // allow $ objects to be passed to $()
        const a = ([] as A$[]).concat(...(arg as A$[]).map(e => Array.isArray(e) ? e : typeof e === 'string' ? $(e) : [ e ]).filter(e => e));
        const events_map: { [event: string]: ((a: any) => any)[] } = {};
        const r: I$<T> = Object.assign(a as T[], {
            queryHelper: true as const,
            append: (...args: (I$ | string | Node | Node[])[]) => {
                args.forEach(arg => {
                    const e = a[0];
                    if (!isNodeElement(e)) return;
                    $(arg).forEach(i => e.appendChild($(i)[0]));
                });
                return $<T>(a);
            },
            appendTo: (arg: I$ | string | Node | Node[]) => {
                const t = $(arg);
                a.filter(isNodeElement).forEach(i => t.append(i));
                return $<T>(a);
            },
            insertBefore: (arg: I$ | string | Node | Node[]) => {
                const r = [ ...a ];
                if (a.length) {
                    const b = $(arg)[0];
                    const p = b?.parentNode;
                    if (p) {
                        a.forEach(i => {
                            const n = $(i)[0];
                            if (!n) return;
                            p.insertBefore(n, b);
                            r.push(n as any);
                        });
                    }
                }
                return $<T>(r);
            },
            remove: () => {
                a.filter(isNodeElement).forEach(e => e.parentNode?.removeChild(e));
                return $<T>([]);
            },
            replaceWith: (arg: I$ | string | Node | Node[] | Element | Element[]) => {
                const t = a[0];
                if (t) {
                    const e = isQueryHelper(t) ? t[0] : t;
                    const is = $(arg);
                    const i = is.shift();
                    if (i !== undefined && isHtmlElement(e)) {
                        e.replaceWith(i);
                        is.forEach(n => {
                            i.parentNode?.insertBefore(n, i.nextSibling);
                        });
                    }
                    return $<T>(e);
                }
                return $<T>(a);
            },
            prevAll: <N extends Element = T>(arg?: string): I$<N> => {
                const e = a[0];
                if (!e) return $([]);

                const c = $(e).parent()?.children(arg);
                if (!c || !c.length) return $([]);

                const r: Element[] = [];
                for (let i = 0; i < c.length; i++) {
                    const ce = c[i];
                    if (ce == e) break;
                    r.push(ce);
                }
                return $<N>(r.reverse());
            },
            nextAll: <N extends Element = T>(arg?: string): I$<N> => {
                const e = a[0];
                if (!e) return $([]);

                const c = $(e).parent()?.children(arg);
                if (!c || !c.length) return $([]);

                const r: Element[] = [];
                let start = false;
                for (let i = 0; i < c.length; i++) {
                    const ce = c[i];
                    if (start) r.push(ce);
                    if (ce == e) start = true;
                }
                return $<N>(r);
            },
            addClass: (c: string) => {
                const cs = c.trim().split(' ');
                a.filter(isHtmlElement).forEach(e => cs.forEach(c => e.classList.add(c)));
                return $<T>(a);
            },
            removeClass: (c: string) => {
                const cs = c.trim().split(' ');
                a.filter(isHtmlElement).forEach(e => cs.forEach(c => e.classList.remove(c)));
                return $<T>(a);
            },
            toggleClass: (c: string, b?: boolean) => {
                const cs = c.trim().split(' ');
                cs.forEach(c => {
                    if (b === true) {
                        r.addClass(c);
                    } else if (b === false) {
                        r.removeClass(c);
                    } else {
                        a.filter(isHtmlElement).forEach(e => e.classList.toggle(c));
                    }
                });
                return $<T>(a);
            },
            hasClass: (c: string): boolean => {
                return !!a.filter(e => isHtmlElement(e) && e.classList.contains(c)).length;
            },
            is: (prop: string) => {
                const e = a[0];
                if (!e || !isHtmlElement(e)) return undefined;

                if (prop == ':visible') {
                    return window.getComputedStyle(e).display !== 'none';
                } else if (prop == ':checked') {
                    return (e as HTMLInputElement).checked == true;
                }
            },
            attr: <V extends string | number | boolean | null | undefined = undefined>(name: string | { [key: string]: string | number | null }, value?: V) : V extends undefined ? (string | undefined) : I$<T> => {
                if (a.length) {
                    const set = (name: string, value: string | number | boolean | null): void => {
                        if (value === null) {
                            a.filter(isHtmlElement).forEach(e => e.removeAttribute(name));
                        } else {
                            a.filter(isHtmlElement).forEach(e => e.setAttribute(name, value.toString()));
                        }
                    };

                    if (typeof name === 'string') {
                        if (value === undefined) {
                            const e = a[0];
                            return isHtmlElement(e) && e.getAttribute(name) || undefined as any;
                        } else {
                            set(name, value);
                        }
                    } else {
                        for (const k of Object.keys(name)) {
                            set(k, name[k]);
                        }
                    }
                }
                return $<T>(a) as any;
            },
            prop: (name: string | { [key: string]: string | number | boolean | null }, value?: string | number | boolean | null): string | undefined | I$<T> => {
                if (a.length) {
                    const set = (name: string, value: string | number | boolean | null): void => {
                        if (value === null) {
                            a.filter(isHtmlElement).forEach(e => {
                                delete (e as any)[name];
                                e.removeAttribute(name);
                            });
                        } else {
                            a.forEach(e => (e as any)[name] = value);
                        }
                    };

                    if (typeof name === 'string') {
                        if (value === undefined) {
                            return (a[0] as any)[name];
                        } else {
                            set(name, value);
                        }
                    } else {
                        for (const k of Object.keys(name)) {
                            set(k, name[k]);
                        }
                    }
                }
                return $<T>(a);
            },
            text: <V extends string | number | null | undefined = undefined>(value?: V) : V extends undefined ? (string | undefined): I$<T> => {
                if (value === undefined) {
                    if (a.length) {
                        return a.filter(isHtmlElement).map(e => e.innerText).join('') as any;
                    }
                    return undefined as any;
                } else {
                    if (a.length && value != null) a.filter(isHtmlElement).forEach(e => e.innerText = stringify(value));
                    return $<T>(a) as any;
                }
            },
            html: <V extends string | number | null>(value?: V): V extends undefined ? string : I$<T>  => {
                if (a.length) {
                    if (value === undefined) {
                        return a.filter(isHtmlElement).map(e => e.innerHTML).join('') as any;
                    } else {
                        a.filter(isHtmlElement).forEach(e => e.innerHTML = stringify(value));
                    }
                }
                return $<T>(a) as any;
            },
            closest: <N extends Element = T>(selector: string) => {
                if (a.length) {
                    const e = a[0];

                    const r = isHtmlElement(e) && findParentBySelector(e, selector);
                    if (r) {
                        return $<N>(r);
                    }
                }

                return $<N>([]);
            },
            parent: <N extends Element = T>() => {
                const e = a[0];
                if (isHtmlElement(e)) {
                    return $<N>(e.parentNode);
                }
                return $<N>([]);
            },
            children: <N extends Element = T>(arg?: string) => {
                const e = a[0];
                if (isHtmlElement(e)) {
                    if (arg) {
                        if (e.querySelectorAll) {
                            const ri = e.querySelectorAll(arg);
                            return $<N>([].slice.call(ri));
                        }
                    } else if (e.children) {
                        return $<N>([].slice.call(e.children));
                    }
                }
                return $<N>([]);
            },
            find: <N extends Element = T>(selector: string): I$ => {
                let r: any[] = [];
                a.forEach(e => {
                    $(e).children(selector).forEach((c: Node) => {
                        const childs = $(c).find(selector).toArray();
                        r = [ ...r, c, ...childs ];
                    });
                });
                return $<N>(r);
            },
            each: (cb: (k: number, v: T) => void) => {
                (a as any[]).forEach((v: T, k) => cb(k, v));
                return $<T>(a);
            },
            not: (selector: I$<any> | A$ | string): I$<T> => {
                const s = $(selector);
                return $<T>(a.filter(e => s.indexOf($<any>(e)[0]) === -1));
            },
            first: (): I$<T> => {
                return $<T>(a.slice(0, 1));
            },
            toArray: () => [ ...a ],
            bind: (events: string, cb: (event: Event) => any): I$<T> => {
                events.split(' ').forEach(event => {
                    (events_map[event] ||= []).push(cb);
                    a.forEach(e => e.addEventListener(event, cb));
                });
                return $<T>(a);
            },
            unbind: (events: string): I$<T> => {
                events.split(' ').forEach(event => {
                    if (events_map[event]) {
                        events_map[event].forEach(cb => {
                            a.forEach(elem => {
                                elem.removeEventListener(event, cb);
                            });
                        });
                        events_map[event] = [];
                    }
                });
                return $<T>(a);
            },
            value: <V extends string | number | boolean | null | undefined = undefined>(value?: V) : V extends undefined ? (number | string | undefined) : I$<T> => {
                if (value === undefined)  {
                    let v: any;
                    a.reverse().some((e: any) => {
                        if (e.disabled) return;
                        if (e.type == 'checkbox') {
                            if (e.checked == true) {
                                v = e.value;
                                return true;
                            }
                        } else {
                            v = e.value;
                            return true;
                        }
                    });
                    return v;
                } else {
                    const e: any = a.length ? a[a.length - 1] : undefined;
                    if (e) {
                        if (e.type == 'checkbox') {
                            if (e.value == value) e.checked = true;
                        } else if (e.type == 'select-one') {
                            e.value = stringify(value);
                        } else {
                            if (isHtmlInputElement(e) && e.type == 'text') {
                                e.value = stringify(value);
                            }
                            e.setAttribute('value', stringify(value));
                        }
                    }
                    return $<T>(a) as any;
                }
            },
            data: <V extends string | number | boolean | null | undefined = undefined>(attr: string, value?: V) : V extends undefined ? (string | undefined) : I$<T> => {
                const e = a[0];
                if (!isHtmlElement(e) || !e.dataset) return value === undefined ? $<T>(a) : undefined as any;

                if (value === undefined) {
                    return e.dataset[attr] as any;
                } else {
                    if (value === null) {
                        delete e.dataset[attr];
                    } else {
                        e.dataset[attr] = stringify(value);
                    }
                    return $<T>(a) as any;
                }
            },
            offset: (): Omit<DOMRect, 'toJSON'> => {
                const e = a[0];
                return isHtmlElement(e) && e?.getBoundingClientRect() || { left: -1, top: -1, right: -1 , bottom: -1, x: -1, y: -1, height: -1, width: -1 };
            },
            height: (): number => {
                const e = a[0] as HTMLElement | Window | undefined;
                if (!e) return 0;
                return (isWindow(e) ? window.innerHeight : e.offsetHeight) || 0;
            },
            scrollTop: (): number => {
                const e = a[0] as any;
                if (!e) return 0;
                return e.scrollTop || e.pageYOffset || 0;
            },
            get: (index: number): T | undefined => {
                return (a as any)[index];
            },
            on: <E extends Event>(events: string, cb: (e: E) => void) => {
                events.split(' ').forEach(event => a.forEach(e => e?.addEventListener(event as any, cb as any)));
                return $<T>(a);
            },
            off: <E extends Event>(events: string, cb: (e: E) => void) => {
                events.split(' ').forEach(event => a.forEach(e => e?.removeEventListener(event as any, cb as any)));
                return $<T>(a);
            },
            trigger: (event: string, parameters?: Record<string, any>) => {
                const evt = new Event(event, { bubbles: true, cancelable: true });
                if (parameters) Object.assign(evt, parameters);
                a.forEach(e => {
                    if ([ 'focus', 'blur' ].includes(event)) {
                        const f = (e as any)[event];
                        if (typeof f == 'function') f.apply(e, []);
                    }
                    e.dispatchEvent(evt);
                });
                return $<T>(a);
            },
            toggle: (visible?: boolean) => {
                a.forEach(e => {
                    const l = $(e);
                    const v = visible === undefined ? l.is(':visible') : !visible;
                    if (v) {
                        l.hide();
                    } else {
                        l.show();
                    }
                });
                return $<T>(a);
            },
            hide: () => {
                a.filter(isHtmlElement).forEach(e => {
                    const s = e?.style?.display;
                    if (s && s.indexOf('none') == -1) (e as any).backuped_display = s;
                    $(e).attr('style', 'display: none !important');
                });
                return $<T>(a);
            },
            fadeOut: async (delay?: number) => {
                return new Promise<I$<T>>((resolve) => {
                    a.filter(isHtmlElement).forEach(e => {
                        e.style.opacity = '1';
                        e.style.transition = `opacity ${delay || 150}ms`;

                        setTimeout(() => {
                            e.style.opacity = '0';
                        }, 1);
                    });
                    setTimeout(() => {
                        a.filter(isHtmlElement).forEach(e => {
                            e.style.transition = '';
                            e.style.opacity = '';
                        });
                        r.hide();
                        resolve($<T>(a));
                    }, (delay || 150) + 1);
                });
            },
            show: () => {
                a.filter(isHtmlElement).forEach(e => {
                    e.style.display = (e as any).backuped_display || '';
                });
                return $<T>(a);
            },
            fadeIn: async (delay?: number) => {
                return new Promise<I$<T>>((resolve) => {
                    a.filter(isHtmlElement).forEach(e => {
                        e.style.opacity = '0';
                        e.style.transition = `opacity ${delay || 150}ms`;

                        setTimeout(() => {
                            e.style.opacity = '1';
                        }, 1);
                    });
                    r.show();
                    setTimeout(() => {
                        a.filter(isHtmlElement).forEach(e => {
                            e.style.transition = '';
                            e.style.opacity = '';
                        });
                        resolve($<T>(a));
                    }, (delay || 150) + 1);
                });
            },
            animate: (options: { height?: number, scrollTop?: number }, t?: number) => {
                return new Promise<I$<T>>((resolve) => {
                    const e = a[0] as any;
                    if (e.current_action) window.clearInterval(e.current_action);
                    const scrollSteps = 3;

                    e.current_action = window.setInterval(() => {
                        if (options.scrollTop !== undefined) {
                            const se = ((e as Window) === window ? document.documentElement : e);
                            const old = se.scrollTop;
                            if (se.scrollTop < options.scrollTop) {
                                se.scrollTop = se.scrollTop + scrollSteps;
                            } else {
                                se.scrollTop = se.scrollTop - scrollSteps;
                            }

                            if (se.scrollTop === old || Math.abs(se.scrollTop - options.scrollTop) <= scrollSteps) {
                                se.scrollTop = options.scrollTop;
                                window.clearInterval(e.current_action);
                                delete e.current_action;

                                resolve($<T>(a));
                            }

                            window.getComputedStyle(se);
                        } else {
                            a.forEach(e => {
                                if (options.height !== undefined) {
                                    const r = $(e).get(0) as HTMLElement | undefined;
                                    if (r && r.style) r.style.height = `${options.height}px`;
                                }
                            });

                            resolve($<T>(a));
                        }
                    }, t === undefined ? 100 : t);
                });
            },
            serialize: (): T extends HTMLFormElement ? string : undefined => {
                if (a.length == 1 && isHtmlFormElement(a[0])) {
                    return $(a[0]).find<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement>('input, textarea, select, button').map(e => {
                        const n = e.name;
                        const v = $(e).value();
                        if (typeof n === 'string' && typeof v === 'string') {
                            return `${n}=${encodeURIComponent(v)}`;
                        }
                    })
                    .filter((e): e is string => typeof e === 'string')
                    .join('&') as any;
                }
                return undefined as any;
            }
        });

        return r;
    } else if (arg === undefined || arg == null) {
        return $([]);
    }

    return $<T>([ arg as Element ]);
};

export { $, I$ };