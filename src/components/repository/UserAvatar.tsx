import { useEffect, useState } from 'react';

// Google profile photos (lh3.googleusercontent.com) reject requests that carry
// the app origin as Referer, so the photo must load with referrerPolicy="no-referrer".
// If the image still fails, fall back to the initial letter instead of a broken icon.
export function UserAvatar({ name, avatar, className }: { name: string; avatar?: string; className: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [avatar]);
  if (avatar && !failed) {
    return <img src={avatar} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={`${className} rounded-full object-cover`} />;
  }
  return <span aria-hidden className={`${className} flex items-center justify-center rounded-full bg-primary/15 font-semibold text-primary`}>{name.trim().charAt(0).toUpperCase() || 'G'}</span>;
}
