<script lang="ts">
    import { paper } from "$lib/utils";
    import * as joint from "@joint/core";
    import { Scan, ZoomIn, ZoomOut } from "@lucide/svelte";

    let zoom: number = $state(100);
    let zoomX: number = 0;
    let zoomY: number = 0;

    const MIN_ZOOM: number = 10;
    const MAX_ZOOM: number = 200;

    function updateZoomWithDelta(x: number, y: number, delta: number) {
        zoom = Math.min(Math.max(zoom + delta * 10, MIN_ZOOM), MAX_ZOOM);
        zoomX = x;
        zoomY = y;
    }

    paper.on(
        "blank:mousewheel",
        function (
            event: joint.dia.Event,
            _x: number,
            _y: number,
            delta: number,
        ) {
            event.preventDefault();
            updateZoomWithDelta(event.clientX || 0, event.clientY || 0, delta);
        },
    );

    paper.on(
        "element:mousewheel link:mousewheel",
        function (
            _elementView: joint.dia.ElementView,
            event: joint.dia.Event,
            _x: number,
            _y: number,
            delta: number,
        ) {
            event.preventDefault();
            updateZoomWithDelta(event.clientX || 0, event.clientY || 0, delta);
        },
    );

    $effect(() => {
        const x = zoomX;
        const y = zoomY;

        const initialLocalPoint = paper.clientToLocalPoint({ x, y });
        const scale = zoom / 100;
        paper.scale(scale);
        const scaledLocalPoint = paper.clientToLocalPoint({ x, y });

        const dx = (scaledLocalPoint.x - initialLocalPoint.x) * scale;
        const dy = (scaledLocalPoint.y - initialLocalPoint.y) * scale;

        const translate = paper.translate();
        paper.translate(translate.tx + dx, translate.ty + dy);
    });
</script>

<svelte:window
    onkeydown={function (event: KeyboardEvent) {
        if (
            event.target instanceof HTMLElement &&
            (event.target.tagName == "INPUT" ||
                event.target.tagName == "TEXTAREA" ||
                event.target.isContentEditable)
        ) {
            return;
        }

        if (!(event.ctrlKey || event.metaKey)) {
            return;
        }

        if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            zoom = Math.min(Math.max(zoom + 10, MIN_ZOOM), MAX_ZOOM);
            return;
        }

        if (event.key === "-") {
            event.preventDefault();
            zoom = Math.min(Math.max(zoom - 10, MIN_ZOOM), MAX_ZOOM);
            return;
        }

        if (event.key === "0") {
            event.preventDefault();
            zoom = 100;
            paper.translate(0, 0);
            return;
        }
    }}
/>

<button
    class="grid place-items-center rounded-md w-7 h-7 hover:bg-gray-MAX_ZOOM"
    onclick={() => (zoom = Math.max(MIN_ZOOM, zoom - 10))}
>
    <ZoomOut size={16} />
</button>
<input
    type="number"
    min={MIN_ZOOM}
    max={MAX_ZOOM}
    bind:value={zoom}
    class="w-14"
/>
<button
    class="grid place-items-center rounded-md w-7 h-7 hover:bg-gray-200"
    onclick={() => (zoom = Math.min(zoom + 10, MAX_ZOOM))}
>
    <ZoomIn size={16} />
</button>
<button
    title="Reset view"
    class="icon"
    onclick={() => {
        paper.translate(0, 0);
        zoom = 100;
    }}
>
    <Scan size={16} />
</button>
