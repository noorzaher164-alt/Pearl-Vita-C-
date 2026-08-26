'use client';

import { useActionState, useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { updateAvatarAction, type ActionResult } from '@/app/actions/portal';
import type { Dictionary } from '@/lib/i18n';

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round((h * maxSize) / w); w = maxSize; }
          else { w = Math.round((w * maxSize) / h); h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unavailable')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AvatarUpload({
  d,
  userId,
  currentSrc,
  name,
  size = 88,
}: {
  d: Dictionary;
  userId: string;
  currentSrc: string | null;
  name: string;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentSrc);
  const [imgError, setImgError] = useState(false);
  const [dataUrl, setDataUrl] = useState('');
  const [state, formAction] = useActionState<ActionResult, FormData>(updateAvatarAction, {});

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImage(file, 200);
    setPreview(resized);
    setImgError(false);
    setDataUrl(resized);
  }

  function handleRemove() {
    setPreview(null);
    setImgError(false);
    setDataUrl('__remove__');
    if (inputRef.current) inputRef.current.value = '';
  }

  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const showImage = preview && !imgError;

  return (
    <form action={formAction} className="flex flex-col items-center gap-3">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="avatarDataUrl" value={dataUrl === '__remove__' ? '' : dataUrl} />

      <div className="group relative">
        <span
          className="inline-grid shrink-0 place-items-center overflow-hidden rounded-pill border border-line bg-blush ring-4 ring-white dark:ring-neutral-800"
          style={{ width: size, height: size }}
        >
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              width={size}
              height={size}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="font-brand text-plum" style={{ fontSize: Math.round(size * 0.34) }}>
              {initials}
            </span>
          )}
        </span>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center rounded-pill bg-black/40 opacity-0 transition group-hover:opacity-100"
          aria-label={d.settings.changeAvatar}
        >
          <Camera className="h-6 w-6 text-white" strokeWidth={1.75} />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
        aria-label={d.settings.changeAvatar}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-control border border-line bg-white px-3 py-1.5 text-caption font-semibold text-plum transition hover:bg-blush"
        >
          {d.settings.changeAvatar}
        </button>
        {showImage ? (
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-control border border-line bg-white p-1.5 text-danger transition hover:bg-red-50"
            aria-label={d.settings.removeAvatar}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>

      {dataUrl ? (
        <button
          type="submit"
          className="rounded-control bg-plum px-4 py-1.5 text-caption font-semibold text-white transition hover:bg-plum-dark"
        >
          {d.common.save}
        </button>
      ) : null}

      {state.error === 'too_large' ? (
        <p className="text-caption text-danger">{d.settings.avatarTooLarge}</p>
      ) : null}
      {state.ok ? (
        <p className="text-caption text-emerald-600">{d.settings.avatarUpdated}</p>
      ) : null}
    </form>
  );
}
