"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Project = {
  title: string;
  details: string;
  images: string[];
  video?: string;
};

type Section = {
  category: string;
  description: string;
  projects: Project[];
};

type OpenImage = {
  sectionIndex: number;
  projectIndex: number;
  imageIndex: number;
};

type ProjectGalleryProps = {
  sections: Section[];
};

export default function ProjectGallery({ sections }: ProjectGalleryProps) {
  const [openImage, setOpenImage] = useState<OpenImage | null>(null);

  const activeProject = useMemo(() => {
    if (!openImage) return null;
    return sections[openImage.sectionIndex]?.projects[openImage.projectIndex] ?? null;
  }, [openImage, sections]);

  const activeImageSrc = activeProject?.images[openImage?.imageIndex ?? 0] ?? "";

  const closeLightbox = () => setOpenImage(null);

  const moveImage = useCallback((direction: 1 | -1) => {
    if (!openImage || !activeProject) return;
    const total = activeProject.images.length;
    const nextIndex = (openImage.imageIndex + direction + total) % total;
    setOpenImage({ ...openImage, imageIndex: nextIndex });
  }, [activeProject, openImage]);

  useEffect(() => {
    if (!openImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
      if (event.key === "ArrowLeft") {
        moveImage(-1);
      }
      if (event.key === "ArrowRight") {
        moveImage(1);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openImage, activeProject, moveImage]);

  useEffect(() => {
    if (!openImage) {
      document.body.style.overflow = "";
      return;
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [openImage]);

  return (
    <>
      <div className="grid gap-16">
        {sections.map((section, sectionIndex) => (
          <section key={section.category}>
            <div className="mb-8">
              <p className="uppercase tracking-[0.25em] text-xs text-amber-400 mb-3">
                DC Joinery Portfolio
              </p>

              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {section.category}
              </h2>

              <p className="text-neutral-400 max-w-3xl">
                {section.description}
              </p>
            </div>

            <div className="grid gap-8">
              {section.projects.map((project, projectIndex) => (
                <article
                  key={project.title}
                  className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
                >
                  <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-0">
                    <button
                      type="button"
                      onClick={() => setOpenImage({ sectionIndex, projectIndex, imageIndex: 0 })}
                      className="relative min-h-[320px] text-left"
                      aria-label={`Open gallery for ${project.title}`}
                    >
                      <Image
                        src={project.images[0]}
                        alt={project.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        quality={75}
                        className="object-cover"
                      />
                    </button>

                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        {project.title}
                      </h3>

                      <p className="text-neutral-300 text-lg mb-8">
                        {project.details}
                      </p>

                      <Link
                        href="/contact"
                        className="inline-block w-fit bg-amber-400 text-black px-7 py-4 rounded-full font-semibold hover:bg-amber-300 transition"
                      >
                        Get a Quote
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 md:p-6 bg-black/30">
                    {project.images.map((image, imageIndex) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() =>
                          setOpenImage({ sectionIndex, projectIndex, imageIndex })
                        }
                        className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 text-left"
                        aria-label={`Open ${project.title} image ${imageIndex + 1}`}
                      >
                        <Image
                          src={image}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                          quality={75}
                          className="object-cover hover:scale-110 transition duration-700"
                        />
                      </button>
                    ))}

                    {"video" in project && project.video && (
                      <a
                        href={project.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center aspect-square rounded-2xl border border-white/10 bg-neutral-900 text-center p-4 hover:bg-neutral-800 transition"
                      >
                        <span className="text-sm font-semibold">
                          ▶ View Utility Room Video
                        </span>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {openImage && activeProject && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 p-4"
          onClick={closeLightbox}
          role="presentation"
        >
          <div
            className="mx-auto flex h-[100dvh] w-full max-w-7xl flex-col gap-3 overflow-hidden"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-neutral-300">{activeProject.title}</p>
                <p className="text-xs text-neutral-500">
                  {openImage.imageIndex + 1} / {activeProject.images.length}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveImage(-1)}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-3 text-white transition hover:bg-white/15"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(1)}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-3 text-white transition hover:bg-white/15"
                  aria-label="Next image"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="rounded-lg bg-white/10 px-3 py-2 text-white"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <button
                type="button"
                onClick={() => moveImage(-1)}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 px-4 py-3 text-2xl text-white/90 backdrop-blur transition hover:bg-black/70"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => moveImage(1)}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 px-4 py-3 text-2xl text-white/90 backdrop-blur transition hover:bg-black/70"
                aria-label="Next image"
              >
                ›
              </button>
              <div className="relative flex h-full min-h-0 min-w-full items-center justify-center p-4">
                <Image
                  src={activeImageSrc}
                  alt={`${activeProject.title} image ${openImage.imageIndex + 1}`}
                  fill
                  sizes="100vw"
                  unoptimized
                  className="object-contain p-4"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
