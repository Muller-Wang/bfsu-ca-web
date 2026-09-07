import Image from "next/image";

export function ClubLogo({ size = 52 }: { size?: number }) {
  return <Image src="/club-logo.png" alt="北外创客俱乐部 LOGO" width={size} height={size} className="club-logo" />;
}

export function ClubBrand({ compact = false }: { compact?: boolean }) {
  return <span className={`club-brand ${compact ? "club-brand-compact" : ""}`}><ClubLogo size={compact ? 42 : 52} /><span>北外创客俱乐部<small>BFSU MAKERS CLUB</small></span></span>;
}
