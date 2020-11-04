
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    const hiragana = [
        { character: "あ",   answer: "a" },
        { character: "い",   answer: "i" },
        { character: "う",   answer: "u" },
        { character: "え",   answer: "e" },
        { character: "お",   answer: "o" },

        { character: "か",   answer: "ka" },
        { character: "き",   answer: "ki" },
        { character: "く",   answer: "ku" },
        { character: "け",   answer: "ke" },
        { character: "こ",   answer: "ko" },

        { character: "さ",   answer: "sa" },
        { character: "し",   answer: "shi" },
        { character: "す",   answer: "su" },
        { character: "せ",   answer: "se" },
        { character: "そ",   answer: "so" },

        { character: "た",   answer: "ta" },
        { character: "ち",   answer: "chi" },
        { character: "つ",   answer: "tsu" },
        { character: "て",   answer: "te" },
        { character: "と",   answer: "to" },

        { character: "な",   answer: "na" },
        { character: "に",   answer: "ni" },
        { character: "ぬ",   answer: "nu" },
        { character: "ね",   answer: "ne" },
        { character: "の",   answer: "no" },

        { character: "は",   answer: "ha" },
        { character: "ひ",   answer: "hi" },
        { character: "ふ",   answer: "fu" },
        { character: "へ",   answer: "he" },
        { character: "ほ",   answer: "ho" },

        { character: "ま",   answer: "ma" },
        { character: "み",   answer: "mi" },
        { character: "む",   answer: "mu" },
        { character: "め",   answer: "me" },
        { character: "も",   answer: "mo" },

        { character: "や",   answer: "ya" },
        { character: "ゆ",   answer: "yu" },
        { character: "よ",   answer: "yo" },

        { character: "ら",   answer: "ra" },
        { character: "り",   answer: "ri" },
        { character: "る",   answer: "ru" },
        { character: "れ",   answer: "re" },
        { character: "ろ",   answer: "ro" },

        { character: "わ",   answer: "wa" },
        { character: "を",   answer: "wo" },

        { character: "ん",   answer: "n" },
    ];

    const katakana = [
        { character: "ア",   answer: "a" },
        { character: "イ",   answer: "i" },
        { character: "ウ",   answer: "u" },
        { character: "エ",   answer: "e" },
        { character: "オ",   answer: "o" },

        { character: "カ",   answer: "ka" },
        { character: "キ",   answer: "ki" },
        { character: "ク",   answer: "ku" },
        { character: "ケ",   answer: "ke" },
        { character: "コ",   answer: "ko" },

        { character: "サ",   answer: "sa" },
        { character: "シ",   answer: "shi" },
        { character: "ス",   answer: "su" },
        { character: "セ",   answer: "se" },
        { character: "ソ",   answer: "so" },

        { character: "タ",   answer: "ta" },
        { character: "チ",   answer: "chi" },
        { character: "ツ",   answer: "tsu" },
        { character: "テ",   answer: "te" },
        { character: "ト",   answer: "to" },

        { character: "ナ",   answer: "na" },
        { character: "ニ",   answer: "ni" },
        { character: "ヌ",   answer: "nu" },
        { character: "ネ",   answer: "ne" },
        { character: "ノ",   answer: "no" },

        { character: "ハ",   answer: "ha" },
        { character: "ヒ",   answer: "hi" },
        { character: "フ",   answer: "fu" },
        { character: "ヘ",   answer: "he" },
        { character: "ホ",   answer: "ho" },

        { character: "マ",   answer: "ma" },
        { character: "ミ",   answer: "mi" },
        { character: "ム",   answer: "mu" },
        { character: "メ",   answer: "me" },
        { character: "モ",   answer: "mo" },

        { character: "ヤ",   answer: "ya" },
        { character: "ユ",   answer: "yu" },
        { character: "ヨ",   answer: "yo" },

        { character: "ラ",   answer: "ra" },
        { character: "リ",   answer: "ri" },
        { character: "ル",   answer: "ru" },
        { character: "レ",   answer: "re" },
        { character: "ロ",   answer: "ro" },

        { character: "ワ",   answer: "wa" },
        { character: "ヲ",   answer: "wo" },

        { character: "ン",   answer: "n" },
    ];

    const hiraganaAccent = [
        { character: "が",   answer: "ga" },
        { character: "ぎ",   answer: "gi" },
        { character: "ぐ",   answer: "gu" },
        { character: "げ",   answer: "ge" },
        { character: "ご",   answer: "go" },

        { character: "ざ",   answer: "za" },
        { character: "じ",   answer: "ji" },
        { character: "ず",   answer: "zu" },
        { character: "ぜ",   answer: "ze" },
        { character: "ぞ",   answer: "zo" },

        { character: "だ",   answer: "da" },
        { character: "ぢ",   answer: "ji" },
        { character: "づ",   answer: "zu" },
        { character: "で",   answer: "de" },
        { character: "ど",   answer: "do" },

        { character: "ば",   answer: "ba" },
        { character: "び",   answer: "bi" },
        { character: "ぶ",   answer: "bu" },
        { character: "べ",   answer: "be" },
        { character: "ぼ",   answer: "bo" },

        { character: "ぱ",   answer: "pa" },
        { character: "ぴ",   answer: "pi" },
        { character: "ぷ",   answer: "pu" },
        { character: "ぺ",   answer: "pe" },
        { character: "ぽ",   answer: "po" },
    ];

    const katakanaAccent = [
        { character: "ガ",   answer: "ga" },
        { character: "ギ",   answer: "gi" },
        { character: "グ",   answer: "gu" },
        { character: "ゲ",   answer: "ge" },
        { character: "ゴ",   answer: "go" },

        { character: "ザ",   answer: "za" },
        { character: "ジ",   answer: "ji" },
        { character: "ズ",   answer: "zu" },
        { character: "ゼ",   answer: "ze" },
        { character: "ゾ",   answer: "zo" },

        { character: "ダ",   answer: "da" },
        { character: "ヂ",   answer: "ji" },
        { character: "ヅ",   answer: "zu" },
        { character: "デ",   answer: "de" },
        { character: "ド",   answer: "do" },

        { character: "バ",   answer: "ba" },
        { character: "ビ",   answer: "bi" },
        { character: "ブ",   answer: "bu" },
        { character: "ベ",   answer: "be" },
        { character: "ボ",   answer: "bo" },

        { character: "パ",   answer: "pa" },
        { character: "ピ",   answer: "pi" },
        { character: "プ",   answer: "pu" },
        { character: "ペ",   answer: "pe" },
        { character: "ポ",   answer: "po" },
    ];

    var kana = {
        hiragana,
        hiraganaAccent,

        katakana,
        katakanaAccent,
    };

    /* src/components/SlideText.svelte generated by Svelte v3.29.4 */
    const file = "src/components/SlideText.svelte";

    // (9:0) {:else}
    function create_else_block(ctx) {
    	let h1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			if (default_slot) default_slot.c();
    			attr_dev(h1, "class", "svelte-1ktbt9n");
    			add_location(h1, file, 9, 0, 163);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);

    			if (default_slot) {
    				default_slot.m(h1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(9:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:0) {#if shouldSlide}
    function create_if_block(ctx) {
    	let h1;
    	let h1_transition;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			if (default_slot) default_slot.c();
    			attr_dev(h1, "class", "svelte-1ktbt9n");
    			add_location(h1, file, 7, 0, 121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);

    			if (default_slot) {
    				default_slot.m(h1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!h1_transition) h1_transition = create_bidirectional_transition(h1, slide, {}, true);
    				h1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!h1_transition) h1_transition = create_bidirectional_transition(h1, slide, {}, false);
    			h1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && h1_transition) h1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(7:0) {#if shouldSlide}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*shouldSlide*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SlideText", slots, ['default']);
    	let { shouldSlide = true } = $$props;
    	const writable_props = ["shouldSlide"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SlideText> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("shouldSlide" in $$props) $$invalidate(0, shouldSlide = $$props.shouldSlide);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ slide, shouldSlide });

    	$$self.$inject_state = $$props => {
    		if ("shouldSlide" in $$props) $$invalidate(0, shouldSlide = $$props.shouldSlide);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [shouldSlide, $$scope, slots];
    }

    class SlideText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { shouldSlide: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SlideText",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get shouldSlide() {
    		throw new Error("<SlideText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldSlide(value) {
    		throw new Error("<SlideText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Answer.svelte generated by Svelte v3.29.4 */
    const file$1 = "src/components/Answer.svelte";

    // (15:0) {:else}
    function create_else_block_1(ctx) {
    	let h1;
    	let h1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Your previous answers are displayed here.";
    			attr_dev(h1, "class", "svelte-1ktbt9n");
    			add_location(h1, file$1, 15, 4, 420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			if (h1_outro) h1_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			h1_outro = create_out_transition(h1, slide, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching && h1_outro) h1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(15:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (9:0) {#if answer}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*answer*/ ctx[0].isCorrect) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(9:0) {#if answer}",
    		ctx
    	});

    	return block;
    }

    // (12:4) {:else}
    function create_else_block$1(ctx) {
    	let slidetext;
    	let current;

    	slidetext = new SlideText({
    			props: {
    				shouldSlide: /*animate*/ ctx[1],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(slidetext.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(slidetext, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slidetext_changes = {};
    			if (dirty & /*animate*/ 2) slidetext_changes.shouldSlide = /*animate*/ ctx[1];

    			if (dirty & /*$$scope, answer*/ 5) {
    				slidetext_changes.$$scope = { dirty, ctx };
    			}

    			slidetext.$set(slidetext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidetext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slidetext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(slidetext, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(12:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if answer.isCorrect}
    function create_if_block_1(ctx) {
    	let slidetext;
    	let current;

    	slidetext = new SlideText({
    			props: {
    				shouldSlide: /*animate*/ ctx[1],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(slidetext.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(slidetext, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slidetext_changes = {};
    			if (dirty & /*animate*/ 2) slidetext_changes.shouldSlide = /*animate*/ ctx[1];

    			if (dirty & /*$$scope, answer*/ 5) {
    				slidetext_changes.$$scope = { dirty, ctx };
    			}

    			slidetext.$set(slidetext_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidetext.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slidetext.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(slidetext, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(10:4) {#if answer.isCorrect}",
    		ctx
    	});

    	return block;
    }

    // (13:4) <SlideText shouldSlide={animate}>
    function create_default_slot_1(ctx) {
    	let t0_value = /*answer*/ ctx[0].kana + "";
    	let t0;
    	let t1;
    	let t2_value = /*answer*/ ctx[0].userInput + "";
    	let t2;
    	let t3;
    	let t4_value = /*answer*/ ctx[0].correctAnswer + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" ≠ ");
    			t2 = text(t2_value);
    			t3 = text(" ❌ 『");
    			t4 = text(t4_value);
    			t5 = text("』");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answer*/ 1 && t0_value !== (t0_value = /*answer*/ ctx[0].kana + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*answer*/ 1 && t2_value !== (t2_value = /*answer*/ ctx[0].userInput + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*answer*/ 1 && t4_value !== (t4_value = /*answer*/ ctx[0].correctAnswer + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(13:4) <SlideText shouldSlide={animate}>",
    		ctx
    	});

    	return block;
    }

    // (11:4) <SlideText shouldSlide={animate}>
    function create_default_slot(ctx) {
    	let t0_value = /*answer*/ ctx[0].kana + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" ✔");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answer*/ 1 && t0_value !== (t0_value = /*answer*/ ctx[0].kana + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(11:4) <SlideText shouldSlide={animate}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*answer*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Answer", slots, []);
    	let { answer } = $$props;
    	let { animate = true } = $$props;
    	const writable_props = ["answer", "animate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Answer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("answer" in $$props) $$invalidate(0, answer = $$props.answer);
    		if ("animate" in $$props) $$invalidate(1, animate = $$props.animate);
    	};

    	$$self.$capture_state = () => ({ slide, SlideText, answer, animate });

    	$$self.$inject_state = $$props => {
    		if ("answer" in $$props) $$invalidate(0, answer = $$props.answer);
    		if ("animate" in $$props) $$invalidate(1, animate = $$props.animate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [answer, animate];
    }

    class Answer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { answer: 0, animate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Answer",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*answer*/ ctx[0] === undefined && !("answer" in props)) {
    			console.warn("<Answer> was created without expected prop 'answer'");
    		}
    	}

    	get answer() {
    		throw new Error("<Answer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set answer(value) {
    		throw new Error("<Answer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animate() {
    		throw new Error("<Answer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animate(value) {
    		throw new Error("<Answer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/History.svelte generated by Svelte v3.29.4 */
    const file$2 = "src/components/History.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (13:0) {#if data.length > 1}
    function create_if_block_1$1(ctx) {
    	let button;
    	let t_value = (/*hidden*/ ctx[1] ? "詳細「しょうさい」" : "隠す「かくす」") + "";
    	let t;
    	let button_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "svelte-3kfehn");
    			add_location(button, file$2, 13, 0, 246);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*hidden*/ 2) && t_value !== (t_value = (/*hidden*/ ctx[1] ? "詳細「しょうさい」" : "隠す「かくす」") + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!button_transition) button_transition = create_bidirectional_transition(button, slide, {}, true);
    				button_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!button_transition) button_transition = create_bidirectional_transition(button, slide, {}, false);
    			button_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching && button_transition) button_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(13:0) {#if data.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (20:0) {#if !hidden}
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*rest*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rest*/ 8) {
    				each_value = /*rest*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(20:0) {#if !hidden}",
    		ctx
    	});

    	return block;
    }

    // (21:0) {#each rest as answer}
    function create_each_block(ctx) {
    	let answer;
    	let current;

    	answer = new Answer({
    			props: {
    				animate: false,
    				answer: /*answer*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(answer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(answer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const answer_changes = {};
    			if (dirty & /*rest*/ 8) answer_changes.answer = /*answer*/ ctx[5];
    			answer.$set(answer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(answer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(answer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(answer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(21:0) {#each rest as answer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let answer;
    	let t0;
    	let t1;
    	let if_block1_anchor;
    	let current;

    	answer = new Answer({
    			props: { answer: /*lastAnswer*/ ctx[2] },
    			$$inline: true
    		});

    	let if_block0 = /*data*/ ctx[0].length > 1 && create_if_block_1$1(ctx);
    	let if_block1 = !/*hidden*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			create_component(answer.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(answer, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const answer_changes = {};
    			if (dirty & /*lastAnswer*/ 4) answer_changes.answer = /*lastAnswer*/ ctx[2];
    			answer.$set(answer_changes);

    			if (/*data*/ ctx[0].length > 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*data*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*hidden*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*hidden*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(answer.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(answer.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(answer, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("History", slots, []);
    	let { data } = $$props;
    	let hidden = true;
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<History> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, hidden = !hidden);

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		Answer,
    		data,
    		hidden,
    		lastAnswer,
    		rest
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("hidden" in $$props) $$invalidate(1, hidden = $$props.hidden);
    		if ("lastAnswer" in $$props) $$invalidate(2, lastAnswer = $$props.lastAnswer);
    		if ("rest" in $$props) $$invalidate(3, rest = $$props.rest);
    	};

    	let lastAnswer;
    	let rest;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 1) {
    			 $$invalidate(2, [lastAnswer, ...rest] = data, lastAnswer, ($$invalidate(3, rest), $$invalidate(0, data)));
    		}
    	};

    	return [data, hidden, lastAnswer, rest, click_handler];
    }

    class History extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "History",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<History> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<History>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<History>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Quizz.svelte generated by Svelte v3.29.4 */
    const file$3 = "src/components/Quizz.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (45:0) {#if showHint}
    function create_if_block$3(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*correctAnswer*/ ctx[2] instanceof Array) return create_if_block_1$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "quizz__hint svelte-1v6tse3");
    			add_location(div, file$3, 45, 0, 1089);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, scale, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, scale, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(45:0) {#if showHint}",
    		ctx
    	});

    	return block;
    }

    // (53:4) {:else}
    function create_else_block$2(ctx) {
    	let h1;
    	let t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text(/*correctAnswer*/ ctx[2]);
    			add_location(h1, file$3, 53, 4, 1306);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*correctAnswer*/ 4) set_data_dev(t, /*correctAnswer*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(53:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if correctAnswer instanceof Array}
    function create_if_block_1$2(ctx) {
    	let ul;
    	let each_value = /*correctAnswer*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$3, 47, 4, 1177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*correctAnswer*/ 4) {
    				each_value = /*correctAnswer*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(47:4) {#if correctAnswer instanceof Array}",
    		ctx
    	});

    	return block;
    }

    // (49:8) {#each correctAnswer as answer}
    function create_each_block$1(ctx) {
    	let li;
    	let h1;
    	let t0;
    	let t1_value = /*answer*/ ctx[12] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			h1 = element("h1");
    			t0 = text("\b• ");
    			t1 = text(t1_value);
    			add_location(h1, file$3, 49, 16, 1238);
    			add_location(li, file$3, 49, 12, 1234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*correctAnswer*/ 4 && t1_value !== (t1_value = /*answer*/ ctx[12] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(49:8) {#each correctAnswer as answer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let t0;
    	let h1;
    	let t1;
    	let t2;
    	let article;
    	let h2;
    	let t3;
    	let t4;
    	let form;
    	let input_1;
    	let t5;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*showHint*/ ctx[4] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(/*heading*/ ctx[0]);
    			t2 = space();
    			article = element("article");
    			h2 = element("h2");
    			t3 = text(/*kana*/ ctx[1]);
    			t4 = space();
    			form = element("form");
    			input_1 = element("input");
    			t5 = space();
    			button = element("button");
    			button.textContent = "次「つぎ」";
    			attr_dev(h1, "class", "quizz__heading svelte-1v6tse3");
    			add_location(h1, file$3, 57, 0, 1354);
    			attr_dev(h2, "class", "quizz__kana svelte-1v6tse3");
    			add_location(h2, file$3, 59, 4, 1424);
    			attr_dev(input_1, "class", "quizz__input");
    			attr_dev(input_1, "type", "text");
    			input_1.value = /*userInput*/ ctx[3];
    			add_location(input_1, file$3, 61, 8, 1565);
    			attr_dev(button, "class", "quizz__button svelte-1v6tse3");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$3, 62, 8, 1674);
    			attr_dev(form, "class", "quizz__form svelte-1v6tse3");
    			add_location(form, file$3, 60, 4, 1490);
    			attr_dev(article, "class", "quizz svelte-1v6tse3");
    			add_location(article, file$3, 58, 0, 1396);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, article, anchor);
    			append_dev(article, h2);
    			append_dev(h2, t3);
    			append_dev(article, t4);
    			append_dev(article, form);
    			append_dev(form, input_1);
    			/*input_1_binding*/ ctx[10](input_1);
    			append_dev(form, t5);
    			append_dev(form, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(h2, "click", /*handleShowHint*/ ctx[8], false, false, false),
    					listen_dev(input_1, "input", /*handleChange*/ ctx[7], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showHint*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showHint*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*heading*/ 1) set_data_dev(t1, /*heading*/ ctx[0]);
    			if (!current || dirty & /*kana*/ 2) set_data_dev(t3, /*kana*/ ctx[1]);

    			if (!current || dirty & /*userInput*/ 8 && input_1.value !== /*userInput*/ ctx[3]) {
    				prop_dev(input_1, "value", /*userInput*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(article);
    			/*input_1_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Quizz", slots, []);
    	const dispatch = createEventDispatcher();
    	let { heading = "ひらがな" } = $$props;
    	let { shouldFilter = true } = $$props;
    	let { kana } = $$props;
    	let { correctAnswer } = $$props;
    	let userInput = "";
    	let showHint = false;
    	let input = null;

    	const handleSubmit = () => {
    		if (!userInput) return;
    		const result = { userInput, kana, correctAnswer };
    		if (correctAnswer instanceof Array) result.isCorrect = correctAnswer.includes(userInput); else result.isCorrect = userInput === correctAnswer;
    		dispatch("answer", result);
    		$$invalidate(3, userInput = "");
    		$$invalidate(4, showHint = false);
    	};

    	const handleChange = e => {
    		$$invalidate(3, userInput = e.target.value.trim());
    		if (shouldFilter) $$invalidate(3, userInput = userInput.replace(/[^A-Za-z]/g, ""));
    	};

    	const handleShowHint = () => $$invalidate(4, showHint = !showHint);
    	const writable_props = ["heading", "shouldFilter", "kana", "correctAnswer"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Quizz> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(5, input);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    		if ("shouldFilter" in $$props) $$invalidate(9, shouldFilter = $$props.shouldFilter);
    		if ("kana" in $$props) $$invalidate(1, kana = $$props.kana);
    		if ("correctAnswer" in $$props) $$invalidate(2, correctAnswer = $$props.correctAnswer);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		scale,
    		dispatch,
    		heading,
    		shouldFilter,
    		kana,
    		correctAnswer,
    		userInput,
    		showHint,
    		input,
    		handleSubmit,
    		handleChange,
    		handleShowHint
    	});

    	$$self.$inject_state = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    		if ("shouldFilter" in $$props) $$invalidate(9, shouldFilter = $$props.shouldFilter);
    		if ("kana" in $$props) $$invalidate(1, kana = $$props.kana);
    		if ("correctAnswer" in $$props) $$invalidate(2, correctAnswer = $$props.correctAnswer);
    		if ("userInput" in $$props) $$invalidate(3, userInput = $$props.userInput);
    		if ("showHint" in $$props) $$invalidate(4, showHint = $$props.showHint);
    		if ("input" in $$props) $$invalidate(5, input = $$props.input);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*input, showHint*/ 48) {
    			 {
    				if (input && showHint === false) input.focus();
    			}
    		}
    	};

    	return [
    		heading,
    		kana,
    		correctAnswer,
    		userInput,
    		showHint,
    		input,
    		handleSubmit,
    		handleChange,
    		handleShowHint,
    		shouldFilter,
    		input_1_binding
    	];
    }

    class Quizz extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			heading: 0,
    			shouldFilter: 9,
    			kana: 1,
    			correctAnswer: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quizz",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*kana*/ ctx[1] === undefined && !("kana" in props)) {
    			console.warn("<Quizz> was created without expected prop 'kana'");
    		}

    		if (/*correctAnswer*/ ctx[2] === undefined && !("correctAnswer" in props)) {
    			console.warn("<Quizz> was created without expected prop 'correctAnswer'");
    		}
    	}

    	get heading() {
    		throw new Error("<Quizz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set heading(value) {
    		throw new Error("<Quizz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shouldFilter() {
    		throw new Error("<Quizz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldFilter(value) {
    		throw new Error("<Quizz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get kana() {
    		throw new Error("<Quizz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set kana(value) {
    		throw new Error("<Quizz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get correctAnswer() {
    		throw new Error("<Quizz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set correctAnswer(value) {
    		throw new Error("<Quizz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Score.svelte generated by Svelte v3.29.4 */

    const file$4 = "src/components/Score.svelte";

    function create_fragment$4(ctx) {
    	let h1;
    	let span0;
    	let t0;
    	let t1;
    	let span1;
    	let t2;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			span0 = element("span");
    			t0 = text(/*winCount*/ ctx[0]);
    			t1 = text("\n    - \n    ");
    			span1 = element("span");
    			t2 = text(/*failCount*/ ctx[1]);
    			attr_dev(span0, "class", "answers__correct svelte-1opvl9k");
    			add_location(span0, file$4, 6, 4, 104);
    			attr_dev(span1, "class", "answers__incorrect svelte-1opvl9k");
    			add_location(span1, file$4, 8, 4, 164);
    			attr_dev(h1, "class", "answers");
    			add_location(h1, file$4, 5, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, span0);
    			append_dev(span0, t0);
    			append_dev(h1, t1);
    			append_dev(h1, span1);
    			append_dev(span1, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*winCount*/ 1) set_data_dev(t0, /*winCount*/ ctx[0]);
    			if (dirty & /*failCount*/ 2) set_data_dev(t2, /*failCount*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Score", slots, []);
    	let { winCount = 0 } = $$props;
    	let { failCount = 0 } = $$props;
    	const writable_props = ["winCount", "failCount"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Score> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("winCount" in $$props) $$invalidate(0, winCount = $$props.winCount);
    		if ("failCount" in $$props) $$invalidate(1, failCount = $$props.failCount);
    	};

    	$$self.$capture_state = () => ({ winCount, failCount });

    	$$self.$inject_state = $$props => {
    		if ("winCount" in $$props) $$invalidate(0, winCount = $$props.winCount);
    		if ("failCount" in $$props) $$invalidate(1, failCount = $$props.failCount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [winCount, failCount];
    }

    class Score extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { winCount: 0, failCount: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Score",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get winCount() {
    		throw new Error("<Score>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set winCount(value) {
    		throw new Error("<Score>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get failCount() {
    		throw new Error("<Score>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set failCount(value) {
    		throw new Error("<Score>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MultiQuizz.svelte generated by Svelte v3.29.4 */

    function create_fragment$5(ctx) {
    	let score;
    	let t0;
    	let quizz;
    	let t1;
    	let history;
    	let current;

    	score = new Score({
    			props: {
    				winCount: /*winCount*/ ctx[3],
    				failCount: /*failCount*/ ctx[2]
    			},
    			$$inline: true
    		});

    	quizz = new Quizz({
    			props: {
    				kana: /*current*/ ctx[5].character,
    				correctAnswer: /*current*/ ctx[5].answer,
    				heading: /*heading*/ ctx[1],
    				shouldFilter: /*shouldFilter*/ ctx[0]
    			},
    			$$inline: true
    		});

    	quizz.$on("answer", /*handleAnswer*/ ctx[6]);

    	history = new History({
    			props: { data: /*answers*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(score.$$.fragment);
    			t0 = space();
    			create_component(quizz.$$.fragment);
    			t1 = space();
    			create_component(history.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(score, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(quizz, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(history, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const score_changes = {};
    			if (dirty & /*winCount*/ 8) score_changes.winCount = /*winCount*/ ctx[3];
    			if (dirty & /*failCount*/ 4) score_changes.failCount = /*failCount*/ ctx[2];
    			score.$set(score_changes);
    			const quizz_changes = {};
    			if (dirty & /*current*/ 32) quizz_changes.kana = /*current*/ ctx[5].character;
    			if (dirty & /*current*/ 32) quizz_changes.correctAnswer = /*current*/ ctx[5].answer;
    			if (dirty & /*heading*/ 2) quizz_changes.heading = /*heading*/ ctx[1];
    			if (dirty & /*shouldFilter*/ 1) quizz_changes.shouldFilter = /*shouldFilter*/ ctx[0];
    			quizz.$set(quizz_changes);
    			const history_changes = {};
    			if (dirty & /*answers*/ 16) history_changes.data = /*answers*/ ctx[4];
    			history.$set(history_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(score.$$.fragment, local);
    			transition_in(quizz.$$.fragment, local);
    			transition_in(history.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(score.$$.fragment, local);
    			transition_out(quizz.$$.fragment, local);
    			transition_out(history.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(score, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(quizz, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(history, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MultiQuizz", slots, []);
    	let { characters = [] } = $$props;
    	let { shouldFilter = true } = $$props;
    	let { heading = undefined } = $$props;
    	let failCount = 0;
    	let winCount = 0;
    	let answers = [];

    	const getRandomCharacter = () => {
    		const randomNumber = Math.random() * (characters.length - 1);
    		const randomIndex = Math.round(randomNumber);
    		return characters[randomIndex];
    	};

    	const handleAnswer = ({ detail }) => {
    		const { isCorrect } = detail;
    		if (isCorrect) $$invalidate(3, winCount++, winCount); else $$invalidate(2, failCount++, failCount);
    		if (answers.length > 9) answers.pop();
    		$$invalidate(4, answers = [detail, ...answers]);
    		$$invalidate(5, current = getRandomCharacter());
    	};

    	let current = getRandomCharacter();
    	const writable_props = ["characters", "shouldFilter", "heading"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiQuizz> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("characters" in $$props) $$invalidate(7, characters = $$props.characters);
    		if ("shouldFilter" in $$props) $$invalidate(0, shouldFilter = $$props.shouldFilter);
    		if ("heading" in $$props) $$invalidate(1, heading = $$props.heading);
    	};

    	$$self.$capture_state = () => ({
    		History,
    		Quizz,
    		Score,
    		characters,
    		shouldFilter,
    		heading,
    		failCount,
    		winCount,
    		answers,
    		getRandomCharacter,
    		handleAnswer,
    		current
    	});

    	$$self.$inject_state = $$props => {
    		if ("characters" in $$props) $$invalidate(7, characters = $$props.characters);
    		if ("shouldFilter" in $$props) $$invalidate(0, shouldFilter = $$props.shouldFilter);
    		if ("heading" in $$props) $$invalidate(1, heading = $$props.heading);
    		if ("failCount" in $$props) $$invalidate(2, failCount = $$props.failCount);
    		if ("winCount" in $$props) $$invalidate(3, winCount = $$props.winCount);
    		if ("answers" in $$props) $$invalidate(4, answers = $$props.answers);
    		if ("current" in $$props) $$invalidate(5, current = $$props.current);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		shouldFilter,
    		heading,
    		failCount,
    		winCount,
    		answers,
    		current,
    		handleAnswer,
    		characters
    	];
    }

    class MultiQuizz extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			characters: 7,
    			shouldFilter: 0,
    			heading: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiQuizz",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get characters() {
    		throw new Error("<MultiQuizz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set characters(value) {
    		throw new Error("<MultiQuizz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shouldFilter() {
    		throw new Error("<MultiQuizz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldFilter(value) {
    		throw new Error("<MultiQuizz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get heading() {
    		throw new Error("<MultiQuizz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set heading(value) {
    		throw new Error("<MultiQuizz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Infinite.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1 } = globals;
    const file$5 = "src/components/Infinite.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (30:8) {#if showFilters}
    function create_if_block$4(ctx) {
    	let ul;
    	let ul_transition;
    	let current;
    	let each_value = /*choices*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "filters__items svelte-wl5uha");
    			add_location(ul, file$5, 30, 8, 797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*choices, wanted*/ 10) {
    				each_value = /*choices*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!ul_transition) ul_transition = create_bidirectional_transition(ul, slide, {}, true);
    				ul_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!ul_transition) ul_transition = create_bidirectional_transition(ul, slide, {}, false);
    			ul_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching && ul_transition) ul_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(30:8) {#if showFilters}",
    		ctx
    	});

    	return block;
    }

    // (32:12) {#each choices as choice}
    function create_each_block$2(ctx) {
    	let li;
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*choice*/ ctx[8] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = /*choice*/ ctx[8];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[6][0].push(input);
    			add_location(input, file$5, 34, 20, 963);
    			add_location(label, file$5, 33, 16, 935);
    			attr_dev(li, "class", "filters__item svelte-wl5uha");
    			add_location(li, file$5, 32, 12, 892);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, label);
    			append_dev(label, input);
    			input.checked = ~/*wanted*/ ctx[1].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*wanted*/ 2) {
    				input.checked = ~/*wanted*/ ctx[1].indexOf(input.__value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			/*$$binding_groups*/ ctx[6][0].splice(/*$$binding_groups*/ ctx[6][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(32:12) {#each choices as choice}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let div;
    	let button;
    	let t1;
    	let t2;
    	let multiquizz;
    	let main_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*showFilters*/ ctx[0] && create_if_block$4(ctx);

    	multiquizz = new MultiQuizz({
    			props: {
    				heading: "ひらがな・カタカナ",
    				shouldFilter: false,
    				characters: /*characters*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			button = element("button");
    			button.textContent = "Show Filters";
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			create_component(multiquizz.$$.fragment);
    			attr_dev(button, "class", "filters__btn");
    			add_location(button, file$5, 28, 8, 668);
    			attr_dev(div, "class", "filters svelte-wl5uha");
    			add_location(div, file$5, 27, 4, 638);
    			add_location(main, file$5, 26, 0, 610);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, button);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			append_dev(main, t2);
    			mount_component(multiquizz, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showFilters*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showFilters*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const multiquizz_changes = {};
    			if (dirty & /*characters*/ 4) multiquizz_changes.characters = /*characters*/ ctx[2];
    			multiquizz.$set(multiquizz_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(multiquizz.$$.fragment, local);

    			add_render_callback(() => {
    				if (!main_transition) main_transition = create_bidirectional_transition(main, slide, {}, true);
    				main_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(multiquizz.$$.fragment, local);
    			if (!main_transition) main_transition = create_bidirectional_transition(main, slide, {}, false);
    			main_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			destroy_component(multiquizz);
    			if (detaching && main_transition) main_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Infinite", slots, []);
    	let choices = Object.keys(kana);
    	let showFilters = false;
    	let wanted = [choices[0]];

    	const getCharacters = filter => {
    		const result = [];

    		for (const type in kana) {
    			if (!filter.includes(type)) continue;
    			const chars = kana[type];
    			result.push(...chars);
    		}

    		return result;
    	};

    	let characters = getCharacters(wanted);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Infinite> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];
    	const click_handler = () => $$invalidate(0, showFilters = !showFilters);

    	function input_change_handler() {
    		wanted = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(1, wanted);
    	}

    	$$self.$capture_state = () => ({
    		slide,
    		kana,
    		MultiQuizz,
    		choices,
    		showFilters,
    		wanted,
    		getCharacters,
    		characters
    	});

    	$$self.$inject_state = $$props => {
    		if ("choices" in $$props) $$invalidate(3, choices = $$props.choices);
    		if ("showFilters" in $$props) $$invalidate(0, showFilters = $$props.showFilters);
    		if ("wanted" in $$props) $$invalidate(1, wanted = $$props.wanted);
    		if ("characters" in $$props) $$invalidate(2, characters = $$props.characters);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wanted*/ 2) {
    			 $$invalidate(2, characters = getCharacters(wanted));
    		}
    	};

    	return [
    		showFilters,
    		wanted,
    		characters,
    		choices,
    		click_handler,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class Infinite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Infinite",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const numbers = [
        { character: "一",   answer: "イチ" },
        { character: "二",   answer: "ニ" },
        { character: "三",   answer: "サン" },
        { character: "四",   answer: ["シ", "よん"] },
        { character: "五",   answer: "ゴ" },
        { character: "六",   answer: "ロク" },
        { character: "七",   answer: ["シチ", "なな"] },
        { character: "八",   answer: "ハチ" },
        { character: "九",   answer: ["ク", "キュウ"] },
        { character: "十",   answer: "ジュウ" },
        { character: "百",   answer: "ヒャク" },
        { character: "千",   answer: "セン" },
    ];

    const first = [
        { character: "人",   answer: "ひと" },
        { character: "男",   answer: "おとこ" },
        { character: "女",   answer: "おんな" },
        { character: "子",   answer: "こ" },
        { character: "日",   answer: "ひ" },
        { character: "月",   answer: "つき" },
        { character: "時",   answer: "とき" },
        { character: "水",   answer: "みず" },
        { character: "火",   answer: "ひ" },
        { character: "土",   answer: "つち" },
        { character: "風",   answer: "かぜ" },
        { character: "空",   answer: "そら" },
        { character: "山",   answer: "やま" },
        { character: "川",   answer: "かわ" },
        { character: "木",   answer: "き" },
        { character: "花",   answer: "はな" },
        { character: "雨",   answer: "あめ" },
        { character: "雪",   answer: "ゆき" },
        { character: "金",   answer: "かね" },
        { character: "刀",   answer: "かたな" },
    ];

    var kanji = {
        first,
        numbers,
    };

    /* src/components/Kanji.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$1 } = globals;
    const file$6 = "src/components/Kanji.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (30:8) {#if showFilters}
    function create_if_block$5(ctx) {
    	let ul;
    	let ul_transition;
    	let current;
    	let each_value = /*choices*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "filters__items svelte-wl5uha");
    			add_location(ul, file$6, 30, 8, 802);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*choices, wanted*/ 10) {
    				each_value = /*choices*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!ul_transition) ul_transition = create_bidirectional_transition(ul, slide, {}, true);
    				ul_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!ul_transition) ul_transition = create_bidirectional_transition(ul, slide, {}, false);
    			ul_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching && ul_transition) ul_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(30:8) {#if showFilters}",
    		ctx
    	});

    	return block;
    }

    // (32:12) {#each choices as choice}
    function create_each_block$3(ctx) {
    	let li;
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*choice*/ ctx[8] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = /*choice*/ ctx[8];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[6][0].push(input);
    			add_location(input, file$6, 34, 20, 968);
    			add_location(label, file$6, 33, 16, 940);
    			attr_dev(li, "class", "filters__item svelte-wl5uha");
    			add_location(li, file$6, 32, 12, 897);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, label);
    			append_dev(label, input);
    			input.checked = ~/*wanted*/ ctx[1].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*wanted*/ 2) {
    				input.checked = ~/*wanted*/ ctx[1].indexOf(input.__value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			/*$$binding_groups*/ ctx[6][0].splice(/*$$binding_groups*/ ctx[6][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(32:12) {#each choices as choice}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let div;
    	let button;
    	let t1;
    	let t2;
    	let multiquizz;
    	let main_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*showFilters*/ ctx[0] && create_if_block$5(ctx);

    	multiquizz = new MultiQuizz({
    			props: {
    				heading: "漢字",
    				shouldFilter: false,
    				characters: /*characters*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			button = element("button");
    			button.textContent = "Show Filters";
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			create_component(multiquizz.$$.fragment);
    			attr_dev(button, "class", "filters__btn");
    			add_location(button, file$6, 28, 8, 673);
    			attr_dev(div, "class", "filters svelte-wl5uha");
    			add_location(div, file$6, 27, 4, 643);
    			add_location(main, file$6, 26, 0, 615);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, button);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			append_dev(main, t2);
    			mount_component(multiquizz, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showFilters*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showFilters*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const multiquizz_changes = {};
    			if (dirty & /*characters*/ 4) multiquizz_changes.characters = /*characters*/ ctx[2];
    			multiquizz.$set(multiquizz_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(multiquizz.$$.fragment, local);

    			add_render_callback(() => {
    				if (!main_transition) main_transition = create_bidirectional_transition(main, slide, {}, true);
    				main_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(multiquizz.$$.fragment, local);
    			if (!main_transition) main_transition = create_bidirectional_transition(main, slide, {}, false);
    			main_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			destroy_component(multiquizz);
    			if (detaching && main_transition) main_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Kanji", slots, []);
    	let choices = Object.keys(kanji);
    	let showFilters = false;
    	let wanted = [choices[0]];

    	const getCharacters = filter => {
    		const result = [];

    		for (const type in kanji) {
    			if (!filter.includes(type)) continue;
    			const chars = kanji[type];
    			result.push(...chars);
    		}

    		return result;
    	};

    	let characters = getCharacters(wanted);
    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Kanji> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];
    	const click_handler = () => $$invalidate(0, showFilters = !showFilters);

    	function input_change_handler() {
    		wanted = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(1, wanted);
    	}

    	$$self.$capture_state = () => ({
    		slide,
    		kanji,
    		MultiQuizz,
    		choices,
    		showFilters,
    		wanted,
    		getCharacters,
    		characters
    	});

    	$$self.$inject_state = $$props => {
    		if ("choices" in $$props) $$invalidate(3, choices = $$props.choices);
    		if ("showFilters" in $$props) $$invalidate(0, showFilters = $$props.showFilters);
    		if ("wanted" in $$props) $$invalidate(1, wanted = $$props.wanted);
    		if ("characters" in $$props) $$invalidate(2, characters = $$props.characters);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wanted*/ 2) {
    			 $$invalidate(2, characters = getCharacters(wanted));
    		}
    	};

    	return [
    		showFilters,
    		wanted,
    		characters,
    		choices,
    		click_handler,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class Kanji extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Kanji",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Nav.svelte generated by Svelte v3.29.4 */
    const file$7 = "src/components/Nav.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].name;
    	child_ctx[8] = list[i].link;
    	return child_ctx;
    }

    // (26:0) {#if isVisible}
    function create_if_block$6(ctx) {
    	let ul;
    	let each_value = /*filteredLinks*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "nav__links svelte-12zt6lb");
    			add_location(ul, file$7, 26, 4, 658);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*handleClick, filteredLinks*/ 6) {
    				each_value = /*filteredLinks*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(26:0) {#if isVisible}",
    		ctx
    	});

    	return block;
    }

    // (28:8) {#each filteredLinks as { name, link }}
    function create_each_block$4(ctx) {
    	let li;
    	let t_value = /*name*/ ctx[7] + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "nav__link svelte-12zt6lb");
    			add_location(li, file$7, 28, 8, 738);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					li,
    					"click",
    					function () {
    						if (is_function(/*handleClick*/ ctx[2](/*link*/ ctx[8]))) /*handleClick*/ ctx[2](/*link*/ ctx[8]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*filteredLinks*/ 2 && t_value !== (t_value = /*name*/ ctx[7] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(28:8) {#each filteredLinks as { name, link }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let nav;
    	let button;
    	let t0_value = (/*isVisible*/ ctx[0] ? "Close" : "Open") + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block = /*isVisible*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(button, "class", "nav__button svelte-12zt6lb");
    			add_location(button, file$7, 22, 4, 516);
    			attr_dev(nav, "class", "nav svelte-12zt6lb");
    			add_location(nav, file$7, 21, 0, 494);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, button);
    			append_dev(button, t0);
    			append_dev(nav, t1);
    			if (if_block) if_block.m(nav, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isVisible*/ 1 && t0_value !== (t0_value = (/*isVisible*/ ctx[0] ? "Close" : "Open") + "")) set_data_dev(t0, t0_value);

    			if (/*isVisible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(nav, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, []);
    	let { currentLink } = $$props;
    	const dispatch = createEventDispatcher();

    	const links = [
    		{ name: "Infinite Kana", link: "infinite" },
    		{ name: "Infinite Kanji", link: "kanji" }
    	];

    	const handleClick = link => () => {
    		$$invalidate(0, isVisible = false);
    		dispatch("change", { link });
    	};

    	let isVisible = false;
    	const writable_props = ["currentLink"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, isVisible = !isVisible);

    	$$self.$$set = $$props => {
    		if ("currentLink" in $$props) $$invalidate(3, currentLink = $$props.currentLink);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		currentLink,
    		dispatch,
    		links,
    		handleClick,
    		isVisible,
    		filteredLinks
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentLink" in $$props) $$invalidate(3, currentLink = $$props.currentLink);
    		if ("isVisible" in $$props) $$invalidate(0, isVisible = $$props.isVisible);
    		if ("filteredLinks" in $$props) $$invalidate(1, filteredLinks = $$props.filteredLinks);
    	};

    	let filteredLinks;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentLink*/ 8) {
    			 $$invalidate(1, filteredLinks = links.filter(({ link }) => link !== currentLink));
    		}
    	};

    	return [isVisible, filteredLinks, handleClick, currentLink, click_handler];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { currentLink: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentLink*/ ctx[3] === undefined && !("currentLink" in props)) {
    			console.warn("<Nav> was created without expected prop 'currentLink'");
    		}
    	}

    	get currentLink() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentLink(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.4 */

    // (22:0) {#if page}
    function create_if_block$7(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*page*/ ctx[1];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*page*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(22:0) {#if page}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let nav;
    	let t;
    	let if_block_anchor;
    	let current;

    	nav = new Nav({
    			props: { currentLink: /*type*/ ctx[0] },
    			$$inline: true
    		});

    	nav.$on("change", /*handleChange*/ ctx[2]);
    	let if_block = /*page*/ ctx[1] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const nav_changes = {};
    			if (dirty & /*type*/ 1) nav_changes.currentLink = /*type*/ ctx[0];
    			nav.$set(nav_changes);

    			if (/*page*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*page*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let type = "infinite";
    	const pages = { infinite: Infinite, kanji: Kanji };

    	const handleChange = ({ detail }) => {
    		$$invalidate(0, type = detail.link);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Infinite,
    		Kanji,
    		Nav,
    		type,
    		pages,
    		handleChange,
    		page
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("page" in $$props) $$invalidate(1, page = $$props.page);
    	};

    	let page;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type*/ 1) {
    			 $$invalidate(1, page = pages[type]);
    		}
    	};

    	return [type, page, handleChange];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
