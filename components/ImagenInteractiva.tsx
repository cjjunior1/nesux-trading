"use client";
import Image from "next/image";

export default function ImagenInteractiva({ src, alt, width, height, className }: { src: string; alt: string; width: number; height: number; className?: string; }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={(e: any) => {
        e.target.onerror = null;
        e.target.src = '/img/logo-placeholder.png';
      }}
    />
  );
}