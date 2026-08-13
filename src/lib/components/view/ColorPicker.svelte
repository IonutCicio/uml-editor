<script lang="ts">
    import { colorPalette } from "../../palette";

    interface SwatchButton {
        id: string;
        color: string;
        index: number;
    }

    interface FamilyGroup {
        family: string;
        light: SwatchButton[];
        dark: SwatchButton[];
        startIndex: number;
    }

    interface Props {
        open: boolean;
        onSelect: (color: string) => void;
        onClose: () => void;
    }

    let { open, onSelect, onClose }: Props = $props();

    let dialogRef: HTMLDialogElement | undefined = $state();
    let gridRef: HTMLDivElement | undefined = $state();
    let activeIndex = $state(0);

    const familyGroups = $derived.by((): FamilyGroup[] => {
        let runningIndex = 0;
        return colorPalette.map((colorFamily) => {
            const startIndex = runningIndex;
            const light = colorFamily.light.map(
                (color): SwatchButton => ({
                    id: `${colorFamily.family}-light-${runningIndex}`,
                    color,
                    index: runningIndex++
                })
            );
            const dark = colorFamily.dark.map(
                (color): SwatchButton => ({
                    id: `${colorFamily.family}-dark-${runningIndex}`,
                    color,
                    index: runningIndex++
                })
            );
            return { family: colorFamily.family, light, dark, startIndex };
        });
    });

    const totalSwatchCount = $derived(
        familyGroups.reduce((count, group) => count + group.light.length + group.dark.length, 0)
    );

    $effect(() => {
        if (!dialogRef) return;

        if (open && !dialogRef.open) {
            dialogRef.showModal();
            activeIndex = 0;
        } else if (!open && dialogRef.open) {
            dialogRef.close();
        }
    });

    const handleSelect = (color: string) => {
        onSelect(color);
    }

    const handleBackdropClick = (event: MouseEvent) => {
        if (event.target === dialogRef) {
            onClose();
        }
    }

    const handleNativeClose = () => {
        onClose();
    }

    const groupIndexForSwatch = (swatchIndex: number): number => {
        return familyGroups.findIndex((group, i) => {
            const nextGroup = familyGroups[i + 1];
            return swatchIndex >= group.startIndex && (!nextGroup || swatchIndex < nextGroup.startIndex);
        });
    }

    const focusSwatch = (index: number) => {
        activeIndex = index;
        gridRef?.querySelector<HTMLButtonElement>(`[data-swatch-index="${index}"]`)?.focus();
    }

    const handleSwatchKeydown = (event: KeyboardEvent) => {
        if (!(event.currentTarget instanceof HTMLButtonElement)) return;
        const currentIndex = Number(event.currentTarget.dataset.swatchIndex);
        if (Number.isNaN(currentIndex)) return;

        let nextIndex = currentIndex;
        switch (event.key) {
            case "ArrowRight":
                nextIndex = Math.min(currentIndex + 1, totalSwatchCount - 1);
                break;
            case "ArrowLeft":
                nextIndex = Math.max(currentIndex - 1, 0);
                break;
            case "ArrowDown":
                nextIndex = familyGroups[groupIndexForSwatch(currentIndex) + 1]?.startIndex ?? currentIndex;
                break;
            case "ArrowUp":
                nextIndex = familyGroups[groupIndexForSwatch(currentIndex) - 1]?.startIndex ?? currentIndex;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = totalSwatchCount - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        focusSwatch(nextIndex);
    }
</script>

<dialog
    bind:this={dialogRef}
    aria-labelledby="colorPickerHeading"
    class="m-auto w-[min(90vw,28rem)] max-h-[80vh] rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-[2px] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    onclick={handleBackdropClick}
    onclose={handleNativeClose}
>
    <div class="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
        <h2 id="colorPickerHeading" class="text-sm font-semibold">Choose a color</h2>
        <button
            type="button"
            onclick={() => onClose()}
            aria-label="Close color picker"
            class="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-neutral-800"
        >
            <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke-linecap="round" />
            </svg>
        </button>
    </div>

    <div
        bind:this={gridRef}
        role="group"
        aria-label="Color swatches"
        class="max-h-[calc(80vh-3.25rem)] overflow-y-auto p-4"
    >
        {#each familyGroups as group (group.family)}
            <section class="mb-4 last:mb-0">
                <h3 class="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {group.family}
                </h3>
                <div class="flex flex-wrap gap-1.5">
                    {#each group.light as swatch (swatch.id)}
                        <button
                            type="button"
                            data-swatch-index={swatch.index}
                            tabindex={swatch.index === activeIndex ? 0 : -1}
                            style:background-color={swatch.color}
                            title={swatch.color}
                            aria-label="{group.family} light shade, {swatch.color}"
                            onclick={() => handleSelect(swatch.color)}
                            onkeydown={handleSwatchKeydown}
                            class="h-8 w-8 shrink-0 rounded-md ring-1 ring-inset ring-black/10 shadow-sm transition-transform motion-reduce:transition-none hover:scale-110 motion-reduce:hover:scale-100 hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                        ></button>
                    {/each}
                    {#each group.dark as swatch (swatch.id)}
                        <button
                            type="button"
                            data-swatch-index={swatch.index}
                            tabindex={swatch.index === activeIndex ? 0 : -1}
                            style:background-color={swatch.color}
                            title={swatch.color}
                            aria-label="{group.family} dark shade, {swatch.color}"
                            onclick={() => handleSelect(swatch.color)}
                            onkeydown={handleSwatchKeydown}
                            class="h-8 w-8 shrink-0 rounded-md ring-1 ring-inset ring-black/10 shadow-sm transition-transform motion-reduce:transition-none hover:scale-110 motion-reduce:hover:scale-100 hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                        ></button>
                    {/each}
                </div>
            </section>
        {/each}
    </div>
</dialog>
