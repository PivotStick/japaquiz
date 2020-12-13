
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
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
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
        { word: "あ",   answer: "a" },
        { word: "い",   answer: "i" },
        { word: "う",   answer: "u" },
        { word: "え",   answer: "e" },
        { word: "お",   answer: "o" },

        { word: "か",   answer: "ka" },
        { word: "き",   answer: "ki" },
        { word: "く",   answer: "ku" },
        { word: "け",   answer: "ke" },
        { word: "こ",   answer: "ko" },

        { word: "さ",   answer: "sa" },
        { word: "し",   answer: "shi" },
        { word: "す",   answer: "su" },
        { word: "せ",   answer: "se" },
        { word: "そ",   answer: "so" },

        { word: "た",   answer: "ta" },
        { word: "ち",   answer: "chi" },
        { word: "つ",   answer: "tsu" },
        { word: "て",   answer: "te" },
        { word: "と",   answer: "to" },

        { word: "な",   answer: "na" },
        { word: "に",   answer: "ni" },
        { word: "ぬ",   answer: "nu" },
        { word: "ね",   answer: "ne" },
        { word: "の",   answer: "no" },

        { word: "は",   answer: "ha" },
        { word: "ひ",   answer: "hi" },
        { word: "ふ",   answer: "fu" },
        { word: "へ",   answer: "he" },
        { word: "ほ",   answer: "ho" },

        { word: "ま",   answer: "ma" },
        { word: "み",   answer: "mi" },
        { word: "む",   answer: "mu" },
        { word: "め",   answer: "me" },
        { word: "も",   answer: "mo" },

        { word: "や",   answer: "ya" },
        { word: "ゆ",   answer: "yu" },
        { word: "よ",   answer: "yo" },

        { word: "ら",   answer: "ra" },
        { word: "り",   answer: "ri" },
        { word: "る",   answer: "ru" },
        { word: "れ",   answer: "re" },
        { word: "ろ",   answer: "ro" },

        { word: "わ",   answer: "wa" },
        { word: "を",   answer: "wo" },

        { word: "ん",   answer: "n" },
    ];

    var hiragana$1 = {
        list: hiragana,
        ref: "https://www.youtube.com/watch?v=_PCJnq_-oT8&t=0",
    };

    const hiraganaAccents = [
        { word: "が",   answer: "ga" },
        { word: "ぎ",   answer: "gi" },
        { word: "ぐ",   answer: "gu" },
        { word: "げ",   answer: "ge" },
        { word: "ご",   answer: "go" },

        { word: "ざ",   answer: "za" },
        { word: "じ",   answer: "ji" },
        { word: "ず",   answer: "zu" },
        { word: "ぜ",   answer: "ze" },
        { word: "ぞ",   answer: "zo" },

        { word: "だ",   answer: "da" },
        { word: "ぢ",   answer: "ji" },
        { word: "づ",   answer: "zu" },
        { word: "で",   answer: "de" },
        { word: "ど",   answer: "do" },

        { word: "ば",   answer: "ba" },
        { word: "び",   answer: "bi" },
        { word: "ぶ",   answer: "bu" },
        { word: "べ",   answer: "be" },
        { word: "ぼ",   answer: "bo" },

        { word: "ぱ",   answer: "pa" },
        { word: "ぴ",   answer: "pi" },
        { word: "ぷ",   answer: "pu" },
        { word: "ぺ",   answer: "pe" },
        { word: "ぽ",   answer: "po" },
    ];

    var hiraganaAccents$1 = {
        list: hiraganaAccents,
        ref: "https://www.youtube.com/watch?v=LlyGGMlEydM&t=0",
    };

    const katakana = [
        { word: "ア",   answer: "a" },
        { word: "イ",   answer: "i" },
        { word: "ウ",   answer: "u" },
        { word: "エ",   answer: "e" },
        { word: "オ",   answer: "o" },

        { word: "カ",   answer: "ka" },
        { word: "キ",   answer: "ki" },
        { word: "ク",   answer: "ku" },
        { word: "ケ",   answer: "ke" },
        { word: "コ",   answer: "ko" },

        { word: "サ",   answer: "sa" },
        { word: "シ",   answer: "shi" },
        { word: "ス",   answer: "su" },
        { word: "セ",   answer: "se" },
        { word: "ソ",   answer: "so" },

        { word: "タ",   answer: "ta" },
        { word: "チ",   answer: "chi" },
        { word: "ツ",   answer: "tsu" },
        { word: "テ",   answer: "te" },
        { word: "ト",   answer: "to" },

        { word: "ナ",   answer: "na" },
        { word: "ニ",   answer: "ni" },
        { word: "ヌ",   answer: "nu" },
        { word: "ネ",   answer: "ne" },
        { word: "ノ",   answer: "no" },

        { word: "ハ",   answer: "ha" },
        { word: "ヒ",   answer: "hi" },
        { word: "フ",   answer: "fu" },
        { word: "ヘ",   answer: "he" },
        { word: "ホ",   answer: "ho" },

        { word: "マ",   answer: "ma" },
        { word: "ミ",   answer: "mi" },
        { word: "ム",   answer: "mu" },
        { word: "メ",   answer: "me" },
        { word: "モ",   answer: "mo" },

        { word: "ヤ",   answer: "ya" },
        { word: "ユ",   answer: "yu" },
        { word: "ヨ",   answer: "yo" },

        { word: "ラ",   answer: "ra" },
        { word: "リ",   answer: "ri" },
        { word: "ル",   answer: "ru" },
        { word: "レ",   answer: "re" },
        { word: "ロ",   answer: "ro" },

        { word: "ワ",   answer: "wa" },
        { word: "ヲ",   answer: "wo" },

        { word: "ン",   answer: "n" },
    ];

    var katakana$1 = {
        list: katakana,
        ref: "https://www.youtube.com/watch?v=xnjpl0mNQOQ&t=0"
    };

    const katakanaAccents = [
        { word: "ガ",   answer: "ga" },
        { word: "ギ",   answer: "gi" },
        { word: "グ",   answer: "gu" },
        { word: "ゲ",   answer: "ge" },
        { word: "ゴ",   answer: "go" },

        { word: "ザ",   answer: "za" },
        { word: "ジ",   answer: "ji" },
        { word: "ズ",   answer: "zu" },
        { word: "ゼ",   answer: "ze" },
        { word: "ゾ",   answer: "zo" },

        { word: "ダ",   answer: "da" },
        { word: "ヂ",   answer: "ji" },
        { word: "ヅ",   answer: "zu" },
        { word: "デ",   answer: "de" },
        { word: "ド",   answer: "do" },

        { word: "バ",   answer: "ba" },
        { word: "ビ",   answer: "bi" },
        { word: "ブ",   answer: "bu" },
        { word: "ベ",   answer: "be" },
        { word: "ボ",   answer: "bo" },

        { word: "パ",   answer: "pa" },
        { word: "ピ",   answer: "pi" },
        { word: "プ",   answer: "pu" },
        { word: "ペ",   answer: "pe" },
        { word: "ポ",   answer: "po" },
    ];

    var katakanaAccents$1 = {
        list: katakanaAccents,
        ref: "https://www.youtube.com/watch?v=LlyGGMlEydM&t=0",
    };

    function combineSmallKanaToKana({ kana, smallKana }) {
        const kanaWithoutEnd = kana.answer.substring(0, kana.answer.length - 1);
        const smallKanaFiltered = ["sh", "j", "ch"].includes(kanaWithoutEnd)
            ? smallKana.answer.substring(1)
            : smallKana.answer;
        
        const word = kana.word + smallKana.word;
        const answer = kanaWithoutEnd + smallKanaFiltered;

        return { word, answer };
    }
    function combine(kanaList, smallKanaList, ref = "") {
        const filteredKanaList = kanaList.filter(kana => {
            const answerLength = kana.answer.length;
            const lastSyllable = kana.answer[answerLength - 1];
            const isJi = ["ぢ", "ヂ"].includes(kana.word);

            return answerLength > 1 && lastSyllable === "i" && !isJi;
        });

        const results = [];
        for (const kana of filteredKanaList)
            for (const smallKana of smallKanaList) {
                const combination = combineSmallKanaToKana({ kana, smallKana });
                results.push(combination);
            }

        return {
            list: results,
            ref,
        };
    }
    const smallHiragana = [
        { word: "ゃ", answer: "ya" },
        { word: "ゅ", answer: "yu" },
        { word: "ょ", answer: "yo" },
    ];

    const smallKatakana = [
        { word: "ャ", answer: "ya" },
        { word: "ュ", answer: "yu" },
        { word: "ョ", answer: "yo" },
    ];

    const allHiragana = [...hiragana, ...hiraganaAccents];
    const allKatakana = [...katakana, ...katakanaAccents];
    const linkRef = "https://www.youtube.com/watch?v=VjkPz2ZhB6I&t=0";

    const hiraganaCombinations = combine(allHiragana, smallHiragana, linkRef);
    const katakanaCombinations = combine(allKatakana, smallKatakana, linkRef);

    const newKatakanaCombinations = [
        { word: "ファ", answer: "fa" },
        { word: "フィ", answer: "fi" },
        { word: "フェ", answer: "fe" },
        { word: "フォ", answer: "fo" },

        { word: "ヴァ", answer: "va" },
        { word: "ヴィ", answer: "vi" },
        { word: "ヴ", answer: "vu" },
        { word: "ヴェ", answer: "ve" },
        { word: "ヴォ", answer: "vo" },

        { word: "ウィ", answer: "wi" },
        { word: "ウェ", answer: "we" },
        { word: "ウォ", answer: "wo" },

        { word: "シェ", answer: "she" },
        { word: "ジェ", answer: "je" },
        { word: "チェ", answer: "che" },

        { word: "ティ", answer: "ti" },
        { word: "ディ", answer: "di" },
        { word: "トゥ", answer: "tu" },
        { word: "ドゥ", answer: "du" },

        { word: "ツァ", answer: "tsa" },
        { word: "ツィ", answer: "tsi" },
        { word: "ツェ", answer: "tse" },
        { word: "ツォ", answer: "tso" },

        { word: "スィ", answer: "si" },
        { word: "ズィ", answer: "zi" },
        { word: "デュ", answer: "dyu" },
        { word: "テュ", answer: "tyu" },
        { word: "クォ", answer: "kwo" },
    ];

    var newKatakanaCombinations$1 = {
        list: newKatakanaCombinations,
        ref: "https://www.youtube.com/watch?v=1vmzhmTobXc&t=0"
    };

    var kana = {
        "Hiragana": hiragana$1,
        "Katakana": katakana$1,

        "Hiragana Accents": hiraganaAccents$1,
        "Katakana Accents": katakanaAccents$1,

        "Les Combinaisons Hiragana": hiraganaCombinations,
        "Les Combinaisons Katakana": katakanaCombinations,

        "Les Nouvelles Combinaisons Katakana": newKatakanaCombinations$1,
    };

    /* src/components/Button.svelte generated by Svelte v3.29.4 */

    const file = "src/components/Button.svelte";

    function create_fragment(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);
    	let button_levels = [/*$$props*/ ctx[0]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			toggle_class(button, "svelte-1hkk2lw", true);
    			add_location(button, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]]));
    			toggle_class(button, "svelte-1hkk2lw", true);
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
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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
    	validate_slots("Button", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props, $$scope, slots, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Filters.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1 } = globals;
    const file$1 = "src/components/Filters.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i].choice;
    	child_ctx[8] = list[i].selected;
    	child_ctx[9] = list[i].ref;
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (39:4) <Button on:click={() => (showFilters = !showFilters)}>
    function create_default_slot(ctx) {
    	let t0_value = (/*showFilters*/ ctx[0] ? "Cacher" : "Montrer") + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text("\n        les Filtres");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*showFilters*/ 1 && t0_value !== (t0_value = (/*showFilters*/ ctx[0] ? "Cacher" : "Montrer") + "")) set_data_dev(t0, t0_value);
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
    		source: "(39:4) <Button on:click={() => (showFilters = !showFilters)}>",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#if showFilters}
    function create_if_block(ctx) {
    	let ul;
    	let ul_transition;
    	let current;
    	let each_value = /*choices*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "filters__items svelte-adivg3");
    			add_location(ul, file$1, 43, 8, 1247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*choices, handleClick*/ 6) {
    				each_value = /*choices*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(43:4) {#if showFilters}",
    		ctx
    	});

    	return block;
    }

    // (45:12) {#each choices as { choice, selected, ref }
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let t0;
    	let t1_value = (/*ref*/ ctx[9] === "" ? "❋" : "↩︎") + "";
    	let t1;
    	let a_href_value;
    	let t2;
    	let div;
    	let t3_value = /*choice*/ ctx[7] + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text("︎ ");
    			t1 = text(t1_value);
    			t2 = space();
    			div = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			attr_dev(a, "class", "filters__item--link svelte-adivg3");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", a_href_value = /*ref*/ ctx[9]);
    			toggle_class(a, "disabled", /*ref*/ ctx[9] === "");
    			add_location(a, file$1, 46, 20, 1419);
    			attr_dev(div, "class", "filters__item--button svelte-adivg3");
    			toggle_class(div, "-selected", /*selected*/ ctx[8]);
    			add_location(div, file$1, 53, 20, 1698);
    			attr_dev(li, "class", "filters__item svelte-adivg3");
    			add_location(li, file$1, 45, 16, 1372);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(li, t2);
    			append_dev(li, div);
    			append_dev(div, t3);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleClick*/ ctx[2](/*index*/ ctx[11]), false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*choices*/ 2 && t1_value !== (t1_value = (/*ref*/ ctx[9] === "" ? "❋" : "↩︎") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*choices*/ 2 && a_href_value !== (a_href_value = /*ref*/ ctx[9])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*choices*/ 2) {
    				toggle_class(a, "disabled", /*ref*/ ctx[9] === "");
    			}

    			if (dirty & /*choices*/ 2 && t3_value !== (t3_value = /*choice*/ ctx[7] + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*choices*/ 2) {
    				toggle_class(div, "-selected", /*selected*/ ctx[8]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(45:12) {#each choices as { choice, selected, ref }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let button;
    	let t;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[4]);
    	let if_block = /*showFilters*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "filters svelte-adivg3");
    			add_location(div, file$1, 37, 0, 1057);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope, showFilters*/ 4097) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*showFilters*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showFilters*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
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
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			if (if_block) if_block.d();
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
    	validate_slots("Filters", slots, []);
    	let { choicesObject = {} } = $$props;
    	const dispatch = createEventDispatcher();
    	const possibilities = Object.keys(choicesObject);
    	let showFilters = false;

    	let choices = possibilities.map((choice, i) => ({
    		choice,
    		ref: choicesObject[choice].ref,
    		selected: i === 0
    	}));

    	const handleClick = index => () => {
    		const activeCount = choices.filter(choice => choice.selected).length;
    		const choice = choices[index];
    		if (activeCount <= 1 && choice.selected === true) return;
    		choice.selected = !choice.selected;
    		$$invalidate(1, choices);
    	};

    	onMount(() => {
    		$$invalidate(1, choices);
    	});

    	const writable_props = ["choicesObject"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Filters> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, showFilters = !showFilters);

    	$$self.$$set = $$props => {
    		if ("choicesObject" in $$props) $$invalidate(3, choicesObject = $$props.choicesObject);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		createEventDispatcher,
    		onMount,
    		Button,
    		choicesObject,
    		dispatch,
    		possibilities,
    		showFilters,
    		choices,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("choicesObject" in $$props) $$invalidate(3, choicesObject = $$props.choicesObject);
    		if ("showFilters" in $$props) $$invalidate(0, showFilters = $$props.showFilters);
    		if ("choices" in $$props) $$invalidate(1, choices = $$props.choices);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*choices*/ 2) {
    			 {
    				const selectedChoices = choices.filter(({ selected }) => selected);
    				const mappedChoices = selectedChoices.map(({ choice }) => choice);
    				dispatch("change", mappedChoices);
    			}
    		}
    	};

    	return [showFilters, choices, handleClick, choicesObject, click_handler];
    }

    class Filters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { choicesObject: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filters",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get choicesObject() {
    		throw new Error("<Filters>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set choicesObject(value) {
    		throw new Error("<Filters>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SlideText.svelte generated by Svelte v3.29.4 */
    const file$2 = "src/components/SlideText.svelte";

    // (10:0) {:else}
    function create_else_block(ctx) {
    	let h1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			if (default_slot) default_slot.c();
    			attr_dev(h1, "class", "svelte-704jlf");
    			toggle_class(h1, "hover", /*hover*/ ctx[1]);
    			add_location(h1, file$2, 10, 0, 212);
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
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (dirty & /*hover*/ 2) {
    				toggle_class(h1, "hover", /*hover*/ ctx[1]);
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
    		source: "(10:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (8:0) {#if shouldSlide}
    function create_if_block$1(ctx) {
    	let h1;
    	let h1_transition;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			if (default_slot) default_slot.c();
    			attr_dev(h1, "class", "svelte-704jlf");
    			toggle_class(h1, "hover", /*hover*/ ctx[1]);
    			add_location(h1, file$2, 8, 0, 150);
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
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (dirty & /*hover*/ 2) {
    				toggle_class(h1, "hover", /*hover*/ ctx[1]);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(8:0) {#if shouldSlide}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SlideText", slots, ['default']);
    	let { shouldSlide = true } = $$props;
    	let { hover = true } = $$props;
    	const writable_props = ["shouldSlide", "hover"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SlideText> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("shouldSlide" in $$props) $$invalidate(0, shouldSlide = $$props.shouldSlide);
    		if ("hover" in $$props) $$invalidate(1, hover = $$props.hover);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ slide, shouldSlide, hover });

    	$$self.$inject_state = $$props => {
    		if ("shouldSlide" in $$props) $$invalidate(0, shouldSlide = $$props.shouldSlide);
    		if ("hover" in $$props) $$invalidate(1, hover = $$props.hover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [shouldSlide, hover, $$scope, slots];
    }

    class SlideText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { shouldSlide: 0, hover: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SlideText",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get shouldSlide() {
    		throw new Error("<SlideText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldSlide(value) {
    		throw new Error("<SlideText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<SlideText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<SlideText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Answer.svelte generated by Svelte v3.29.4 */
    const file$3 = "src/components/Answer.svelte";

    // (19:0) {:else}
    function create_else_block_1(ctx) {
    	let h1;
    	let h1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Vos dernières réponses seront affichées ici.";
    			attr_dev(h1, "class", "svelte-siooqu");
    			add_location(h1, file$3, 19, 4, 499);
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
    		source: "(19:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (10:0) {#if answer}
    function create_if_block$2(ctx) {
    	let slidetext;
    	let current;

    	slidetext = new SlideText({
    			props: {
    				hover: /*hover*/ ctx[2],
    				shouldSlide: /*animate*/ ctx[1],
    				$$slots: { default: [create_default_slot$1] },
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
    			if (dirty & /*hover*/ 4) slidetext_changes.hover = /*hover*/ ctx[2];
    			if (dirty & /*animate*/ 2) slidetext_changes.shouldSlide = /*animate*/ ctx[1];

    			if (dirty & /*$$scope, answer*/ 9) {
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(10:0) {#if answer}",
    		ctx
    	});

    	return block;
    }

    // (14:8) {:else}
    function create_else_block$1(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*answer*/ ctx[0].answer + "";
    	let t1;
    	let t2;
    	let t3_value = /*answer*/ ctx[0].word + "";
    	let t3;
    	let t4;
    	let t5_value = /*answer*/ ctx[0].userInput + "";
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("『");
    			t1 = text(t1_value);
    			t2 = text("』");
    			t3 = text(t3_value);
    			t4 = text(" ≠ ");
    			t5 = text(t5_value);
    			t6 = text(" ❌");
    			attr_dev(span, "class", "svelte-siooqu");
    			add_location(span, file$3, 14, 8, 337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, t6, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answer*/ 1 && t1_value !== (t1_value = /*answer*/ ctx[0].answer + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*answer*/ 1 && t3_value !== (t3_value = /*answer*/ ctx[0].word + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*answer*/ 1 && t5_value !== (t5_value = /*answer*/ ctx[0].userInput + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(t6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(14:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:8) {#if answer.isCorrect}
    function create_if_block_2(ctx) {
    	let t0_value = /*answer*/ ctx[0].word + "";
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
    			if (dirty & /*answer*/ 1 && t0_value !== (t0_value = /*answer*/ ctx[0].word + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(12:8) {#if answer.isCorrect}",
    		ctx
    	});

    	return block;
    }

    // (17:8) {#if answer.meaning}
    function create_if_block_1(ctx) {
    	let t0;
    	let t1_value = /*answer*/ ctx[0].meaning + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("『");
    			t1 = text(t1_value);
    			t2 = text("』");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answer*/ 1 && t1_value !== (t1_value = /*answer*/ ctx[0].meaning + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(17:8) {#if answer.meaning}",
    		ctx
    	});

    	return block;
    }

    // (11:4) <SlideText {hover} shouldSlide={animate}>
    function create_default_slot$1(ctx) {
    	let t;
    	let if_block1_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*answer*/ ctx[0].isCorrect) return create_if_block_2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*answer*/ ctx[0].meaning && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			}

    			if (/*answer*/ ctx[0].meaning) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(11:4) <SlideText {hover} shouldSlide={animate}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block_1];
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Answer", slots, []);
    	let { answer } = $$props;
    	let { animate = true } = $$props;
    	let { hover = true } = $$props;
    	const writable_props = ["answer", "animate", "hover"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Answer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("answer" in $$props) $$invalidate(0, answer = $$props.answer);
    		if ("animate" in $$props) $$invalidate(1, animate = $$props.animate);
    		if ("hover" in $$props) $$invalidate(2, hover = $$props.hover);
    	};

    	$$self.$capture_state = () => ({ slide, SlideText, answer, animate, hover });

    	$$self.$inject_state = $$props => {
    		if ("answer" in $$props) $$invalidate(0, answer = $$props.answer);
    		if ("animate" in $$props) $$invalidate(1, animate = $$props.animate);
    		if ("hover" in $$props) $$invalidate(2, hover = $$props.hover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [answer, animate, hover];
    }

    class Answer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { answer: 0, animate: 1, hover: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Answer",
    			options,
    			id: create_fragment$3.name
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

    	get hover() {
    		throw new Error("<Answer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Answer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/History.svelte generated by Svelte v3.29.4 */
    const file$4 = "src/components/History.svelte";

    function get_each_context$1(ctx, list, i) {
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
    			attr_dev(button, "class", "--clickable svelte-3kfehn");
    			add_location(button, file$4, 13, 0, 260);
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
    function create_if_block$3(ctx) {
    	let div;
    	let current;
    	let each_value = /*rest*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$4, 20, 0, 425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rest*/ 8) {
    				each_value = /*rest*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(20:0) {#if !hidden}",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#each rest as answer}
    function create_each_block$1(ctx) {
    	let answer;
    	let current;

    	answer = new Answer({
    			props: { answer: /*answer*/ ctx[5] },
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(22:0) {#each rest as answer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let answer;
    	let t0;
    	let t1;
    	let if_block1_anchor;
    	let current;

    	answer = new Answer({
    			props: {
    				hover: false,
    				answer: /*lastAnswer*/ ctx[2]
    			},
    			$$inline: true
    		});

    	let if_block0 = /*data*/ ctx[0].length > 1 && create_if_block_1$1(ctx);
    	let if_block1 = !/*hidden*/ ctx[1] && create_if_block$3(ctx);

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
    					if_block1 = create_if_block$3(ctx);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "History",
    			options,
    			id: create_fragment$4.name
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
    const file$5 = "src/components/Quizz.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (51:0) {#if showHint}
    function create_if_block$4(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*answer*/ ctx[2] instanceof Array) return create_if_block_1$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "quizz__hint svelte-dqnhur");
    			add_location(div, file$5, 51, 0, 1163);
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(51:0) {#if showHint}",
    		ctx
    	});

    	return block;
    }

    // (59:4) {:else}
    function create_else_block$2(ctx) {
    	let h1;
    	let t;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text(/*answer*/ ctx[2]);
    			add_location(h1, file$5, 59, 4, 1374);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answer*/ 4) set_data_dev(t, /*answer*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(59:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (53:4) {#if answer instanceof Array}
    function create_if_block_1$2(ctx) {
    	let ul;
    	let each_value = /*answer*/ ctx[2];
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

    			add_location(ul, file$5, 53, 4, 1244);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answer*/ 4) {
    				each_value = /*answer*/ ctx[2];
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(53:4) {#if answer instanceof Array}",
    		ctx
    	});

    	return block;
    }

    // (55:8) {#each answer as answerItem}
    function create_each_block$2(ctx) {
    	let li;
    	let h1;
    	let t0;
    	let t1_value = /*answerItem*/ ctx[14] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			h1 = element("h1");
    			t0 = text("\b• ");
    			t1 = text(t1_value);
    			add_location(h1, file$5, 55, 16, 1302);
    			add_location(li, file$5, 55, 12, 1298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answer*/ 4 && t1_value !== (t1_value = /*answerItem*/ ctx[14] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(55:8) {#each answer as answerItem}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let t0;
    	let h1;
    	let t1;
    	let t2;
    	let article;
    	let h2;
    	let t3_value = (/*word*/ ctx[1] || "°") + "";
    	let t3;
    	let t4;
    	let form;
    	let input_1;
    	let t5;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*showHint*/ ctx[4] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(/*heading*/ ctx[0]);
    			t2 = space();
    			article = element("article");
    			h2 = element("h2");
    			t3 = text(t3_value);
    			t4 = space();
    			form = element("form");
    			input_1 = element("input");
    			t5 = space();
    			button = element("button");
    			button.textContent = "次「つぎ」";
    			attr_dev(h1, "class", "quizz__heading svelte-dqnhur");
    			add_location(h1, file$5, 63, 0, 1415);
    			attr_dev(h2, "class", "quizz__kana --clickable svelte-dqnhur");
    			add_location(h2, file$5, 65, 4, 1485);
    			attr_dev(input_1, "class", "quizz__input");
    			attr_dev(input_1, "type", "text");
    			input_1.value = /*userInput*/ ctx[3];
    			add_location(input_1, file$5, 67, 8, 1645);
    			attr_dev(button, "class", "quizz__button svelte-dqnhur");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$5, 68, 8, 1754);
    			attr_dev(form, "class", "quizz__form svelte-dqnhur");
    			add_location(form, file$5, 66, 4, 1570);
    			attr_dev(article, "class", "quizz svelte-dqnhur");
    			add_location(article, file$5, 64, 0, 1457);
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
    			/*input_1_binding*/ ctx[11](input_1);
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
    					if_block = create_if_block$4(ctx);
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
    			if ((!current || dirty & /*word*/ 2) && t3_value !== (t3_value = (/*word*/ ctx[1] || "°") + "")) set_data_dev(t3, t3_value);

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
    			/*input_1_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Quizz", slots, []);
    	const dispatch = createEventDispatcher();
    	let { heading = "ひらがな" } = $$props;
    	let { shouldFilter = true } = $$props;
    	let { word } = $$props;
    	let { answer } = $$props;
    	let { meaning = undefined } = $$props;
    	let userInput = "";
    	let showHint = false;
    	let input = null;

    	const handleSubmit = () => {
    		if (!userInput) return;
    		const result = { userInput, word, answer, meaning };
    		if (answer instanceof Array) result.isCorrect = answer.includes(userInput); else result.isCorrect = userInput === answer;
    		dispatch("answer", result);
    		$$invalidate(3, userInput = "");
    		$$invalidate(4, showHint = false);
    	};

    	const handleChange = e => {
    		$$invalidate(3, userInput = e.target.value.trim());
    		if (shouldFilter) $$invalidate(3, userInput = userInput.replace(/[^A-Za-z]/g, ""));
    	};

    	const focus = () => {
    		if (input) input.focus();
    	};

    	const handleShowHint = () => {
    		$$invalidate(4, showHint = !showHint);
    		focus();
    	};

    	onMount(focus);
    	const writable_props = ["heading", "shouldFilter", "word", "answer", "meaning"];

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
    		if ("word" in $$props) $$invalidate(1, word = $$props.word);
    		if ("answer" in $$props) $$invalidate(2, answer = $$props.answer);
    		if ("meaning" in $$props) $$invalidate(10, meaning = $$props.meaning);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		scale,
    		dispatch,
    		heading,
    		shouldFilter,
    		word,
    		answer,
    		meaning,
    		userInput,
    		showHint,
    		input,
    		handleSubmit,
    		handleChange,
    		focus,
    		handleShowHint
    	});

    	$$self.$inject_state = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    		if ("shouldFilter" in $$props) $$invalidate(9, shouldFilter = $$props.shouldFilter);
    		if ("word" in $$props) $$invalidate(1, word = $$props.word);
    		if ("answer" in $$props) $$invalidate(2, answer = $$props.answer);
    		if ("meaning" in $$props) $$invalidate(10, meaning = $$props.meaning);
    		if ("userInput" in $$props) $$invalidate(3, userInput = $$props.userInput);
    		if ("showHint" in $$props) $$invalidate(4, showHint = $$props.showHint);
    		if ("input" in $$props) $$invalidate(5, input = $$props.input);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		heading,
    		word,
    		answer,
    		userInput,
    		showHint,
    		input,
    		handleSubmit,
    		handleChange,
    		handleShowHint,
    		shouldFilter,
    		meaning,
    		input_1_binding
    	];
    }

    class Quizz extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			heading: 0,
    			shouldFilter: 9,
    			word: 1,
    			answer: 2,
    			meaning: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quizz",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*word*/ ctx[1] === undefined && !("word" in props)) {
    			console.warn("<Quizz> was created without expected prop 'word'");
    		}

    		if (/*answer*/ ctx[2] === undefined && !("answer" in props)) {
    			console.warn("<Quizz> was created without expected prop 'answer'");
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

    	get word() {
    		throw new Error("<Quizz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set word(value) {
    		throw new Error("<Quizz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get answer() {
    		throw new Error("<Quizz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set answer(value) {
    		throw new Error("<Quizz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get meaning() {
    		throw new Error("<Quizz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meaning(value) {
    		throw new Error("<Quizz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Score.svelte generated by Svelte v3.29.4 */
    const file$6 = "src/components/Score.svelte";

    function create_fragment$6(ctx) {
    	let h1;
    	let span0;
    	let t0;
    	let t1;
    	let span1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			span0 = element("span");
    			t0 = text(/*winCount*/ ctx[0]);
    			t1 = text("\n    - \n    ");
    			span1 = element("span");
    			t2 = text(/*failCount*/ ctx[1]);
    			attr_dev(span0, "class", "answers__correct svelte-1o8ypc6");
    			add_location(span0, file$6, 12, 4, 285);
    			attr_dev(span1, "class", "answers__incorrect svelte-1o8ypc6");
    			add_location(span1, file$6, 14, 4, 345);
    			attr_dev(h1, "class", "answers --clickable svelte-1o8ypc6");
    			add_location(h1, file$6, 11, 0, 225);
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

    			if (!mounted) {
    				dispose = listen_dev(h1, "click", /*handleReset*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*winCount*/ 1) set_data_dev(t0, /*winCount*/ ctx[0]);
    			if (dirty & /*failCount*/ 2) set_data_dev(t2, /*failCount*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
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
    	validate_slots("Score", slots, []);
    	let { winCount = 0 } = $$props;
    	let { failCount = 0 } = $$props;
    	const dispatch = createEventDispatcher();
    	const handleReset = () => dispatch("reset");
    	const writable_props = ["winCount", "failCount"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Score> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("winCount" in $$props) $$invalidate(0, winCount = $$props.winCount);
    		if ("failCount" in $$props) $$invalidate(1, failCount = $$props.failCount);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		winCount,
    		failCount,
    		dispatch,
    		handleReset
    	});

    	$$self.$inject_state = $$props => {
    		if ("winCount" in $$props) $$invalidate(0, winCount = $$props.winCount);
    		if ("failCount" in $$props) $$invalidate(1, failCount = $$props.failCount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [winCount, failCount, handleReset];
    }

    class Score extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { winCount: 0, failCount: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Score",
    			options,
    			id: create_fragment$6.name
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
    const file$7 = "src/components/MultiQuizz.svelte";

    // (64:4) <Button on:click={handleMode}>
    function create_default_slot$2(ctx) {
    	let t0;
    	let t1_value = (/*isRandom*/ ctx[5] ? "Aléatoire" : "Dans l'Ordre") + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("Mode \"");
    			t1 = text(t1_value);
    			t2 = text("\"");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isRandom*/ 32 && t1_value !== (t1_value = (/*isRandom*/ ctx[5] ? "Aléatoire" : "Dans l'Ordre") + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(64:4) <Button on:click={handleMode}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let button;
    	let t0;
    	let score;
    	let t1;
    	let quizz;
    	let t2;
    	let history;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*handleMode*/ ctx[9]);

    	score = new Score({
    			props: {
    				winCount: /*winCount*/ ctx[3],
    				failCount: /*failCount*/ ctx[2]
    			},
    			$$inline: true
    		});

    	score.$on("reset", /*handleReset*/ ctx[8]);

    	const quizz_spread_levels = [
    		/*current*/ ctx[6],
    		{ heading: /*heading*/ ctx[1] },
    		{ shouldFilter: /*shouldFilter*/ ctx[0] }
    	];

    	let quizz_props = {};

    	for (let i = 0; i < quizz_spread_levels.length; i += 1) {
    		quizz_props = assign(quizz_props, quizz_spread_levels[i]);
    	}

    	quizz = new Quizz({ props: quizz_props, $$inline: true });
    	quizz.$on("answer", /*handleAnswer*/ ctx[7]);

    	history = new History({
    			props: { data: /*answers*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			t0 = space();
    			create_component(score.$$.fragment);
    			t1 = space();
    			create_component(quizz.$$.fragment);
    			t2 = space();
    			create_component(history.$$.fragment);
    			attr_dev(div, "class", "btn svelte-bqinyt");
    			add_location(div, file$7, 62, 0, 1492);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			insert_dev(target, t0, anchor);
    			mount_component(score, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(quizz, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(history, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope, isRandom*/ 8224) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			const score_changes = {};
    			if (dirty & /*winCount*/ 8) score_changes.winCount = /*winCount*/ ctx[3];
    			if (dirty & /*failCount*/ 4) score_changes.failCount = /*failCount*/ ctx[2];
    			score.$set(score_changes);

    			const quizz_changes = (dirty & /*current, heading, shouldFilter*/ 67)
    			? get_spread_update(quizz_spread_levels, [
    					dirty & /*current*/ 64 && get_spread_object(/*current*/ ctx[6]),
    					dirty & /*heading*/ 2 && { heading: /*heading*/ ctx[1] },
    					dirty & /*shouldFilter*/ 1 && { shouldFilter: /*shouldFilter*/ ctx[0] }
    				])
    			: {};

    			quizz.$set(quizz_changes);
    			const history_changes = {};
    			if (dirty & /*answers*/ 16) history_changes.data = /*answers*/ ctx[4];
    			history.$set(history_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(score.$$.fragment, local);
    			transition_in(quizz.$$.fragment, local);
    			transition_in(history.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(score.$$.fragment, local);
    			transition_out(quizz.$$.fragment, local);
    			transition_out(history.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			if (detaching) detach_dev(t0);
    			destroy_component(score, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(quizz, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(history, detaching);
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
    	validate_slots("MultiQuizz", slots, []);
    	let { characters = [] } = $$props;
    	let { shouldFilter = true } = $$props;
    	let { heading = undefined } = $$props;
    	let failCount = 0;
    	let winCount = 0;
    	let answers = [];
    	let isRandom = true;
    	let currentIndex = 0;

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

    		if (!isRandom) {
    			const lastIndex = characters.length - 1;
    			if (++currentIndex > lastIndex) currentIndex = 0;
    			$$invalidate(6, current = characters[currentIndex]);
    		} else $$invalidate(6, current = getRandomCharacter());
    	};

    	const handleReset = () => {
    		$$invalidate(3, winCount = 0);
    		$$invalidate(2, failCount = 0);
    		$$invalidate(4, answers = []);
    	};

    	const handleMode = () => {
    		$$invalidate(5, isRandom = !isRandom);

    		if (!isRandom) {
    			currentIndex = 0;
    			$$invalidate(6, current = characters[currentIndex]);
    		} else {
    			$$invalidate(6, current = getRandomCharacter());
    		}
    	};

    	let current = getRandomCharacter();
    	const writable_props = ["characters", "shouldFilter", "heading"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiQuizz> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("characters" in $$props) $$invalidate(10, characters = $$props.characters);
    		if ("shouldFilter" in $$props) $$invalidate(0, shouldFilter = $$props.shouldFilter);
    		if ("heading" in $$props) $$invalidate(1, heading = $$props.heading);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		History,
    		Quizz,
    		Score,
    		characters,
    		shouldFilter,
    		heading,
    		failCount,
    		winCount,
    		answers,
    		isRandom,
    		currentIndex,
    		getRandomCharacter,
    		handleAnswer,
    		handleReset,
    		handleMode,
    		current
    	});

    	$$self.$inject_state = $$props => {
    		if ("characters" in $$props) $$invalidate(10, characters = $$props.characters);
    		if ("shouldFilter" in $$props) $$invalidate(0, shouldFilter = $$props.shouldFilter);
    		if ("heading" in $$props) $$invalidate(1, heading = $$props.heading);
    		if ("failCount" in $$props) $$invalidate(2, failCount = $$props.failCount);
    		if ("winCount" in $$props) $$invalidate(3, winCount = $$props.winCount);
    		if ("answers" in $$props) $$invalidate(4, answers = $$props.answers);
    		if ("isRandom" in $$props) $$invalidate(5, isRandom = $$props.isRandom);
    		if ("currentIndex" in $$props) currentIndex = $$props.currentIndex;
    		if ("current" in $$props) $$invalidate(6, current = $$props.current);
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
    		isRandom,
    		current,
    		handleAnswer,
    		handleReset,
    		handleMode,
    		characters
    	];
    }

    class MultiQuizz extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			characters: 10,
    			shouldFilter: 0,
    			heading: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiQuizz",
    			options,
    			id: create_fragment$7.name
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

    /* src/pages/Kana.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$1 } = globals;
    const file$8 = "src/pages/Kana.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let filters;
    	let t;
    	let multiquizz;
    	let main_transition;
    	let current;

    	filters = new Filters({
    			props: { choicesObject: kana },
    			$$inline: true
    		});

    	filters.$on("change", /*handleChange*/ ctx[1]);

    	multiquizz = new MultiQuizz({
    			props: {
    				heading: "かな",
    				shouldFilter: false,
    				characters: /*characters*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(filters.$$.fragment);
    			t = space();
    			create_component(multiquizz.$$.fragment);
    			add_location(main, file$8, 26, 0, 655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(filters, main, null);
    			append_dev(main, t);
    			mount_component(multiquizz, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const multiquizz_changes = {};
    			if (dirty & /*characters*/ 1) multiquizz_changes.characters = /*characters*/ ctx[0];
    			multiquizz.$set(multiquizz_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filters.$$.fragment, local);
    			transition_in(multiquizz.$$.fragment, local);

    			add_render_callback(() => {
    				if (!main_transition) main_transition = create_bidirectional_transition(main, slide, {}, true);
    				main_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filters.$$.fragment, local);
    			transition_out(multiquizz.$$.fragment, local);
    			if (!main_transition) main_transition = create_bidirectional_transition(main, slide, {}, false);
    			main_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(filters);
    			destroy_component(multiquizz);
    			if (detaching && main_transition) main_transition.end();
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
    	validate_slots("Kana", slots, []);
    	let characters = [];

    	const handleChange = ({ detail: filter }) => {
    		if (!filter) return;
    		const result = [];

    		for (const type in kana) {
    			if (!filter.includes(type)) continue;
    			const chars = kana[type].list;
    			result.push(...chars);
    		}

    		$$invalidate(0, characters = result);
    	};

    	const firstKana = Object.keys(kana)[0];
    	characters = kana[firstKana].list;
    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Kana> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		slide,
    		kana,
    		Filters,
    		MultiQuizz,
    		characters,
    		handleChange,
    		firstKana
    	});

    	$$self.$inject_state = $$props => {
    		if ("characters" in $$props) $$invalidate(0, characters = $$props.characters);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [characters, handleChange];
    }

    class Kana extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Kana",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const colorNames = [
        { word: "赤", answer: "あか", meaning: "le rouge" },
        { word: "青", answer: "あお", meaning: "le bleu" },
        { word: "黄色", answer: ["きいろ", "オウショク"], meaning: "le jaune" },
        { word: "l'orange", answer: ["オレンジ色", "橙色", "だいだいいろ"] },
        { word: "紫", answer: "むらさき", meaning: "le violet" },
        { word: "緑", answer: "みどり", meaning: "le vert" },
        { word: "白", answer: "しろ", meaning: "le blanc" },
        { word: "黒", answer: "くろ", meaning: "le noir" },
        { word: "灰色", answer: ["はいいろ", "カイショク"], meaning: "le gris" },
        { word: "le rose", answer: "ピンク" },
        { word: "茶色", answer: "チャいろ", meaning: "le marron" },
        { word: "le beige", answer: "ベージュ" },
        { word: "薄紫色", answer: ["うすむらさきいろ", "モーブ"], meaning: "le mauve" },
        { word: "le magenta", answer: "マゼンタ" },
        { word: "紅", answer: "くれない", meaning: "le cramoisi" },
        { word: "le cyan", answer: "シアン" },
        { word: "水色", answer: "みずいろ", meaning: "le bleu clair" },
        { word: "l'indigo", answer: "インディゴ" },
        { word: "虹色", answer: "にじいろ", meaning: "couleur arc-en-ciel" },
        { word: "金色", answer: "キンいろ", meaning: "l'or" },
    ];

    var colorNames$1 = {
        list: colorNames,
        ref: "https://www.youtube.com/watch?v=MvaEDg_Hwusat=0s",
    };

    const countryNames = [
        { word: "la France", answer: "フランス" },
        { word: "l'Espagne", answer: "スペイン" },
        { word: "l'Italie", answer: "イタリア" },
        { word: "l'Allemagne", answer: "ドイツ" },
        { word: "le Royaume-Uni", answer: "イギリス" },
        { word: "l'Angleterre", answer: "イングランド" },
        { word: "la Grèce", answer: "ギリシャ" },
        { word: "le Portugal", answer: "ポルトガル" },
        { word: "la Belgique", answer: "ベルギー" },
        { word: "la Suisse", answer: "スイス" },
        { word: "le Luxembourg", answer: "ルクセンブルク" },
        { word: "les Pays-Bas", answer: "オランダ" },
        { word: "la Turquie", answer: "トルコ" },
        { word: "la Syrie", answer: "シリア" },
        { word: "Israël", answer: "イスラエル" },
        { word: "le Qatar", answer: "カタール" },
        { word: "Dubaï", answer: "ドバイ" },
        { word: "la Russie", answer: "ロシア" },
        { word: "l'Algérie", answer: "アルジェリア" },
        { word: "la Tunisie", answer: "チュニジア" },
        { word: "le Maroc", answer: "モロッコ" },
        { word: "l'Égypte", answer: "エジプト" },
        { word: "le Sénégal", answer: "セネガル" },
        { word: "la Côte d'Ivoire", answer: "コートジボワール" },
        { word: "le Congo", answer: "コンゴ" },
        { word: "l'Afrique du Sud", answer: "南アフリカ" },
        { word: "le Canada", answer: "カナダ" },
        { word: "le Québec", answer: "ケベック" },
        { word: "les États-Unis d'Amérique", answer: ["アメリカ合衆国", "アメリカガッシュウコク"] },
        { word: "le Mexique", answer: "メキシコ" },
        { word: "le Brésil", answer: "ブラジル" },
        { word: "l'Argentine", answer: "アルゼンチン" },
        { word: "le Chili", answer: "チリ" },
        { word: "l'Australie", answer: "オーストラリア" },
        { word: "l'Autriche", answer: "オーストリア" },
        { word: "la Nouvelle-Zélande", answer: "ニュージーランド" },
        { word: "Singapour", answer: "シンガポール" },
        { word: "l'Inde", answer: "インド" },
        { word: "la Thaïlande", answer: "タイ" },
        { word: "le Viêt Nam", answer: "ベトナム" },
        { word: "la Chine", answer: ["中国", "チュウゴク"] },
        { word: "la Corée du Sud", answer: ["韓国", "カンコク"] },
        { word: "le Japon", answer: ["日本", "ニホン", "ニッポン"] },
    ];

    var countryNames$1 = {
        list: countryNames,
        ref: "https://www.youtube.com/watch?v=l7T0cqOlcLk&t=0s",
    };

    const domesticAnimals = [
        { meaning: "le Chien", word: "犬", answer: "いぬ" },
        { meaning: "le Chat", word: "猫", answer: "ねこ" },
        { meaning: "l'oiseau", word: "鳥", answer: "とり" },
        { meaning: "le poisson", word: "魚", answer: "さかな" },
        { meaning: "le tanuki", word: "狸", answer: "たぬき" },
        { meaning: "le lapin", word: "兎", answer: "うさぎ" },
        { meaning: "la vache", word: "牛", answer: "うし" },
        { meaning: "le mouton", word: "羊", answer: "ひつじ" },
        { meaning: "la chèvre", word: "山羊", answer: "やぎ" },
        { meaning: "le cochon", word: "豚", answer: "ぶた" },
        { meaning: "le cheval", word: "馬", answer: "うま" },
        { meaning: "le cerf", word: "鹿", answer: "しか" },
        { word: "l'âne", answer: ["ロバ", "驢馬"] },
        { word: "le dromadaire", answer: "ラクダ" },
        { meaning: "la poule", word: "鶏", answer: "にわとり" },
        { meaning: "la souris", word: "鼠", answer: "ねずみ" },
        { word: "l'écureuil", answer: ["リス", "栗鼠"] },
        { meaning: "le hérisson", word: "針鼠", answer: "はりねずみ" },
        { word: "hamster", answer: "ハムスター" },
        { word: "le furet", answer: "フェレット" },
    ];

    var domesticAnimals$1 = {
        list: domesticAnimals,
        ref: "https://www.youtube.com/watch?v=kvSUhd9sWKA&t=0s",
    };

    const domesticEquipment = [
        {
            word: "le lit",
            answer: "ベッド"
        },
        {
            word: "le canapé",
            answer: ["ソファー", "ソファ"]
        },
        {
            word: "le stylo",
            answer: "ペン"
        },
        {
            word: "le stylo-bille",
            answer: "ボールペン"
        },
        {
            word: "le cahier",
            answer: "ノート"
        },
        {
            word: "le calendrier",
            answer: "カレンダー"
        },
        {
            word: "la radio",
            answer: "ラジオ"
        },
        {
            word: "la chaîne Hi-Fi",
            answer: ["ステレオ", "ステレオフォニック"]
        },
        {
            word: "la télévision",
            answer: ["テレビ", "テレビジョン"]
        },
        {
            word: "l'appareil photo",
            answer: "カメラ"
        },
        {
            word: "l'ordinateur",
            answer: "コンピュータ"
        },
        {
            word: "le PC",
            answer: ["パソコン", "パーソナルコンピュータ"]
        },
        {
            word: "le climatiseur",
            answer: "エアコン"
        },
        {
            word: "la télécommande",
            answer: "リモコン"
        },
        {
            word: "la carte de paiement",
            answer: "クレジットカード"
        },
        {
            word: "la porte",
            answer: "ドア"
        },
        {
            word: "la lampe",
            answer: "ランプ"
        },
        {
            word: "la table",
            answer: "ターブル"
        },
        {
            word: "la fourchette",
            answer: "フォーク"
        },
        {
            word: "le couteau",
            answer: "ナイフ"
        },
        {
            word: "la cuillère",
            answer: "スプーン"
        },
        {
            word: "les toilettes",
            answer: ["トイレ", "トイレット"]
        },
    ];

    var domesticEquipment$1 = {
        list: domesticEquipment,
        ref: "https://www.youtube.com/watch?v=rSYYeS0xtx4&t=0s",
    };

    const familyMembers = [
        { word: "夫", answer: "おっと", meaning: "mon époux" },
        { word: "妻", answer: "つま", meaning: "mon épouse" },
        { word: "両親", answer: "リョウシン", meaning: "mes parents" },
        { word: "父", answer: "ちち", meaning: "mon père" },
        { word: "母", answer: "はは", meaning: "ma mère" },
        { word: "子供", answer: "こども", meaning: "mon enfant" },
        { word: "息子", answer: "むすこ", meaning: "mon fils" },
        { word: "娘", answer: "むすめ", meaning: "ma fille" },
        { word: "祖父母", answer: "ソフボ", meaning: "mes grands-parents" },
        { word: "祖父", answer: "ソフ", meaning: "mon grand-père" },
        { word: "祖母", answer: "ソボ", meaning: "ma grand-mère" },
        { word: "孫", answer: "まご", meaning: "mon petit-enfant" },
        { word: "双子", answer: "ふたご", meaning: "mon jumeau / ma jumelle" },

        { word: "兄", answer: "あに", meaning: "mon frère aîné" },
        { word: "弟", answer: "おとうと", meaning: "mon frère cadet" },
        { word: "兄弟", answer: "キョウダイ", meaning: "la fratrie" },

        { word: "姉", answer: "あね", meaning: "ma sœur aînée" },
        { word: "妹", answer: "いもうと", meaning: "ma sœur cadette" },

        { word: "mon cousin", answer: "いとこ" },
        { word: "mon cousin (aîné)", answer: "従兄", meaning: "いとこ" },
        { word: "mon cousin (cadet)", answer: "従弟", meaning: "いとこ" },
        { word: "ma cousine (aîné)", answer: "従姉", meaning: "いとこ" },
        { word: "ma cousine (cadette)", answer: "従妹", meaning: "いとこ" },

        { word: "mon oncle", answer: "おじ" },
        { word: "mon oncle (aîné)", answer: "伯父", meaning: "おじ" },
        { word: "mon oncle (cadet)", answer: "叔父", meaning: "おじ" },

        { word: "ma tante", answer: "おば" },
        { word: "ma tante (aînée)", answer: "伯母", meaning: "おば" },
        { word: "ma tante (cadette)", answer: "叔母", meaning: "おば" },

        { word: "義兄", answer: "ギケイ", meaning: "mon beau-frère (aîné)" },
        { word: "義弟", answer: "ギテイ", meaning: "mon beau-frère (cadet)" },

        { word: "義姉", answer: "ギシ", meaning: "ma belle-sœur (aînée)" },
        { word: "義妹", answer: "ギマイ", meaning: "ma belle-sœur (cadette)" },
    ];

    var familyMembers$1 = {
        list: familyMembers,
        ref: "https://www.youtube.com/watch?v=KJak7DtVtwI&t=0s"
    };

    const firstKanji = [
        { word: "人", meaning: "La Personne", answer: "ひと" },
        { word: "男", meaning: "Homme", answer: "おとこ" },
        { word: "女", meaning: "Femme", answer: "おんな" },
        { word: "子", meaning: "Enfant", answer: "こ" },
        { word: "日", meaning: "Soleil", answer: "ひ" },
        { word: "月", meaning: "Lune", answer: "つき" },
        { word: "時", meaning: "Temps", answer: "とき" },
        { word: "水", meaning: "Eau", answer: "みず" },
        { word: "火", meaning: "Feu", answer: "ひ" },
        { word: "土", meaning: "Terre (matière)", answer: "つち" },
        { word: "風", meaning: "Vent", answer: "かぜ" },
        { word: "空", meaning: "Ciel", answer: "そら" },
        { word: "山", meaning: "Montagne", answer: "やま" },
        { word: "川", meaning: "Rivière", answer: "かわ" },
        { word: "木", meaning: "Arbre", answer: "き" },
        { word: "花", meaning: "Fleur", answer: "はな" },
        { word: "雨", meaning: "Pluie", answer: "あめ" },
        { word: "雪", meaning: "Neige", answer: "ゆき" },
        { word: "金", meaning: "Argent, Monnaie", answer: ["かね", "おかね"] },
        { word: "刀", meaning: "Sabre", answer: "かたな" },
    ];

    var firstKanji$1 = {
        list: firstKanji,
        ref: "https://www.youtube.com/watch?v=3p16KejjEpo&t=0s",
    };

    const numbers = [
        { word: "一", meaning: "1", answer: "イチ" },
        { word: "二", meaning: "2", answer: "ニ" },
        { word: "三", meaning: "3", answer: "サン" },
        { word: "四", meaning: "4", answer: ["シ", "よん"] },
        { word: "五", meaning: "5", answer: "ゴ" },
        { word: "六", meaning: "6", answer: "ロク" },
        { word: "七", meaning: "7", answer: ["シチ", "なな"] },
        { word: "八", meaning: "8", answer: "ハチ" },
        { word: "九", meaning: "9", answer: ["ク", "キュウ"] },
        { word: "十", meaning: "10", answer: "ジュウ" },
        { word: "百", meaning: "100", answer: "ヒャク" },
        { word: "千", meaning: "1000", answer: "セン" },
    ];

    var numbers$1 = {
        list: numbers,
        ref: "https://www.youtube.com/watch?v=FZEA66Nj95c&t=0s",
    };

    const politeness = [
        {
            word: "oui",
            answer: "はい"
        },
        {
            word: "non",
            answer: "いいえ"
        },
        {
            word: "s'il vous plaît",
            answer: ["お願いします", "おねがいします"]
        },
        {
            word: "merci",
            answer: ["ありがとう", "ありがとうございます"]
        },
        {
            word: "il n'y a pas de quoi",
            answer: "どういたしまして"
        },
        {
            word: "bonjour (le matin)",
            answer: ["おはよう", "おはようございます"]
        },
        {
            word: "bonjour (la journée)",
            answer: "こんにちは"
        },
        {
            word: "bonsoir",
            answer: "こんばんは"
        },
        {
            word: "comment vas-tu (allez-vous)",
            answer: ["お元気ですか", "おゲンキですか"]
        },
        {
            word: "oui, je vais bien (réponse)",
            answer: ["はい、元気です", "はい、ゲンキです"]
        },
        {
            word: "au revoir",
            answer: ["さようなら", "またね"]
        },
        {
            word: "bonne nuit",
            answer: ["おやすみ", "おやすみなさい"]
        },
        {
            word: "à demain",
            answer: ["また明日", "またあした"]
        },
        {
            word: "enchanté",
            answer: ["初めまして", "はじめまして", "どうぞ宜しくお願いします", "どうぞよろしくおねがいします"]
        },
        {
            word: "je vous en prie",
            answer: "どうぞ"
        },
        {
            word: "bon appétit",
            answer: "いただきます"
        },
        {
            word: "excuse(z)-moi",
            answer: "すみません"
        },
        {
            word: "pardonne(z)-moi",
            answer: ["ごめん", "ごめんなさい"]
        },
        {
            word: "bon travail",
            answer: ["お疲れ様でした", "おつかれさまでした"]
        },
        {
            word: "j'y vais",
            answer: "いってきます"
        },
        {
            word: "bonne journée / bon départ",
            answer: "いってらっしゃい"
        },
        {
            word: "je suis rentré",
            answer: "ただいま"
        },
        {
            word: "bon retour",
            answer: ["おかえり", "おかえりなさい"]
        },
        {
            word: "bienvenue",
            answer: ["いらっしゃいませ", "ようこそ"]
        },
        {
            word: "je rentre (je dérange)",
            answer: ["お邪魔します", "おジャマします"]
        },
    ];

    var politeness$1 = {
        list: politeness,
        ref: "https://www.youtube.com/watch?v=r4-5fXLGySE&t=0s",
    };

    var vocabulary = {
        "Premier Mots en Kanji": firstKanji$1,
        "Les Formules de Politesse": politeness$1,
        "Le Matériel Domestique": domesticEquipment$1,
        "Le Nom des Pays": countryNames$1,
        "Les Animaux Domestiques": domesticAnimals$1,
        "Les Membres de la Famille": familyMembers$1,
        "Le Nom des Couleurs": colorNames$1,
        "Les Nombres": numbers$1,
    };

    /* src/pages/Vocabulary.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$2 } = globals;
    const file$9 = "src/pages/Vocabulary.svelte";

    function create_fragment$9(ctx) {
    	let main;
    	let filters;
    	let t;
    	let multiquizz;
    	let main_transition;
    	let current;

    	filters = new Filters({
    			props: { choicesObject: vocabulary },
    			$$inline: true
    		});

    	filters.$on("change", /*handleChange*/ ctx[1]);

    	multiquizz = new MultiQuizz({
    			props: {
    				heading: "漢字",
    				shouldFilter: false,
    				characters: /*characters*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(filters.$$.fragment);
    			t = space();
    			create_component(multiquizz.$$.fragment);
    			add_location(main, file$9, 26, 0, 696);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(filters, main, null);
    			append_dev(main, t);
    			mount_component(multiquizz, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const multiquizz_changes = {};
    			if (dirty & /*characters*/ 1) multiquizz_changes.characters = /*characters*/ ctx[0];
    			multiquizz.$set(multiquizz_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filters.$$.fragment, local);
    			transition_in(multiquizz.$$.fragment, local);

    			add_render_callback(() => {
    				if (!main_transition) main_transition = create_bidirectional_transition(main, slide, {}, true);
    				main_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filters.$$.fragment, local);
    			transition_out(multiquizz.$$.fragment, local);
    			if (!main_transition) main_transition = create_bidirectional_transition(main, slide, {}, false);
    			main_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(filters);
    			destroy_component(multiquizz);
    			if (detaching && main_transition) main_transition.end();
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
    	validate_slots("Vocabulary", slots, []);
    	let characters = [];

    	const handleChange = ({ detail: filter }) => {
    		if (!filter) return;
    		const result = [];

    		for (const type in vocabulary) {
    			if (!filter.includes(type)) continue;
    			const words = vocabulary[type].list;
    			result.push(...words);
    		}

    		$$invalidate(0, characters = result);
    	};

    	const firstWords = Object.keys(vocabulary)[0];
    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Vocabulary> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		slide,
    		vocabulary,
    		Filters,
    		MultiQuizz,
    		characters,
    		handleChange,
    		firstWords
    	});

    	$$self.$inject_state = $$props => {
    		if ("characters" in $$props) $$invalidate(0, characters = $$props.characters);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(0, characters = vocabulary[firstWords].list);
    	return [characters, handleChange];
    }

    class Vocabulary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vocabulary",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const exceptions = {
        "300": { second: "ビャク" },
        "600": { first: "ロッ", second: "ピャク" },
        "800": { first: "ハッ", second: "ピャク" },
        "3000": { second: "ゼン" },
        "8000": { first: "ハッ" },
    };

    function unfoldNumber(number) {
        number = number.toString();
        number = number.split("");
        number.reverse();

        const mapFunction = (num, i) => num * Math.pow(10, i);
        const result = number.map(mapFunction);

        return result.reverse();
    }
    function getKansuji(number) {
        const result = unfoldNumber(number);
        let kanji = "";
        let katakana = "";

        for (const num of result) {
            const firstDigit = num.toString()[0];
            const unit = (num / firstDigit).toString();

            const first = numbers.find(v => v.meaning === firstDigit);
            const second = numbers.find(v => unit >= 10 ? v.meaning === unit : false);

            const variants = exceptions[num] || {};

            for (const [i, char] of [first, second].entries())
                if (char !== undefined) {
                    const shouldSkip = i === 0 && firstDigit === "1" && num > 1;
                    if (shouldSkip) continue;

                    const isArray = char.answer instanceof Array;
                    const kana = isArray ? char.answer[1] : char.answer;

                    kanji += char.word;
                    katakana += variants[i === 0 ? "first" : "second"] || kana;
                }
        }

        return {
            kanji,
            katakana,
        };
    }
    function getRandomNumber(max = 9999) {
        const randomFloat = Math.random() * max;
        const randomInt = Math.ceil(randomFloat);

        return randomInt;
    }
    function formatNumber(number) {
        number = number.toString().split("");
        number = number.reverse().join("");

        number = number.replace(/\d{3}/g, m => `${m} `);

        number = number.split("");
        number = number.reverse().join("");

        return number.trim();
    }

    /* src/components/NumberAccents.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$3 } = globals;
    const file$a = "src/components/NumberAccents.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (14:4) <Button on:click={() => showAccents = !showAccents}>
    function create_default_slot$3(ctx) {
    	let t0_value = (/*showAccents*/ ctx[0] ? "Cacher" : "Montrer") + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" les accents");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*showAccents*/ 1 && t0_value !== (t0_value = (/*showAccents*/ ctx[0] ? "Cacher" : "Montrer") + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(14:4) <Button on:click={() => showAccents = !showAccents}>",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#if showAccents}
    function create_if_block$5(ctx) {
    	let ul;
    	let a;
    	let t1;
    	let ul_transition;
    	let current;
    	let each_value = /*numbers*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			a = element("a");
    			a.textContent = "Qu’est-ce que c’est ? 🤔";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a, "class", "accents__link --clickable svelte-mtrqew");
    			attr_dev(a, "href", "https://youtu.be/FZEA66Nj95c?t=522");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$a, 19, 4, 587);
    			attr_dev(ul, "class", "accents svelte-mtrqew");
    			add_location(ul, file$a, 18, 0, 545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, a);
    			append_dev(ul, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*numbers, getKansuji, regex, replaceFunction*/ 6) {
    				each_value = /*numbers*/ ctx[1];
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
    		source: "(18:0) {#if showAccents}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#each numbers as number}
    function create_each_block$3(ctx) {
    	let li;
    	let b;
    	let t0_value = /*number*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let span0;
    	let t2_value = getKansuji(/*number*/ ctx[4]).kanji + "";
    	let t2;
    	let t3;
    	let span1;
    	let raw_value = getKansuji(/*number*/ ctx[4]).katakana.replace(regex, /*replaceFunction*/ ctx[2]) + "";
    	let t4;
    	let li_class_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			b = element("b");
    			t0 = text(t0_value);
    			t1 = space();
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			t4 = space();
    			attr_dev(b, "class", "accents__number svelte-mtrqew");
    			add_location(b, file$a, 24, 8, 793);
    			attr_dev(span0, "class", "accents__kanji svelte-mtrqew");
    			add_location(span0, file$a, 25, 8, 841);
    			attr_dev(span1, "class", "accents__katakana svelte-mtrqew");
    			add_location(span1, file$a, 26, 8, 912);
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(`n${/*number*/ ctx[4]}`) + " svelte-mtrqew"));
    			add_location(li, file$a, 23, 4, 759);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, b);
    			append_dev(b, t0);
    			append_dev(li, t1);
    			append_dev(li, span0);
    			append_dev(span0, t2);
    			append_dev(li, t3);
    			append_dev(li, span1);
    			span1.innerHTML = raw_value;
    			append_dev(li, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(23:4) {#each numbers as number}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let button;
    	let t;
    	let if_block_anchor;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[3]);
    	let if_block = /*showAccents*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "accents__button svelte-mtrqew");
    			add_location(div, file$a, 12, 0, 362);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope, showAccents*/ 129) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*showAccents*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showAccents*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
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
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const regex = /[ビピッゼ]+/g;

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NumberAccents", slots, []);
    	let showAccents = false;
    	const numbers = Object.keys(exceptions);
    	const replaceFunction = m => `<span class="accents__highlight">${m}</span>`;
    	const writable_props = [];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NumberAccents> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, showAccents = !showAccents);

    	$$self.$capture_state = () => ({
    		slide,
    		exceptions,
    		getKansuji,
    		Button,
    		showAccents,
    		numbers,
    		regex,
    		replaceFunction
    	});

    	$$self.$inject_state = $$props => {
    		if ("showAccents" in $$props) $$invalidate(0, showAccents = $$props.showAccents);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showAccents, numbers, replaceFunction, click_handler];
    }

    class NumberAccents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NumberAccents",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/pages/Numbers.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$4 } = globals;
    const file$b = "src/pages/Numbers.svelte";

    // (63:4) {#if showHint}
    function create_if_block$6(ctx) {
    	let div;
    	let h20;
    	let t0;
    	let t1_value = /*answer*/ ctx[7].kanji + "";
    	let t1;
    	let t2;
    	let h21;
    	let t3;
    	let t4_value = /*answer*/ ctx[7].katakana + "";
    	let t4;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h20 = element("h2");
    			t0 = text("Kanji・");
    			t1 = text(t1_value);
    			t2 = space();
    			h21 = element("h2");
    			t3 = text("Kana・");
    			t4 = text(t4_value);
    			add_location(h20, file$b, 64, 12, 1767);
    			add_location(h21, file$b, 65, 12, 1809);
    			attr_dev(div, "class", "number__hint svelte-1stj639");
    			add_location(div, file$b, 63, 8, 1711);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h20);
    			append_dev(h20, t0);
    			append_dev(h20, t1);
    			append_dev(div, t2);
    			append_dev(div, h21);
    			append_dev(h21, t3);
    			append_dev(h21, t4);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*answer*/ 128) && t1_value !== (t1_value = /*answer*/ ctx[7].kanji + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*answer*/ 128) && t4_value !== (t4_value = /*answer*/ ctx[7].katakana + "")) set_data_dev(t4, t4_value);
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
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(63:4) {#if showHint}",
    		ctx
    	});

    	return block;
    }

    // (74:8) <Button type="submit">
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Valider");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(74:8) <Button type=\\\"submit\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let main;
    	let numberaccents;
    	let t0;
    	let score;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let t4;
    	let input0;
    	let t5;
    	let t6;
    	let form;
    	let h1;
    	let t7_value = formatNumber(/*randomNumber*/ ctx[6]) + "";
    	let t7;
    	let t8;
    	let input1;
    	let t9;
    	let button;
    	let t10;
    	let history;
    	let main_transition;
    	let current;
    	let mounted;
    	let dispose;
    	numberaccents = new NumberAccents({ $$inline: true });

    	score = new Score({
    			props: {
    				winCount: /*winCount*/ ctx[2],
    				failCount: /*failCount*/ ctx[3]
    			},
    			$$inline: true
    		});

    	score.$on("reset", /*handleReset*/ ctx[10]);
    	let if_block = /*showHint*/ ctx[1] && create_if_block$6(ctx);

    	button = new Button({
    			props: {
    				type: "submit",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	history = new History({
    			props: { data: /*answers*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(numberaccents.$$.fragment);
    			t0 = space();
    			create_component(score.$$.fragment);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text("De 1 à ");
    			t3 = text(/*max*/ ctx[5]);
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			form = element("form");
    			h1 = element("h1");
    			t7 = text(t7_value);
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			create_component(button.$$.fragment);
    			t10 = space();
    			create_component(history.$$.fragment);
    			add_location(h2, file$b, 60, 4, 1601);
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "2");
    			attr_dev(input0, "max", "9999");
    			add_location(input0, file$b, 61, 4, 1627);
    			attr_dev(h1, "class", "number --clickable svelte-1stj639");
    			add_location(h1, file$b, 69, 8, 1925);
    			attr_dev(input1, "type", "text");
    			input1.value = /*userInput*/ ctx[0];
    			attr_dev(input1, "class", "svelte-1stj639");
    			add_location(input1, file$b, 72, 8, 2058);
    			attr_dev(form, "class", "svelte-1stj639");
    			add_location(form, file$b, 68, 4, 1870);
    			add_location(main, file$b, 57, 0, 1491);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(numberaccents, main, null);
    			append_dev(main, t0);
    			mount_component(score, main, null);
    			append_dev(main, t1);
    			append_dev(main, h2);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(main, t4);
    			append_dev(main, input0);
    			set_input_value(input0, /*max*/ ctx[5]);
    			append_dev(main, t5);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t6);
    			append_dev(main, form);
    			append_dev(form, h1);
    			append_dev(h1, t7);
    			append_dev(form, t8);
    			append_dev(form, input1);
    			append_dev(form, t9);
    			mount_component(button, form, null);
    			append_dev(main, t10);
    			mount_component(history, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[11]),
    					listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[11]),
    					listen_dev(h1, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(input1, "input", /*handleChange*/ ctx[9], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[8]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const score_changes = {};
    			if (dirty & /*winCount*/ 4) score_changes.winCount = /*winCount*/ ctx[2];
    			if (dirty & /*failCount*/ 8) score_changes.failCount = /*failCount*/ ctx[3];
    			score.$set(score_changes);
    			if (!current || dirty & /*max*/ 32) set_data_dev(t3, /*max*/ ctx[5]);

    			if (dirty & /*max*/ 32) {
    				set_input_value(input0, /*max*/ ctx[5]);
    			}

    			if (/*showHint*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showHint*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, t6);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*randomNumber*/ 64) && t7_value !== (t7_value = formatNumber(/*randomNumber*/ ctx[6]) + "")) set_data_dev(t7, t7_value);

    			if (!current || dirty & /*userInput*/ 1 && input1.value !== /*userInput*/ ctx[0]) {
    				prop_dev(input1, "value", /*userInput*/ ctx[0]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			const history_changes = {};
    			if (dirty & /*answers*/ 16) history_changes.data = /*answers*/ ctx[4];
    			history.$set(history_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(numberaccents.$$.fragment, local);
    			transition_in(score.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(button.$$.fragment, local);
    			transition_in(history.$$.fragment, local);

    			add_render_callback(() => {
    				if (!main_transition) main_transition = create_bidirectional_transition(main, slide, {}, true);
    				main_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(numberaccents.$$.fragment, local);
    			transition_out(score.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(button.$$.fragment, local);
    			transition_out(history.$$.fragment, local);
    			if (!main_transition) main_transition = create_bidirectional_transition(main, slide, {}, false);
    			main_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(numberaccents);
    			destroy_component(score);
    			if (if_block) if_block.d();
    			destroy_component(button);
    			destroy_component(history);
    			if (detaching && main_transition) main_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Numbers", slots, []);
    	let userInput = "";
    	let showHint = false;
    	let winCount = 0;
    	let failCount = 0;
    	let answers = [];
    	let max = 9999;
    	let randomNumber = getRandomNumber(max);

    	const handleSubmit = () => {
    		const possibleAnswers = Object.values(answer);
    		const isCorrect = possibleAnswers.includes(userInput);
    		if (isCorrect) $$invalidate(2, winCount++, winCount); else $$invalidate(3, failCount++, failCount);
    		if (answers.length >= 5) answers.pop();

    		$$invalidate(4, answers = [
    			{
    				isCorrect,
    				userInput,
    				answer: randomNumber,
    				word: possibleAnswers.join("・")
    			},
    			...answers
    		]);

    		$$invalidate(0, userInput = "");
    		$$invalidate(6, randomNumber = getRandomNumber(max));
    	};

    	const handleChange = e => {
    		const value = e.target.value;
    		$$invalidate(0, userInput = value.replace(/ /g, ""));
    	};

    	const handleReset = () => {
    		$$invalidate(2, winCount = 0);
    		$$invalidate(3, failCount = 0);
    		$$invalidate(4, answers = []);
    	};

    	const writable_props = [];

    	Object_1$4.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Numbers> was created with unknown prop '${key}'`);
    	});

    	function input0_change_input_handler() {
    		max = to_number(this.value);
    		$$invalidate(5, max);
    	}

    	const click_handler = () => $$invalidate(1, showHint = !showHint);

    	$$self.$capture_state = () => ({
    		slide,
    		scale,
    		Button,
    		History,
    		NumberAccents,
    		Score,
    		formatNumber,
    		getRandomNumber,
    		getKansuji,
    		userInput,
    		showHint,
    		winCount,
    		failCount,
    		answers,
    		max,
    		randomNumber,
    		handleSubmit,
    		handleChange,
    		handleReset,
    		answer
    	});

    	$$self.$inject_state = $$props => {
    		if ("userInput" in $$props) $$invalidate(0, userInput = $$props.userInput);
    		if ("showHint" in $$props) $$invalidate(1, showHint = $$props.showHint);
    		if ("winCount" in $$props) $$invalidate(2, winCount = $$props.winCount);
    		if ("failCount" in $$props) $$invalidate(3, failCount = $$props.failCount);
    		if ("answers" in $$props) $$invalidate(4, answers = $$props.answers);
    		if ("max" in $$props) $$invalidate(5, max = $$props.max);
    		if ("randomNumber" in $$props) $$invalidate(6, randomNumber = $$props.randomNumber);
    		if ("answer" in $$props) $$invalidate(7, answer = $$props.answer);
    	};

    	let answer;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*max*/ 32) {
    			 $$invalidate(6, randomNumber = getRandomNumber(max));
    		}

    		if ($$self.$$.dirty & /*randomNumber*/ 64) {
    			 $$invalidate(7, answer = getKansuji(randomNumber));
    		}
    	};

    	return [
    		userInput,
    		showHint,
    		winCount,
    		failCount,
    		answers,
    		max,
    		randomNumber,
    		answer,
    		handleSubmit,
    		handleChange,
    		handleReset,
    		input0_change_input_handler,
    		click_handler
    	];
    }

    class Numbers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Numbers",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/Nav.svelte generated by Svelte v3.29.4 */
    const file$c = "src/components/Nav.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i].name;
    	child_ctx[7] = list[i].link;
    	return child_ctx;
    }

    // (20:4) <Button on:click={() => isVisible = !isVisible}>
    function create_default_slot$5(ctx) {
    	let t_value = (/*isVisible*/ ctx[2] ? "Fermer" : "Menu") + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isVisible*/ 4 && t_value !== (t_value = (/*isVisible*/ ctx[2] ? "Fermer" : "Menu") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(20:4) <Button on:click={() => isVisible = !isVisible}>",
    		ctx
    	});

    	return block;
    }

    // (23:0) {#if isVisible}
    function create_if_block$7(ctx) {
    	let ul;
    	let ul_transition;
    	let current;
    	let each_value = /*links*/ ctx[1];
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

    			attr_dev(ul, "class", "nav__links svelte-1dzc24w");
    			add_location(ul, file$c, 23, 4, 550);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links, currentLink, handleClick*/ 11) {
    				each_value = /*links*/ ctx[1];
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
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(23:0) {#if isVisible}",
    		ctx
    	});

    	return block;
    }

    // (25:8) {#each links as { name, link }}
    function create_each_block$4(ctx) {
    	let li;
    	let t0_value = /*name*/ ctx[6] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "class", "nav__link svelte-1dzc24w");
    			toggle_class(li, "current", /*link*/ ctx[7] === /*currentLink*/ ctx[0]);
    			add_location(li, file$c, 25, 8, 639);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(
    					li,
    					"click",
    					function () {
    						if (is_function(/*handleClick*/ ctx[3](/*link*/ ctx[7]))) /*handleClick*/ ctx[3](/*link*/ ctx[7]).apply(this, arguments);
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
    			if (dirty & /*links*/ 2 && t0_value !== (t0_value = /*name*/ ctx[6] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*links, currentLink*/ 3) {
    				toggle_class(li, "current", /*link*/ ctx[7] === /*currentLink*/ ctx[0]);
    			}
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
    		source: "(25:8) {#each links as { name, link }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let nav;
    	let button;
    	let t;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[4]);
    	let if_block = /*isVisible*/ ctx[2] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			create_component(button.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(nav, "class", "nav svelte-1dzc24w");
    			add_location(nav, file$c, 18, 0, 405);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			mount_component(button, nav, null);
    			append_dev(nav, t);
    			if (if_block) if_block.m(nav, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope, isVisible*/ 1028) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*isVisible*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isVisible*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(nav, null);
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
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(button);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, []);
    	let { currentLink } = $$props;
    	let { links = [] } = $$props;
    	const dispatch = createEventDispatcher();

    	const handleClick = link => () => {
    		$$invalidate(2, isVisible = false);
    		dispatch("change", { link });
    	};

    	let isVisible = false;
    	const writable_props = ["currentLink", "links"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(2, isVisible = !isVisible);

    	$$self.$$set = $$props => {
    		if ("currentLink" in $$props) $$invalidate(0, currentLink = $$props.currentLink);
    		if ("links" in $$props) $$invalidate(1, links = $$props.links);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		createEventDispatcher,
    		Button,
    		currentLink,
    		links,
    		dispatch,
    		handleClick,
    		isVisible
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentLink" in $$props) $$invalidate(0, currentLink = $$props.currentLink);
    		if ("links" in $$props) $$invalidate(1, links = $$props.links);
    		if ("isVisible" in $$props) $$invalidate(2, isVisible = $$props.isVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentLink, links, isVisible, handleClick, click_handler];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { currentLink: 0, links: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentLink*/ ctx[0] === undefined && !("currentLink" in props)) {
    			console.warn("<Nav> was created without expected prop 'currentLink'");
    		}
    	}

    	get currentLink() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentLink(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get links() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set links(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Links.svelte generated by Svelte v3.29.4 */

    const file$d = "src/components/Links.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i].text;
    	child_ctx[2] = list[i].href;
    	child_ctx[3] = list[i].emoji;
    	return child_ctx;
    }

    // (17:4) {#each links as { text, href, emoji }}
    function create_each_block$5(ctx) {
    	let a;
    	let span0;
    	let t0_value = /*text*/ ctx[1] + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*emoji*/ ctx[3] + "";
    	let t2;
    	let t3;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(span0, file$d, 18, 8, 548);
    			attr_dev(span1, "class", "links__emoji svelte-8qkqm9");
    			add_location(span1, file$d, 19, 8, 576);
    			attr_dev(a, "class", "links__link svelte-8qkqm9");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "href", a_href_value = /*href*/ ctx[2]);
    			add_location(a, file$d, 17, 4, 493);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span0);
    			append_dev(span0, t0);
    			append_dev(a, t1);
    			append_dev(a, span1);
    			append_dev(span1, t2);
    			append_dev(a, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(17:4) {#each links as { text, href, emoji }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let each_value = /*links*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "links svelte-8qkqm9");
    			add_location(div, file$d, 15, 0, 426);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*links*/ 1) {
    				each_value = /*links*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Links", slots, []);

    	const links = [
    		{
    			text: "Julien Fontanier",
    			emoji: "😎",
    			href: "https://www.youtube.com/watch?v=Hs8oR3xDokA&list=PLC8UWZPWDAiW-v0OtWMAHdnqDwx7kQ8K-&index=1&t=0"
    		},
    		{
    			text: "Comment écrire avec un clavier Japonais ?",
    			emoji: "🤔",
    			href: "https://www.youtube.com/watch?v=s0Jv-Z9QE0E&t=0s"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Links> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ links });
    	return [links];
    }

    class Links extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Links",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.4 */

    const { Object: Object_1$5 } = globals;

    // (34:0) {#if page}
    function create_if_block$8(ctx) {
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
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(34:0) {#if page}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let nav;
    	let t0;
    	let t1;
    	let links_1;
    	let current;

    	nav = new Nav({
    			props: {
    				links: /*links*/ ctx[2],
    				currentLink: /*type*/ ctx[0]
    			},
    			$$inline: true
    		});

    	nav.$on("change", /*handleChange*/ ctx[3]);
    	let if_block = /*page*/ ctx[1] && create_if_block$8(ctx);
    	links_1 = new Links({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(links_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(links_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const nav_changes = {};
    			if (dirty & /*links*/ 4) nav_changes.links = /*links*/ ctx[2];
    			if (dirty & /*type*/ 1) nav_changes.currentLink = /*type*/ ctx[0];
    			nav.$set(nav_changes);

    			if (/*page*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*page*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
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
    			transition_in(links_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(links_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(links_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let type = "kana";

    	const pages = {
    		kana: { page: Kana, name: "Les Kana" },
    		vocabulary: { page: Vocabulary, name: "Le Vocabulaire" },
    		numbers: { page: Numbers, name: "Les Nombres" }
    	};

    	const handleChange = ({ detail }) => {
    		$$invalidate(0, type = detail.link);
    	};

    	const writable_props = [];

    	Object_1$5.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Kana,
    		Vocabulary,
    		Numbers,
    		Nav,
    		Links,
    		type,
    		pages,
    		handleChange,
    		page,
    		links
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("page" in $$props) $$invalidate(1, page = $$props.page);
    		if ("links" in $$props) $$invalidate(2, links = $$props.links);
    	};

    	let page;
    	let links;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type*/ 1) {
    			 $$invalidate(1, page = pages[type].page);
    		}
    	};

    	 $$invalidate(2, links = Object.keys(pages).map(link => {
    		const name = pages[link].name;
    		return { link, name };
    	}));

    	return [type, page, links, handleChange];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
