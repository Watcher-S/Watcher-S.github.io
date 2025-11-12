async function parseSchema(viewdiv){
    let url = viewdiv.attributes['schema-url'].textContent;
    var resp = await fetch(url);
    var schema = await resp.json();
    return schema
}

function parseInlineSchema(viewdiv){
    let inline = JSON.parse(viewdiv.textContent);
    
    let baseSchema = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    }

    let schema = Object.assign({}, baseSchema, inline)
    return schema
}

window.onload = function(){
    // Find all the <vegachart> elements.
    let viewDivs = document.querySelectorAll('vegachart');

    function wireExternalControls(container, result){
        if(container.getAttribute('data-external-controls') !== 'true') return;
        const controls = document.querySelector(`[data-controls-for='${container.id}']`);
        if(!controls) return;
        controls.querySelectorAll('[data-signal]').forEach(el => {
            const sig = el.getAttribute('data-signal');
            // Initialize UI with current signal value if present
            try {
                const current = result.view.signal(sig);
                if(el.tagName === 'INPUT' && el.type === 'range' && typeof current === 'number') {
                    el.value = current;
                } else if(el.tagName === 'SELECT' && typeof current === 'string') {
                    el.value = current;
                }
            } catch(e) {/* ignore if signal not yet defined */}
            const handler = () => {
                let val = (el.type === 'range') ? +el.value : el.value;
                result.view.signal(sig, val).run();
            };
            el.addEventListener('input', handler);
            el.addEventListener('change', handler);
        });
    }

    // Replace all <vegachart> html contents with proper vegalite charts.
    for (let index = 0; index < viewDivs.length; index++) {
        const el = viewDivs[index];
        // Provide a visible placeholder so a zero-width container isn't mistaken for a missing chart
        if(!el.style.minHeight) {
            el.style.minHeight = '300px';
        }
        const embedOpts = {actions: false};
        const doEmbed = (schema) => {
            // If the spec uses width:"container" ensure the element can actually size
            if(schema && JSON.stringify(schema).includes('"width":"container"')){
                // Force block display & full width; allow override by author
                if(!el.style.display) el.style.display = 'block';
                if(!el.style.width) el.style.width = '100%';
            }
            return vegaEmbed(el, schema, embedOpts)
                .then(res => { wireExternalControls(el, res); })
                .catch(err => {
                    console.error('Vega embed failed for', el, err);
                    el.innerHTML = '<pre style="color:#b00;white-space:pre-wrap;">Vega-Lite embed error: '+ (err && err.message ? err.message : err) + '\nCheck console for details.</pre>';
                });
        };
        if ('schema-url' in el.attributes) {
            parseSchema(el)
                .then(schema => doEmbed(schema))
                .catch(err => {
                    console.error('Failed to fetch schema for', el, err);
                    el.innerHTML = '<pre style="color:#b00;white-space:pre-wrap;">Failed to load chart JSON: '+ (err && err.message ? err.message : err) + '</pre>';
                });
        } else {
            const schema = parseInlineSchema(el);
            doEmbed(schema);
        }
    }
}
