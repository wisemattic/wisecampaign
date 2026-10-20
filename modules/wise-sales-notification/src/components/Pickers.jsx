import React, { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

const Lines = ({ dark = false, accent = false }) => (
    <div className="flex-1 space-y-1 min-w-0">
        <div className={`h-1 w-1/2 rounded-full ${dark ? 'bg-slate-600' : 'bg-slate-200'}`} />
        <div className={`h-1.5 w-full rounded-full ${accent ? 'bg-sky-400' : dark ? 'bg-slate-400' : 'bg-slate-400'}`} />
        <div className={`h-1 w-2/3 rounded-full ${dark ? 'bg-slate-600' : 'bg-slate-200'}`} />
    </div>
);

/**
 * Small drawing of each popup template for the template cards.
 */
export function TemplateSketch({ id }) {
    switch (id) {
        case 'template_2':
            return (
                <div className="w-full h-11 bg-white rounded-full shadow-sm flex items-center gap-2 px-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0" />
                    <Lines />
                </div>
            );
        case 'template_3':
            return (
                <div className="w-full h-full rounded-md bg-gradient-to-br from-violet-200 via-sky-100 to-rose-100 flex items-center px-1.5">
                    <div className="w-full h-11 bg-white/70 backdrop-blur border border-solid border-white rounded-xl shadow-sm flex items-center gap-2 px-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-200 shrink-0" />
                        <Lines />
                    </div>
                </div>
            );
        case 'template_4':
            return (
                <div className="w-4/5 h-8 bg-white border border-solid border-slate-200 rounded-md flex items-center gap-1.5 px-1.5">
                    <div className="w-5 h-5 rounded bg-slate-200 shrink-0" />
                    <Lines />
                </div>
            );
        case 'template_5':
            return (
                <div className="w-full h-11 bg-white rounded-xl shadow-sm border-0 border-l-4 border-solid border-[#776EFF] flex items-center gap-2 px-2">
                    <div className="w-7 h-7 rounded-md bg-slate-200 shrink-0" />
                    <Lines />
                </div>
            );
        case 'template_6':
            return (
                <div className="w-full h-11 bg-slate-900 rounded-xl border border-solid border-slate-800 flex items-center gap-2 px-2">
                    <div className="w-7 h-7 rounded-md bg-slate-700 border border-solid border-slate-600 shrink-0" />
                    <Lines dark accent />
                </div>
            );
        default:
            return (
                <div className="w-full h-11 bg-white rounded-lg shadow-sm flex items-center gap-2 px-2">
                    <div className="w-7 h-7 rounded-md bg-slate-200 shrink-0" />
                    <Lines />
                </div>
            );
    }
}

/**
 * Mini screen with the popup drawn in the chosen corner.
 */
export function CornerSketch({ id, active }) {
    const [v, h] = id.split('-');
    return (
        <div className={`relative w-full h-10 rounded-md border border-solid ${active ? 'border-blue-200 bg-white' : 'border-slate-200 bg-slate-50'}`}>
            <span
                className={`absolute w-6 h-2 rounded-sm ${active ? 'bg-blue-600' : 'bg-slate-300'}`}
                style={{ [v]: 5, [h]: 5 }}
            />
        </div>
    );
}

/**
 * Uploaded product photos and logos. Opens the WordPress media library; drag to reorder.
 */
export function ImageGallery({ images, onChange }) {
    const [dragIndex, setDragIndex] = useState(null);

    const openLibrary = () => {
        const media = window.wp?.media;
        if (!media) return;
        const frame = media({
            title: 'Product Photos / Logos',
            button: { text: 'Use these images' },
            library: { type: 'image' },
            multiple: true,
        });
        frame.on('select', () => {
            const added = frame.state().get('selection').toJSON().map((a) => {
                const sizes = a.sizes || {};
                return {
                    id: a.id,
                    thumb: (sizes.thumbnail || sizes.medium || sizes.full || { url: a.url }).url,
                    url: (sizes.medium || sizes.full || { url: a.url }).url,
                };
            });
            const known = new Set(images.map((img) => img.id));
            onChange([...images, ...added.filter((img) => !known.has(img.id))]);
        });
        frame.open();
    };

    const move = (from, to) => {
        if (from === null || from === to) return;
        const next = [...images];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onChange(next);
    };

    return (
        <div className="grid grid-cols-4 gap-2">
            {images.map((img, index) => (
                <div
                    key={img.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                        move(dragIndex, index);
                        setDragIndex(null);
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    className={`relative aspect-square rounded-lg overflow-hidden border border-solid bg-white cursor-move group ${dragIndex === index ? 'border-blue-400 opacity-50' : 'border-slate-200'}`}
                >
                    <img src={img.thumb} alt="" className="w-full h-full object-contain" draggable={false} />
                    <button
                        type="button"
                        onClick={() => onChange(images.filter((i) => i.id !== img.id))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                    >
                        <X size={11} />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={openLibrary}
                className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 text-slate-400 hover:text-blue-600 flex flex-col items-center justify-center gap-1 transition-colors"
            >
                <ImagePlus size={18} />
                <span className="text-[9px] font-black uppercase tracking-wider">Add</span>
            </button>
        </div>
    );
}
